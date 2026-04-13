# Receipt Canonicalization Contract (Promptfoo Demo)

This demo defines a deterministic canonicalization + hashing contract for Promptfoo eval attestations submitted to Inntris.

## Canonical JSON rules

1. Object keys are sorted lexicographically (UTF-16 code unit order).
2. Arrays preserve input order.
3. JSON output is minified (no spaces/newlines).
4. UTF-8 encoding is used before hashing.
5. Escaping follows JSON standard escaping.
6. `null` is represented as literal `null`.
7. Floats should be avoided in signed payloads; use integers/strings for stability.

Python reference equivalent:

```py
json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
```

## Hash algorithm

- `sha256_hex = SHA-256(utf8(canonical_json))`, lowercase hex.

## Promptfoo attestation payload scope

Launch scope includes only:
- `results.json` (Promptfoo eval output)
- `promptfooconfig.yaml` (policy/test-suite contract)

Excludes:
- Promptfoo HTML report artifacts

## `policy_hash` semantics

For Promptfoo receipts only:
- `policy_hash = SHA-256(raw bytes of promptfooconfig.yaml)`

## Signed envelope contract (`POST /verify`)

Inner `payload_hash`:
- `payload_hash = sha256_canonical(payload)`

Signed action hash:

```json
{
  "agent_id": "<uuid>",
  "action_type": "promptfoo_eval",
  "payload_hash": "<sha256 hex>",
  "nonce": "<nonce>",
  "timestamp": "<exact timestamp string sent to server>"
}
```

`action_hash = sha256_canonical(signing_data)`.

Ed25519 signature input is **raw 32 bytes** from hex-decoding `action_hash`, not the JSON string.

## Test vectors

See `tests/fixtures/canonicalization/*` for shared fixtures consumed by Node and Python tests.

- `promptfoo-basic`
- `promptfoo-unicode`
- `receipt-fingerprint-v2`

## Node conformance snippet

```ts
const canonical = canonicalStringify(input);
const digest = sha256Hex(Buffer.from(canonical, 'utf8'));
```

## Python conformance snippet

```py
canonical = json.dumps(input_obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
```
