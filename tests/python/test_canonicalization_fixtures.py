import hashlib
import json
from pathlib import Path


def canonical_stringify(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def test_shared_fixtures():
    fixture_dir = Path(__file__).resolve().parents[1] / "fixtures" / "canonicalization"
    for input_file in sorted(fixture_dir.glob("*.input.json")):
        stem = input_file.name.replace(".input.json", "")
        canonical_expected = (fixture_dir / f"{stem}.canonical.txt").read_text(encoding="utf-8")
        hash_expected = (fixture_dir / f"{stem}.sha256.txt").read_text(encoding="utf-8").strip()

        input_obj = json.loads(input_file.read_text(encoding="utf-8"))
        canonical_actual = canonical_stringify(input_obj)
        hash_actual = hashlib.sha256(canonical_actual.encode("utf-8")).hexdigest()

        assert canonical_actual == canonical_expected
        assert hash_actual == hash_expected
