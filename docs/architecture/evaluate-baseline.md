# Evaluate Baseline

This document defines the `evaluate` stage for Knowledge Pools.

The canonical stage flow is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

## Purpose

`evaluate` records quality signals from completed runs and curation outcomes.

It is the learning signal stage.

Unlike `update` and `curation`, evaluation does not propose or write durable knowledge.

It observes what happened and records whether the system behaved well enough to improve future retrieval, reasoning, verification, update, and curation work.

The core question is:

```text
What should the system learn about its own process quality?
```

## Role In The Loop

`curation` decides what becomes durable memory.

`evaluate` records signals about the quality of that decision and the run that led to it.

Those signals may later influence prompts, tests, retrieval plans, taxonomy proposals, update candidates, or engineering priorities, but they do not bypass the normal loop.

```text
CurationToEvaluateHandoff
  -> trace and artifact review
  -> EvaluationSignal[]
  -> EvaluationReport
  -> future improvement work
```

## Expected Effects

The evaluate stage should:

- make failures visible;
- preserve quality signals from completed runs;
- identify retrieval misses, verifier failures, unsupported claims, stale evidence, and curation outcomes;
- help build regression tests and fixtures;
- provide feedback to future implementation planning;
- avoid mutating durable knowledge directly;
- keep improvement signals traceable to run, task, artifact, and decision refs.

## Expected Results

After a successful evaluation run, the system should have:

- one `EvaluationReport`;
- zero or more `EvaluationSignal` records;
- quality metrics for the run or stage;
- issue or follow-up refs when needed;
- links to traces, artifacts, curation decisions, and affected records;
- a clear list of improvements to consider later;
- no durable memory write.

No new improvement action is a valid result when the run was clean.

## Inputs

Primary input:

- `CurationToEvaluateHandoff`

Required referenced artifacts:

- curation decision refs;
- accepted record refs;
- rejected candidate refs;
- deferred candidate refs when present;
- lifecycle event refs when present;
- curation quality report ref.

Optional context:

- run trace refs;
- task refs;
- retrieval plan refs;
- evidence bundle refs;
- verification report refs;
- update candidate refs;
- user feedback refs;
- regression expectation refs.

## Outputs

Primary output:

- `EvaluationReport`

Supporting outputs:

- `EvaluationSignal` records;
- retrieval miss summaries;
- verifier failure summaries;
- curation outcome summaries;
- regression test proposals;
- improvement recommendations;
- trace refs.

## Evaluation Signal Types

Recommended v1 signal types:

| Signal | Meaning |
| --- | --- |
| `retrieval_miss` | Expected evidence was missing or not retrieved |
| `unsupported_claim` | Reason produced a claim that verify rejected or marked unsupported |
| `stale_evidence` | Current answer or decision used stale evidence |
| `conflict_unresolved` | Known contradiction was not resolved |
| `curation_rejected` | Candidate was rejected and may indicate upstream noise |
| `curation_deferred` | Candidate needs more evidence or review |
| `accepted_memory` | Candidate became durable knowledge |
| `rollback_or_quarantine` | Accepted state later required rollback or quarantine |
| `schema_failure` | Artifact or handoff schema validation failed |
| `tool_failure` | Tool call failed or exceeded allowed boundary |
| `human_feedback` | User correction, approval, or rejection signal |
| `regression_candidate` | Run should become a future regression fixture |

## Minimal Evaluation Report Shape

```json
{
  "evaluation_report_id": "eval_20260619_001",
  "run_id": "run_2026_06_19_001",
  "stage_scope": ["retrieve", "reason", "verify", "update", "curation"],
  "status": "completed",
  "curation_decision_refs": ["cur_md_claim_001"],
  "accepted_record_refs": ["claim_md_001"],
  "signals": [
    {
      "signal_id": "sig_001",
      "signal_type": "accepted_memory",
      "severity": "info",
      "summary": "Verified Markdown claim became durable memory.",
      "related_refs": ["upd_md_claim_001", "cur_md_claim_001", "claim_md_001"]
    }
  ],
  "metrics": {
    "retrieval_miss_count": 0,
    "unsupported_claim_count": 0,
    "accepted_candidate_count": 1,
    "rejected_candidate_count": 0,
    "deferred_candidate_count": 0
  },
  "recommended_followups": []
}
```

## Boundary With Curation

`curation` decides durable knowledge.

`evaluate` records whether the run and curation decision produced useful quality signals.

Evaluate must not change the curation decision.

If evaluation finds a problem, it should emit a signal or follow-up recommendation.

Any new knowledge correction should re-enter the loop as feedback or a future update candidate, not bypass curation.

## Boundary With Update

Evaluation may create signals that later lead to update candidates.

It does not emit `UpdateCandidate` directly in v1.

The orchestrator or a future feedback workflow may decide to feed evaluation signals back into `update`.

## Markdown-First V1 Scope

V1 should support evaluation over Markdown/text runs only.

Initial scope:

- retrieval miss count;
- unsupported claim count;
- verification failure count;
- update candidate count;
- curation accepted/rejected/deferred count;
- schema failure count;
- trace completeness checks;
- regression fixture suggestions.

Deferred:

- media-specific scoring;
- automated prompt optimization;
- automatic taxonomy changes;
- automatic durable memory mutation;
- dashboard analytics.

## Tool Contract

Required ports:

- `audit.read_trace`;
- `audit.trace`;
- `artifact.read`;
- `schema.validate`;
- `evaluation.record`;
- `artifact.write`.

Optional ports:

- `evaluation.report`;
- `record.search`;
- `taxonomy.read`;
- `review.request`;

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.read`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Validation Rules

Every evaluation report must:

- reference a run id;
- reference input handoff or trace refs;
- include stage scope;
- include signal records or explicitly state that no signals were emitted;
- preserve refs to curation decisions and affected records when available;
- keep recommendations separate from durable mutations;
- validate metric names and signal types;
- emit trace records for evaluation work.

## Acceptance Criteria

V1 is ready when:

- `CurationToEvaluateHandoff` validates;
- traces and curation decisions can be read;
- evaluation report schema validates;
- retrieval, verify, update, and curation counts can be summarized;
- regression candidate signals can be emitted;
- evaluation does not write memory or change curation decisions.

## Design Rule

Evaluation is not self-modification.

It is the evidence layer for future improvement.
