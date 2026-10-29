import express from 'express';
import pg from 'pg';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { requestLogging, apiErrorHandler, rateLimitHandler, writeLog } from './logging.js';
import { allowedEmails, text, uuid, player } from './validation.js';

for (const key of ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'APP_ORIGIN', 'BETA_ALLOWED_EMAILS']) {
 if (!process.env[key]) throw new Error(`Configure ${key}.`);
}
const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const invited = allowedEmails(process.env.BETA_ALLOWED_EMAILS);
const production = process.env.NODE_ENV === 'production';
const cookieName = production ? '__Host-levanta' : 'levanta';
const cookieOptions = { httpOnly: true, secure: production, sameSite: 'lax', path: '/' };
const hash = value => createHash('sha256').update(value).digest('hex');
const bucket = process.env.BUCKET_NAME;
const s3 = bucket ? new S3Client({ endpoint: process.env.BUCKET_ENDPOINT, region: process.env.BUCKET_REGION || 'auto', credentials: { accessKeyId: process.env.BUCKET_ACCESS_KEY_ID, secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY } }) : null;
const fail = (status, message, code) => Object.assign(new Error(message), { status, code });
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(requestLogging);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use((req, _res, next) => { req.body ??= {}; next(); });
app.use('/api', rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false, handler: rateLimitHandler }));
app.get('/api/health', async (_req, res) => { await pool.query('SELECT 1'); res.json({ ok: true }); });
// O navegador usa /api na mesma origem, por proxy Vercel/Vite. Mutações exigem a origem exata.
app.use('/api', (req, _res, next) => {
 if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== process.env.APP_ORIGIN) return next(fail(403, 'Origem não autorizada.', 'ORIGIN_NOT_ALLOWED'));
 next();
});
app.post('/api/auth/google', rateLimit({ windowMs: 60_000, limit: 10, handler: rateLimitHandler }), async (req, res) => {
 let payload;
 try {
  const ticket = await google.verifyIdToken({ idToken: text(req.body.credential, 8192), audience: process.env.GOOGLE_CLIENT_ID });
  payload = ticket.getPayload();
 } catch { throw fail(401, 'Não foi possível validar o login com Google.', 'GOOGLE_TOKEN_INVALID'); }
 if (!payload?.sub || !payload.email_verified || !invited.has(payload.email?.toLowerCase())) throw fail(403, 'Este e-mail ainda não foi convidado para o beta.', 'BETA_ACCESS_DENIED');
 const { rows: [user] } = await pool.query('INSERT INTO users(google_sub,email,name) VALUES($1,$2,$3) ON CONFLICT(google_sub) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name RETURNING *', [payload.sub, payload.email.toLowerCase(), (payload.name || 'Jogador').slice(0, 120)]);
 const token = randomBytes(32).toString('hex');
 await pool.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')", [hash(token), user.id]);
 await pool.query('DELETE FROM sessions WHERE expires_at < now()');
 res.cookie(cookieName, token, { ...cookieOptions, maxAge: 7 * 86400_000 });
 res.set('Cache-Control', 'no-store').json({ user: player(user) });
});
app.use('/api', async (req, res, next) => {
 res.set('Cache-Control', 'no-store');
 const token = req.cookies[cookieName];
 if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw fail(401, 'Entre para acessar o beta.', 'SESSION_MISSING');
 const { rows: [user] } = await pool.query('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()', [hash(token)]);
 if (!user || !invited.has(user.email.toLowerCase())) throw fail(401, 'Sua sessão expirou ou seu acesso foi removido. Entre novamente.', 'SESSION_INVALID');
 req.user = user;
 next();
});
app.get('/api/auth/me', (req, res) => res.json({ user: player(req.user) }));
app.post('/api/auth/logout', async (req, res) => {
 await pool.query('DELETE FROM sessions WHERE token_hash=$1', [hash(req.cookies[cookieName])]);
 res.clearCookie(cookieName, cookieOptions).json({ ok: true });
});
app.get('/api/feed', async (req, res) => {
 const { rows: posts } = await pool.query(`SELECT p.*, up.width, up.height,
 (SELECT count(*)::int FROM likes l WHERE l.post_id=p.id AND l.user_id<>$1) AS likes,
 EXISTS(SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=$1) AS liked,
 EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id=p.id AND s.user_id=$1) AS saved
 FROM posts p LEFT JOIN uploads up ON up.id=p.upload_id ORDER BY p.created_at DESC LIMIT 100`, [req.user.id]);
 const ids = posts.map(p => p.id);
 const { rows: comments } = await pool.query('SELECT * FROM comments WHERE post_id=ANY($1::uuid[]) ORDER BY created_at,id', [ids]);
 const userIds = [...new Set([...posts.map(p => p.user_id), ...comments.map(c => c.user_id)])];
 const { rows: users } = await pool.query('SELECT id,name FROM users WHERE id=ANY($1::uuid[])', [userIds]);
 res.json({ players: users.map(player), liked: posts.filter(p => p.liked).map(p => p.id), saved: posts.filter(p => p.saved).map(p => p.id), posts: posts.map(p => ({ id: p.id, playerId: p.user_id, caption: p.caption, courtId: p.court_id || undefined, minutesAgo: Math.max(0, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60_000)), likes: p.likes, image: p.upload_id ? { src: `/api/media/${p.upload_id}`, alt: p.caption || 'Foto da comunidade', width: p.width, height: p.height } : undefined, comments: comments.filter(c => c.post_id === p.id).map(c => ({ id: c.id, playerId: c.user_id, text: c.text })) })) });
});
app.post('/api/posts', async (req, res) => {
 const caption = text(req.body.caption, 300, true);
 const uploadId = req.body.uploadId ? uuid(req.body.uploadId) : null;
 if (!caption && !uploadId) throw fail(400, 'Adicione uma foto ou legenda.');
 if (uploadId && !(await pool.query('SELECT 1 FROM uploads WHERE id=$1 AND user_id=$2', [uploadId, req.user.id])).rowCount) throw fail(400, 'Foto inválida.');
 const courtId = req.body.courtId ? text(req.body.courtId, 100) : null;
 const { rows: [post] } = await pool.query('INSERT INTO posts(user_id,caption,upload_id,court_id) VALUES($1,$2,$3,$4) RETURNING id', [req.user.id, caption, uploadId, courtId]);
 res.status(201).json(post);
});
app.delete('/api/posts/:id', async (req, res) => {
 const result = await pool.query('DELETE FROM posts WHERE id=$1 AND user_id=$2', [uuid(req.params.id), req.user.id]);
 if (!result.rowCount) throw fail(404, 'Publicação não encontrada.');
 res.json({ ok: true });
});
app.post('/api/posts/:id/comments', async (req, res) => {
 const { rows: [comment] } = await pool.query('INSERT INTO comments(post_id,user_id,text) VALUES($1,$2,$3) RETURNING id', [uuid(req.params.id), req.user.id, text(req.body.text, 200)]);
 res.status(201).json(comment);
});
for (const [path, table] of [['like', 'likes'], ['save', 'saved_posts']]) {
 app.put(`/api/posts/:id/${path}`, async (req, res) => {
  const id = uuid(req.params.id);
  if (typeof req.body.active !== 'boolean') throw fail(400, 'Estado inválido.');
  if (req.body.active) await pool.query(`INSERT INTO ${table}(post_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [id, req.user.id]);
  else await pool.query(`DELETE FROM ${table} WHERE post_id=$1 AND user_id=$2`, [id, req.user.id]);
  res.json({ ok: true });
 });
}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 } });
app.post('/api/uploads', rateLimit({ windowMs: 60_000, limit: 10, handler: rateLimitHandler }), upload.single('photo'), async (req, res) => {
 if (!s3) throw fail(503, 'Armazenamento de fotos ainda não configurado.', 'STORAGE_NOT_CONFIGURED');
 if (!req.file) throw fail(400, 'Envie uma foto de até 5 MB.');
 let output;
 try {
  const image = sharp(req.file.buffer, { limitInputPixels: 40_000_000 });
  const meta = await image.metadata();
  if (!['jpeg', 'png', 'webp'].includes(meta.format)) throw new Error();
  output = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
 } catch { throw fail(400, 'Escolha uma foto JPG, PNG ou WebP válida.'); }
 const key = `${req.user.id}/${randomUUID()}.webp`;
 await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: output.data, ContentType: 'image/webp' }));
 const { rows: [row] } = await pool.query('INSERT INTO uploads(user_id,object_key,width,height) VALUES($1,$2,$3,$4) RETURNING id', [req.user.id, key, output.info.width, output.info.height]);
 res.status(201).json({ uploadId: row.id });
});
app.get('/api/media/:id', async (req, res) => {
 if (!s3) throw fail(503, 'Armazenamento indisponível.', 'STORAGE_NOT_CONFIGURED');
 const { rows: [row] } = await pool.query('SELECT object_key FROM uploads WHERE id=$1 AND (user_id=$2 OR EXISTS(SELECT 1 FROM posts WHERE upload_id=$1))', [uuid(req.params.id), req.user.id]);
 if (!row) throw fail(404, 'Foto não encontrada.');
 const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: row.object_key }));
 res.set('Content-Type', 'image/webp');
 res.set('Cache-Control', 'private, max-age=300');
 object.Body.on('error', error => apiErrorHandler(error, req, res, () => {}));
 object.Body.pipe(res);
});
app.use((_req, _res, next) => next(fail(404, 'Rota não encontrada.', 'ROUTE_NOT_FOUND')));
app.use(apiErrorHandler);
const server = app.listen(Number(process.env.PORT || 3001), '0.0.0.0', () => writeLog('info', 'api_started', { message: 'Levanta API pronta.', port: Number(process.env.PORT || 3001), storageConfigured: Boolean(s3) }));
process.on('SIGTERM', () => server.close(() => { pool.end().then(() => process.exit(0)); }));
