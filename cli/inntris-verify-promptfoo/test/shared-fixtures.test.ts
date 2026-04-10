import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify, sha256HexUtf8 } from '../src/canonicalize.js';

const fixtureDir = path.resolve(process.cwd(), '../../tests/fixtures/canonicalization');

for (const file of fs.readdirSync(fixtureDir).filter((f: string) => f.endsWith('.input.json')).sort()) {
  const stem = file.replace('.input.json', '');
  test(`canonical fixture ${stem}`, () => {
    const input = JSON.parse(fs.readFileSync(path.join(fixtureDir, `${stem}.input.json`), 'utf8'));
    const canonicalExpected = fs.readFileSync(path.join(fixtureDir, `${stem}.canonical.txt`), 'utf8');
    const hashExpected = fs.readFileSync(path.join(fixtureDir, `${stem}.sha256.txt`), 'utf8').trim();

    const canonicalActual = canonicalStringify(input);
    const hashActual = sha256HexUtf8(canonicalActual);

    assert.equal(canonicalActual, canonicalExpected);
    assert.equal(hashActual, hashExpected);
  });
}
