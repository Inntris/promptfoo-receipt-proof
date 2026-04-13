import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface LocalConfig {
  schema_version: 'v1';
  agent_id: string;
  org_id?: string;
  private_key_b64: string;
  public_key_b64: string;
  public_key_fingerprint: string;
  api_url: string;
  registered_at: string;
}

export function configPath(): string {
  return path.join(os.homedir(), '.inntris', 'promptfoo.json');
}

export function saveConfig(cfg: LocalConfig): void {
  const p = configPath();
  fs.mkdirSync(path.dirname(p), { recursive: true, mode: 0o700 });
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

export function loadConfig(): LocalConfig {
  const raw = fs.readFileSync(configPath(), 'utf8');
  return JSON.parse(raw) as LocalConfig;
}
