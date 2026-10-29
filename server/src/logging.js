import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const reasons = {
 ORIGIN_NOT_ALLOWED: 'A origem da requisição não corresponde a APP_ORIGIN.',
 GOOGLE_TOKEN_INVALID: 'O Google não validou a credencial recebida.',
 BETA_ACCESS_DENIED: 'A conta não está autorizada para o beta.',
 SESSION_MISSING: 'Cookie de sessão ausente ou inválido.',
 SESSION_INVALID: 'Sessão expirada, revogada ou acesso removido.',
 STORAGE_NOT_CONFIGURED: 'Bucket de fotos não configurado na API.',
 '42P01': 'Tabela não encontrada. Verifique as migrações do banco.',
 '23503': 'Registro referenciado não encontrado.',
 '23505': 'Conflito com um registro existente.',
 ECONNREFUSED: 'Conexão com serviço recusada.',
 ENOTFOUND: 'Não foi possível resolver o endereço de um serviço.',
 AccessDenied: 'O armazenamento recusou as credenciais ou permissões.',
 NoSuchBucket: 'O bucket configurado não foi encontrado.',
 entity_parse_failed: 'Corpo JSON inválido.',
 LIMIT_FILE_SIZE: 'Foto excedeu o limite de tamanho.',
};

// Nunca serializa objetos de requisição, erros de bibliotecas ou valores de configuração.
export function writeLog(level, event, fields = {}) {
 const entry = { timestamp: new Date().toISOString(), level, event, ...fields };
 const output = JSON.stringify(entry);
 if (level === 'error') console.error(output);
 else if (level === 'warn') console.warn(output);
 else console.log(output);
}

export function errorDetails(error) {
 const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
  ? error.status : error.code === 'LIMIT_FILE_SIZE' ? 413 : error.name === 'MulterError' ? 400
  : error.code === '23503' ? 404 : error.code === '23505' ? 409 : 500;
 const candidate = error.code || error.type?.replaceAll('.', '_') || error.name;
 const code = typeof candidate === 'string' && /^[a-zA-Z0-9_]{1,64}$/.test(candidate) && !['Error', 'SyntaxError'].includes(candidate)
  ? candidate : status >= 500 ? 'INTERNAL_ERROR' : `HTTP_${status}`;
 return { status, code, reason: reasons[code] || (status >= 500 ? 'Falha interna. Verifique o serviço e a configuração da rota.' : 'Requisição recusada pela API.') };
}

function requestRoute(req) {
 if (req.route?.path) return req.route.path;
 const path = (req.originalUrl || '').split('?')[0];
 if (/^\/api\/(health|feed|posts|uploads|auth\/(google|me|logout))$/.test(path)) return path;
 if (/^\/api\/posts\/[^/]+\/(like|save|comments)$/.test(path)) return `/api/posts/:id/${path.split('/').at(-1)}`;
 if (/^\/api\/posts\/[^/]+$/.test(path)) return '/api/posts/:id';
 if (/^\/api\/media\/[^/]+$/.test(path)) return '/api/media/:id';
 return 'unmatched';
}

export function requestLogging(req, res, next) {
 // Gera o ID no servidor, sem confiar em cabeçalhos fornecidos pelo cliente.
 req.requestId = randomUUID();
 res.set('X-Request-ID', req.requestId);
 res.set('Cache-Control', 'no-store');
 const start = performance.now();
 let logged = false;
 const complete = (aborted) => {
  if (logged) return;
  logged = true;
  const statusCode = aborted ? 499 : res.statusCode;
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  writeLog(level, aborted ? 'http_request_aborted' : 'http_request_completed', {
   requestId: req.requestId,
   method: req.method,
   // Rotas conhecidas usam o template. Não registra query string ou caminhos arbitrários.
   route: requestRoute(req),
   statusCode,
   durationMs: Math.round((performance.now() - start) * 100) / 100,
   ...(req.user ? { userId: req.user.id } : {}),
   ...(res.locals.errorCode ? { code: res.locals.errorCode } : {}),
  });
 };
 res.once('finish', () => complete(false));
 res.once('close', () => complete(!res.writableFinished));
 next();
}

export function apiErrorHandler(error, req, res, _next) {
 const { status, code, reason } = errorDetails(error);
 res.locals.errorCode = code;
 writeLog(status >= 500 ? 'error' : 'warn', 'api_request_failed', {
  requestId: req.requestId,
  method: req.method,
  route: requestRoute(req),
  statusCode: status,
  code,
  reason,
  // Só localização no código próprio; nunca a mensagem/stack bruta da biblioteca.
  ...(typeof error.stack === 'string' && error.stack.match(/src\/[\w/.-]+:\d+:\d+/) ? { source: error.stack.match(/src\/[\w/.-]+:\d+:\d+/)[0] } : {}),
  ...(req.user ? { userId: req.user.id } : {}),
 });
 if (res.headersSent) { res.destroy(); return; }
 const message = status >= 500 ? 'Não foi possível concluir agora. Tente novamente.'
  : status === 413 ? 'O arquivo ou conteúdo excede o tamanho permitido.'
  : error.code === '23503' ? 'Registro não encontrado.'
  : error.code === '23505' ? 'Este registro já existe.'
  : error.type === 'entity.parse.failed' ? 'JSON inválido.' : error.message;
 res.status(status).json({ error: message, code, requestId: req.requestId });
}

export function rateLimitHandler(_req, _res, next) {
 next(Object.assign(new Error('Muitas tentativas. Aguarde um minuto e tente novamente.'), { status: 429, code: 'RATE_LIMITED' }));
}
