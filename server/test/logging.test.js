import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { requestLogging, apiErrorHandler, errorDetails, rateLimitHandler } from '../src/logging.js';

test('classifica erros do banco, configuração e validação sem expor a mensagem original', () => {
 const db = errorDetails(Object.assign(new Error('senha=segredo'), { code: '42P01' }));
 assert.equal(db.status, 500); assert.equal(db.code, '42P01');
 assert.match(db.reason, /migrações/); assert.doesNotMatch(JSON.stringify(db), /segredo/);
 assert.equal(errorDetails({ status: 503, code: 'STORAGE_NOT_CONFIGURED' }).code, 'STORAGE_NOT_CONFIGURED');
 assert.equal(errorDetails({ type: 'entity.parse.failed', status: 400 }).code, 'entity_parse_failed');
 assert.equal(errorDetails({ code: 'LIMIT_FILE_SIZE' }).status, 413);
});

test('logs HTTP correlacionam sucesso, erro, JSON inválido, 404 e limite sem dados sensíveis', async () => {
 const entries = [];
 const originals = { log: console.log, warn: console.warn, error: console.error };
 for (const method of Object.keys(originals)) console[method] = line => entries.push(JSON.parse(line));
 const app = express(); app.use(requestLogging); app.use(express.json());
 app.get('/api/health', (_req, res) => res.json({ ok: true }));
 app.post('/api/posts', (_req, _res, next) => next(Object.assign(new Error('senha=segredo'), { code: '42P01' })));
 app.get('/api/limited', rateLimitHandler);
 app.use((_req, _res, next) => next(Object.assign(new Error('Rota não encontrada.'), { status: 404, code: 'ROUTE_NOT_FOUND' })));
 app.use(apiErrorHandler);
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 const base = `http://127.0.0.1:${server.address().port}`;
 try {
  const ok = await fetch(`${base}/api/health?token=segredo`, { headers: { Authorization: 'Bearer segredo', Cookie: 'session=segredo', 'X-Request-ID': 'fake-client-id' } });
  assert.equal(ok.status, 200); assert.match(ok.headers.get('x-request-id'), /^[a-f0-9-]{36}$/);
  const bad = await fetch(`${base}/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'conteudo-privado' }) });
  assert.equal(bad.status, 500); const body = await bad.json();
  assert.equal(body.code, '42P01'); assert.equal(body.requestId, bad.headers.get('x-request-id'));
  assert.doesNotMatch(body.error, /segredo/);
  assert.equal((await fetch(`${base}/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid-private-body' })).status, 400);
  assert.equal((await fetch(`${base}/private-path-secret`)).status, 404);
  assert.equal((await fetch(`${base}/api/limited`)).status, 429);
  const completed = entries.filter(e => e.event === 'http_request_completed');
  assert.deepEqual(completed.map(e => e.statusCode), [200, 500, 400, 404, 429]);
  assert.equal(completed[0].level, 'info'); assert.equal(completed[1].level, 'error'); assert.equal(completed[2].level, 'warn');
  assert.ok(completed.every(e => Number.isFinite(e.durationMs) && e.durationMs >= 0));
  assert.equal(entries.find(e => e.code === '42P01').requestId, body.requestId);
  assert.doesNotMatch(JSON.stringify(entries), /segredo|conteudo-privado|invalid-private-body|private-path-secret|fake-client-id/);
 } finally {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  Object.assign(console, originals);
 }
});
