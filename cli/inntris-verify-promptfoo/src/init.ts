import crypto from 'node:crypto';
import { getPublicKey } from '@noble/ed25519';
import { saveConfig } from './config.js';

function argValue(args: string[], key: string): string | undefined {
  const idx = args.indexOf(key);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function sha256Hex(input: Uint8Array): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function tryRegister(apiUrl: string, email: string | undefined, publicKeyB64: string): Promise<Response> {
  // Primary: shared foundation endpoint schema expects `public_key`
  let res = await fetch(`${apiUrl}/public/agents/register-promptfoo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, public_key: publicKeyB64 })
  });

  // Backward compatibility for deployments expecting `public_key_b64`
  if (res.status === 422) {
    res = await fetch(`${apiUrl}/public/agents/register-promptfoo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, public_key_b64: publicKeyB64 })
    });
  }

  return res;
}

export async function runInit(args: string[]) {
  const email = argValue(args, '--email');
  const apiUrl = argValue(args, '--api-url') || process.env.INNTRIS_API_URL || 'https://api.inntris.com';

  const privateKey = crypto.randomBytes(32);
  const publicKey = await getPublicKey(privateKey);
  const public_key_b64 = Buffer.from(publicKey).toString('base64');
  const localFingerprint = sha256Hex(publicKey);

  const res = await tryRegister(apiUrl, email, public_key_b64);

  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  const body = await res.json() as { agent_id: string; org_id?: string; public_key_fingerprint?: string };
  if (!body.agent_id) throw new Error('register response missing agent_id');

  saveConfig({
    schema_version: 'v1',
    agent_id: body.agent_id,
    org_id: body.org_id,
    private_key_b64: privateKey.toString('base64'),
    public_key_b64,
    public_key_fingerprint: body.public_key_fingerprint || localFingerprint,
    api_url: apiUrl,
    registered_at: new Date().toISOString(),
  });

  console.log(`Agent fingerprint: ${body.public_key_fingerprint || localFingerprint}`);
  console.log('Saved credentials to ~/.inntris/promptfoo.json (keep it safe)');
}
