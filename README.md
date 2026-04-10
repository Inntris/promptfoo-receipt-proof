# promptfoo-receipt-proof

Thin live-integration demo:

- Promptfoo runs evals (`init`, `eval`, `view`)
- Inntris attests the resulting `results.json` + `promptfooconfig.yaml`
- Receipts are signed client-side (Ed25519) and submitted to `POST /verify`
- Public verification is on Inntris (`/verify/{audit_id}`)

## CLI

`cli/inntris-verify-promptfoo`

Commands:

- `inntris-verify init --email <optional>`
- `inntris-verify attest --results results.json --config promptfooconfig.yaml`

`attest` only prints a transaction hash when the receipt is already anchored on Base mainnet (`chain_id=8453` + `block_number` present).

## Canonicalization

See `docs/RECEIPT_CANONICALIZATION.md` and `tests/fixtures/canonicalization`.

## Deployment reminder

Before end-to-end testing on live infra, ensure `ANCHOR_CONTRACT_ADDRESS` is set in deployment environment variables.


### CLI local run quickstart

From `cli/inntris-verify-promptfoo`:

```bash
npm install
npm run build
node dist/src/index.js --help
```

Or use the helper script:

```bash
npm run cli -- --help
```
