#!/usr/bin/env node
/**
 * Thin wrapper required by Promptfoo strict brief.
 * Delegates to the maintained implementation in cli/inntris-verify-promptfoo.
 */
import { runAttest } from '../cli/inntris-verify-promptfoo/src/attest.js';

runAttest(process.argv.slice(2)).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
