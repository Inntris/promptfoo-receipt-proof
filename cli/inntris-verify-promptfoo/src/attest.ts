import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadConfig } from './config.js';
import { computePayloadHash, computeActionHash, signActionHash } from './signing.js';

function argValue(args: string[], key: string): string | undefined {
  const idx = args.indexOf(key);
  return idx >= 0 ? args[idx + 1] : undefined;
}

type VerifyRecord = {
  tx_hash?: string | null;
  block_number?: number | null;
  chain_id?: number | null;
};

export async function runAttest(args: string[]) {
  const cfg = loadConfig();
  const resultsPath = argValue(args, '--results') || 'results.json';
  const configPath = argValue(args, '--config') || 'promptfooconfig.yaml';

  if (!fs.existsSync(resultsPath)) throw new Error(`results file not found: ${resultsPath}`);
  if (!fs.existsSync(configPath)) throw new Error(`config file not found: ${configPath}`);

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const configRaw = fs.readFileSync(configPath);

  const results_hash = computePayloadHash(results);
  const policy_hash = crypto.createHash('sha256').update(configRaw).digest('hex');

  const payload = {
    tool: 'promptfoo',
    artifact_type: 'promptfoo_eval',
    results_hash,
    results_summary: {
      total: results?.stats?.total ?? null,
      passed: results?.stats?.successes ?? null,
      failed: results?.stats?.failures ?? null,
    },
  };

  const nonce = crypto.randomBytes(12).toString('hex');
  const timestamp = new Date().toISOString();
  const payload_hash = computePayloadHash(payload);
  const signing_data = {
    agent_id: cfg.agent_id,
    action_type: 'promptfoo_eval',
    payload_hash,
    nonce,
    timestamp,
  };
  const action_hash = computeActionHash(signing_data);
  const signature = await signActionHash(action_hash, cfg.private_key_b64);

  const requestBody = {
    agent_id: cfg.agent_id,
    action_type: 'promptfoo_eval',
    payload,
    signature,
    nonce,
    timestamp,
    policy_hash,
  };

  const verifyRes = await fetch(`${cfg.api_url}/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!verifyRes.ok) throw new Error(`verify failed: ${verifyRes.status} ${await verifyRes.text()}`);
  const verifyOut = await verifyRes.json() as { audit_id: string };
  if (!verifyOut.audit_id) throw new Error('verify response missing audit_id');

  let txHash: string | null = null;
  try {
    const verifyPageRes = await fetch(`${cfg.api_url}/public/verify/${verifyOut.audit_id}`);
    if (verifyPageRes.ok) {
      const record = await verifyPageRes.json() as VerifyRecord;
      if (record.chain_id === 8453 && record.tx_hash && record.block_number) {
        txHash = record.tx_hash;
      }
    }
  } catch {
    // best-effort lookup only
  }

  console.log(`Agent fingerprint: ${cfg.public_key_fingerprint}`);
  console.log(`Audit ID: ${verifyOut.audit_id}`);
  console.log(`Verify URL: https://inntris.com/verify/${verifyOut.audit_id}`);
  if (txHash) {
    console.log('Anchor status: anchored');
    console.log(`Tx Hash: ${txHash}`);
  } else {
    console.log('⧖ Anchor status: queued (next batch ~60 min)');
  }
}
