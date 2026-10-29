import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { randomUUID, createHash } from 'node:crypto';
import pg from 'pg';
import sharp from 'sharp';
const database = process.env.TEST_DATABASE_URL;
const cwd = new URL('../', import.meta.url);

// Cada execução usa um schema aleatório; nunca limpa tabelas existentes.
test('API integrada: sessão, permissões, persistência, interações e fotos', { skip: !database, timeout: 60000 }, async () => {
 const base = new pg.Pool({ connectionString: database });
 const schema = `test_${randomUUID().replaceAll('-', '')}`;
 await base.query(`CREATE SCHEMA ${schema}`);
 const url = new URL(database); url.searchParams.set('options', `-c search_path=${schema},public`);
 const pool = new pg.Pool({ connectionString: url.href });
 const objects = new Map();
 const storage = createServer(async (req, res) => {
  if (req.method === 'PUT') {
   const chunks = []; for await (const chunk of req) chunks.push(chunk);
   objects.set(req.url.split('?')[0], Buffer.concat(chunks)); res.setHeader('ETag', '"test"'); res.end();
  } else {
   const body = objects.get(req.url.split('?')[0]);
   if (!body) { res.statusCode = 404; res.end(); } else { res.setHeader('Content-Type', 'image/webp'); res.end(body); }
  }
 });
 await new Promise(resolve => storage.listen(0, '127.0.0.1', resolve));
 const portProbe = createServer(); await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
 const port = portProbe.address().port; await new Promise(resolve => portProbe.close(resolve));
 const origin = `http://127.0.0.1:${port}`;
 const env = { ...process.env, DATABASE_URL: url.href, NODE_ENV: 'test', PORT: String(port), APP_ORIGIN: origin, GOOGLE_CLIENT_ID: 'test-client', BETA_ALLOWED_EMAILS: 'a@example.com,b@example.com', BUCKET_NAME: 'test', BUCKET_REGION: 'us-east-1', BUCKET_ENDPOINT: `http://127.0.0.1:${storage.address().port}`, BUCKET_ACCESS_KEY_ID: 'test', BUCKET_SECRET_ACCESS_KEY: 'test' };
 let server;
 try {
  for (let i=0;i<2;i++) {
   const migration = spawn(process.execPath, ['src/migrate.js'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
   let errors = ''; migration.stderr.on('data', c => errors += c);
   const [code] = await once(migration, 'exit'); assert.equal(code, 0, errors);
  }
  assert.equal((await pool.query('SELECT * FROM schema_migrations')).rowCount, 1);
  const tokens = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64)];
  const users = [];
  for (const [i, email] of ['a@example.com','b@example.com','outsider@example.com'].entries()) {
   const { rows: [user] } = await pool.query('INSERT INTO users(google_sub,email,name) VALUES($1,$2,$3) RETURNING id', [`google-${i}`, email, `Jogador ${i}`]);
   users.push(user.id);
   await pool.query("INSERT INTO sessions VALUES($1,$2,now()+interval '1 day')", [createHash('sha256').update(tokens[i]).digest('hex'), user.id]);
  }
  server = spawn(process.execPath, ['src/index.js'], { cwd, env, stdio: ['ignore','pipe','pipe'] });
  let errors = ''; server.stderr.on('data', c => errors += c);
  await new Promise((resolve, reject) => {
   server.stdout.on('data', c => { if (c.toString().includes('API pronta')) resolve(); });
   server.once('exit', code => reject(new Error(`API saiu ${code}: ${errors}`)));
  });
  const request = (path, { token = tokens[0], method = 'GET', body, requestOrigin = origin } = {}) => fetch(`${origin}/api${path}`, { method, headers: { ...(token ? { Cookie: `levanta=${token}` } : {}), Origin: requestOrigin, ...(!(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) }, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  assert.equal((await request('/feed', { token: '' })).status, 401);
  assert.equal((await request('/feed', { token: tokens[2] })).status, 401);
  assert.equal((await request('/auth/google', { method: 'POST', body: { credential: 'not-a-token' } })).status, 401);
  assert.equal((await request('/posts', { method: 'POST', requestOrigin: 'https://evil.example', body: { caption: 'x' } })).status, 403);
  assert.equal((await request('/posts', { method: 'POST', body: { caption: '' } })).status, 400);
  assert.equal((await request('/posts', { method: 'POST' })).status, 400);
  const created = await request('/posts', { method: 'POST', body: { caption: 'Nosso primeiro jogo' } });
  assert.equal(created.status, 201); const { id } = await created.json();
  for (let i=0; i<2; i++) assert.equal((await request(`/posts/${id}/like`, { token: tokens[1], method: 'PUT', body: { active: true } })).status, 200);
  assert.equal((await request(`/posts/${id}/save`, { method: 'PUT', body: { active: true } })).status, 200);
  assert.equal((await request(`/posts/${id}/comments`, { token: tokens[1], method: 'POST', body: { text: 'Boa!' } })).status, 201);
  let feed = await (await request('/feed')).json();
  assert.equal(feed.posts[0].likes, 1); assert.equal(feed.posts[0].comments[0].playerId, users[1]);
  assert.deepEqual(feed.saved, [id]);
  const other = await (await request('/feed', { token: tokens[1] })).json();
  assert.deepEqual(other.saved, []); assert.deepEqual(other.liked, [id]); assert.equal(other.posts[0].likes, 0);
  assert.equal((await request(`/posts/${id}`, { token: tokens[1], method: 'DELETE' })).status, 404);
  const invalid = new FormData(); invalid.append('photo', new Blob(['bad image'], { type: 'image/png' }), 'fake.png');
  assert.equal((await request('/uploads', { method: 'POST', body: invalid })).status, 400);
  const png = await sharp({ create: { width: 12, height: 8, channels: 3, background: '#00aa44' } }).png().toBuffer();
  const form = new FormData(); form.append('photo', new Blob([png], { type: 'image/png' }), 'game.png');
  const upload = await request('/uploads', { method: 'POST', body: form });
  assert.equal(upload.status, 201, await upload.clone().text()); const { uploadId } = await upload.json();
  assert.equal((await request('/posts', { token: tokens[1], method: 'POST', body: { caption: '', uploadId } })).status, 400);
  assert.equal((await request(`/media/${uploadId}`, { token: tokens[1] })).status, 404);
  assert.equal((await request('/posts', { method: 'POST', body: { caption: 'Foto', uploadId } })).status, 201);
  const media = await request(`/media/${uploadId}`, { token: tokens[1] }); assert.equal(media.status, 200);
  assert.equal((await sharp(Buffer.from(await media.arrayBuffer())).metadata()).format, 'webp');
  assert.equal((await request(`/media/${uploadId}`, { token: '' })).status, 401);
  // Sessão e conteúdo sobrevivem a novas consultas; logout revoga o token no banco.
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM posts')).rows[0].n, 2);
  assert.equal((await request('/auth/logout', { method: 'POST' })).status, 200);
  assert.equal((await request('/auth/me')).status, 401);
  await pool.query("UPDATE sessions SET expires_at=now()-interval '1 second' WHERE user_id=$1", [users[1]]);
  assert.equal((await request('/auth/me', { token: tokens[1] })).status, 401);
  await pool.query("UPDATE sessions SET expires_at=now()+interval '1 day' WHERE user_id=$1", [users[1]]);
  assert.equal((await request(`/posts/${id}/like`, { token: tokens[1], method: 'PUT', body: { active: false } })).status, 200);
  feed = await (await request('/feed', { token: tokens[1] })).json();
  assert.equal(feed.posts.find(p => p.id === id).likes, 0);
 } finally {
  if (server && server.exitCode === null) { server.kill('SIGTERM'); await once(server, 'exit'); }
  storage.closeAllConnections(); await new Promise(resolve => storage.close(resolve));
  await pool.end(); await base.query(`DROP SCHEMA ${schema} CASCADE`); await base.end();
 }
});
