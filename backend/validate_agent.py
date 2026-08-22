"""Live validation for the three Alertify demo scenarios; run only against a started FastAPI service."""
from __future__ import annotations

import requests


BASE_URL = "http://127.0.0.1:8000"


def run(name: str) -> dict:
    response = requests.post(f"{BASE_URL}/demo/{name}", timeout=30)
    response.raise_for_status()
    return response.json()


def main() -> None:
    results: list[dict] = []
    for cycle in (1, 2):
        for scenario in ("known", "correlated", "novel"):
            result = run(scenario)
            results.append({"cycle": cycle, "scenario": scenario, **result})
            print(
                f"cycle={cycle} scenario={scenario} confidence={result['confidence']:.3f} "
                f"outcome={result['outcome']} correlations={len(result['correlations'])}"
            )

    first_known = next(item for item in results if item["cycle"] == 1 and item["scenario"] == "known")
    first_correlated = next(item for item in results if item["cycle"] == 1 and item["scenario"] == "correlated")
    first_novel = next(item for item in results if item["cycle"] == 1 and item["scenario"] == "novel")

    assert first_known["confidence"] >= 0.85, "Known checkout regression must exceed the autonomous threshold"
    assert first_known["outcome"] == "auto-resolved", "Known checkout regression must autonomously resolve"
    assert len(first_correlated["correlations"]) >= 2, "Auth cluster must correlate its dependent alerts"
    assert first_novel["outcome"] == "escalated", "Novel or previously escalated incident must remain an escalation without a proven executable resolution"
    print("VALIDATION PASSED: seeded scenarios completed twice through the live agent.")


if __name__ == "__main__":
    main()
