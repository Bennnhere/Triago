"""Live validation for the three Alertify demo scenarios; run only against a started FastAPI service."""
from __future__ import annotations

import requests


BASE_URL = "http://127.0.0.1:8000"


def run(name: str) -> dict:
  response = requests.post(f"{BASE_URL}/demo/{name}", timeout=30)
  response.raise_for_status()
  return response.json()


def seed_dependent_alerts() -> None:
  dependent_alerts = (
      {
          "service": "payment-service",
          "alert_type": "timeout",
          "severity": "high",
          "message": "Authorization requests waiting on the auth dependency.",
      },
      {
          "service": "notification-service",
          "alert_type": "timeout",
          "severity": "medium",
          "message": "Verification notifications are timing out behind the auth dependency.",
      },
  )
  for alert in dependent_alerts:
      response = requests.post(f"{BASE_URL}/alerts", json=alert, timeout=30)
      response.raise_for_status()


def main() -> None:
  results: list[dict] = []
  for cycle in (1, 2):
    for scenario in ("known", "correlated", "novel"):
      if scenario == "correlated":
        seed_dependent_alerts()
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
