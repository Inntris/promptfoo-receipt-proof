#!/usr/bin/env node
import { runInit } from './init.js';
import { runAttest } from './attest.js';

const [cmd, ...rest] = process.argv.slice(2);

function usage(): void {
  console.log(`inntris-verify promptfoo CLI\n\nUsage:\n  inntris-verify init [--email you@company.com] [--api-url https://api.inntris.com]\n  inntris-verify attest --results results.json --config promptfooconfig.yaml`);
}

async function main() {
  if (!cmd || cmd === '--help' || cmd === '-h') {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === 'init') return runInit(rest);
  if (cmd === 'attest') return runAttest(rest);

  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
