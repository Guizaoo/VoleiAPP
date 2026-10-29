import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedEmails, text, uuid } from '../src/validation.js';
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
