import test from 'node:test';
import assert from 'node:assert/strict';
import { accessPolicy, allowedEmails, text, uuid } from '../src/validation.js';
test('lista de convidados é explícita e normalizada', () => {
 assert.deepEqual([...allowedEmails(' A@EXAMPLE.COM, ,b@example.com ')], ['a@example.com', 'b@example.com']);
 assert.equal(allowedEmails().size, 0);
});
test('limites de conteúdo e identificadores recusam dados inválidos', () => {
 assert.equal(text('  jogo  ', 10), 'jogo');
 assert.equal(text('', 300, true), '');
 for (const value of ['', 4, null, 'a'.repeat(201)]) assert.throws(() => text(value, 200));
 assert.throws(() => uuid("x' OR 1=1"));
 assert.equal(uuid('b6990b85-a320-498e-a5db-143742252117'), 'b6990b85-a320-498e-a5db-143742252117');
});

test('cadastro público é explícito e modo fechado continua exigindo convite', () => {
 const closed = accessPolicy({ BETA_ALLOWED_EMAILS: 'a@example.com' });
 assert.equal(closed.publicSignup, false);
 assert.equal(closed.allows('A@example.com'), true);
 assert.equal(closed.allows('other@example.com'), false);
 assert.throws(() => accessPolicy({}));
 assert.throws(() => accessPolicy({ PUBLIC_SIGNUP_ENABLED: 'TRUE' }));
 const open = accessPolicy({ PUBLIC_SIGNUP_ENABLED: 'true' });
 assert.equal(open.allows('other@example.com'), true);
 assert.equal(open.allows(undefined), false);
 assert.equal(open.allows(''), false);
 const closedAgain = accessPolicy({ PUBLIC_SIGNUP_ENABLED: 'false', BETA_ALLOWED_EMAILS: 'a@example.com' });
 assert.equal(closedAgain.allows('other@example.com'), false);
});
