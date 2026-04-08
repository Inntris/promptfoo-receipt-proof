import test from 'node:test';
import assert from 'node:assert/strict';
import { computePayloadHash, computeActionHash, signActionHash } from '../src/signing.js';

const payload = { a: 1, b: 'two' };
const envelope = {
  agent_id: '11111111-2222-3333-4444-555555555555',
  action_type: 'promptfoo_eval',
  payload_hash: computePayloadHash(payload),
  nonce: 'abc123',
  timestamp: '2026-04-08T12:34:56.000Z',
};

test('action hash deterministic length', () => {
  const h1 = computeActionHash(envelope);
  const h2 = computeActionHash(envelope);
  assert.equal(h1, h2);
  assert.equal(h1.length, 64);
});

test('signActionHash returns 64-byte base64 signature', async () => {
  const fakePrivateKey = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32-byte zero seed
  const sig = await signActionHash(computeActionHash(envelope), fakePrivateKey);
  const raw = Buffer.from(sig, 'base64');
  assert.equal(raw.length, 64);
});
