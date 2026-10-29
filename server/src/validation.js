// Cadastro fechado por padrão. Só o valor literal true abre o acesso.
export function accessPolicy(env) {
 const setting = env.PUBLIC_SIGNUP_ENABLED ?? 'false';
 if (!['true', 'false'].includes(setting)) throw new Error('PUBLIC_SIGNUP_ENABLED deve ser true ou false.');
 const publicSignup = setting === 'true';
 const invited = allowedEmails(env.BETA_ALLOWED_EMAILS);
 if (!publicSignup && !invited.size) throw new Error('Configure BETA_ALLOWED_EMAILS ou ative PUBLIC_SIGNUP_ENABLED=true.');
 return {
  publicSignup,
  allows: email => typeof email === 'string' && email.trim().length > 0 && (publicSignup || invited.has(email.toLowerCase())),
 };
}

export function allowedEmails(value) {
 return new Set((value ?? '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
}
export function text(value, max, optional = false) {
 if (typeof value !== 'string') throw Object.assign(new Error('Texto inválido.'), { status: 400 });
 const result = value.trim();
 if ((!optional && !result) || result.length > max) throw Object.assign(new Error(`Use ${optional ? 'até' : 'de 1 a'} ${max} caracteres.`), { status: 400 });
 return result;
}
export function uuid(value) {
 if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw Object.assign(new Error('Identificador inválido.'), { status: 400 });
 return value;
}
export function player(user) {
 return { id: user.id, name: user.name, handle: `jogador_${user.id.slice(0, 8)}`, neighborhood: '', favoriteModality: 'beach', avatarColor: '#0b8043', season: { beach: { games: 0, wins: 0 }, indoor: { games: 0, wins: 0 } } };
}
