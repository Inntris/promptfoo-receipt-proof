import crypto from 'node:crypto';
import { sign, etc } from '@noble/ed25519';
import { canonicalStringify, sha256HexUtf8 } from './canonicalize.js';

etc.sha512Sync = (...msgs: Uint8Array[]): Uint8Array => {
  const h = crypto.createHash('sha512');
  for (const msg of msgs) h.update(msg);
  return h.digest();
};

export type SigningEnvelope = {
  agent_id: string;
  action_type: string;
  payload_hash: string;
  nonce: string;
  timestamp: string;
};

export function computePayloadHash(payload: unknown): string {
  return sha256HexUtf8(canonicalStringify(payload));
}

export function computeActionHash(envelope: SigningEnvelope): string {
  return sha256HexUtf8(canonicalStringify(envelope));
}

export async function signActionHash(actionHashHex: string, privateKeyB64: string): Promise<string> {
  const messageBytes = Buffer.from(actionHashHex, 'hex');
  const signature = sign(messageBytes, Buffer.from(privateKeyB64, 'base64'));
  return Buffer.from(signature).toString('base64');
}
