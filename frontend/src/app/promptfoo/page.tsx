import { DEMO_RECEIPT } from './_demo-receipt';

export default function PromptfooPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Promptfoo receipt demo</h1>
      <p>Promptfoo finds the issues. Inntris turns the eval result into a signed, tamper-evident, publicly anchored receipt.</p>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-semibold">Command flow</h2>
        <pre className="text-sm">{`promptfoo init\npromptfoo eval\npromptfoo view\ninntris-verify init --email you@company.com\ninntris-verify attest --results results.json --config promptfooconfig.yaml`}</pre>
      </section>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-semibold">Pre-seeded anchored receipt</h2>
        <p><a className="underline" href={DEMO_RECEIPT.verify_url}>Public verify</a></p>
        <p><a className="underline" href={DEMO_RECEIPT.basescan_url}>BaseScan tx</a></p>
        <pre className="text-xs overflow-auto">{JSON.stringify(DEMO_RECEIPT.payload_preview, null, 2)}</pre>
        <p className="text-sm">Fresh attestations may queue before anchor confirmation. A tx hash is shown only after anchor exists.</p>
      </section>
    </main>
  );
}
