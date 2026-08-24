"""Integrity checks for the published municipal access dataset."""

import json
import re
from pathlib import Path


root = Path(__file__).resolve().parents[1]
data = json.loads((root / "app" / "data" / "access.json").read_text(encoding="utf-8"))
fields = data["municipalityFields"]
rows = [dict(zip(fields, row)) for row in data["municipalities"]]

assert len(rows) == data["meta"]["municipalities"]
assert len({row["id"] for row in rows}) == len(rows)
assert all(re.fullmatch(r"\d{7}", row["id"]) for row in rows)
assert len(data["ufs"]) == 27
assert all(row["cnesPharmacies"] >= 0 for row in rows)
assert all(row["cnesRate"] is None or row["cnesRate"] >= 0 for row in rows)
assert all(row["nearestCnesKm"] is None or row["nearestCnesKm"] >= 0 for row in rows)
assert all(row["nearestPfpbKm"] is None or row["nearestPfpbKm"] >= 0 for row in rows)
assert all(row["nearestCnesKm"] == 0 for row in rows if row["cnesPharmacies"] > 0)
assert all(row["nearestPfpbKm"] == 0 for row in rows if row["pfpbCovered"])
assert sum(row["population"] or 0 for row in rows) == data["meta"]["population"]
assert sum(row["cnesPharmacies"] for row in rows) == data["meta"]["cnesPharmacies"]
assert sum(bool(row["pfpbCovered"]) for row in rows) == data["meta"]["pfpbCoveredMunicipalities"]
assert sum(not row["pfpbCovered"] for row in rows) == data["meta"]["pfpbNoCoverageObserved"]

print(f"OK: {len(rows)} municípios, {data['meta']['cnesPharmacies']} farmácias CNES, {data['meta']['pfpbNoCoverageObserved']} vazios PFPB observados")
