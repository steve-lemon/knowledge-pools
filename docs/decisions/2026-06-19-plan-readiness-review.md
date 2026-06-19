# Decision: Plan Readiness Review

Date: 2026-06-19
Status: accepted

## Context

The `plan` stage baseline, media concept proofs, retrieval planner spec, and plan-to-retrieve handoff are now defined.

Before moving to `retrieve`, the project needs a final check that `plan` does not exceed its boundary.

## Decision

Accept [Plan Readiness Review](../architecture/plan-readiness-review.md) as the readiness gate for moving from `plan` design toward `retrieve` design.

The `plan` stage may use:

- `retrieval.plan`;
- `record.search`;
- `index.search`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`;
- optional `graph.query`, `taxonomy.read`, `model.complete`, `artifact.read`, and `preview.lookup`.

The `plan` stage must not use:

- `source.read`;
- `retrieval.fetch_evidence`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- durable memory, curation, rollback, or deletion ports.

## Rationale

Plan should be media-aware and strategy-producing, but it must not consume evidence or answer the user.

This keeps retrieval execution, reasoning, verification, and memory updates in their own stages.

## Consequences

Positive:

- the `retrieve` stage can start from a typed plan;
- tool permissions are clearer;
- media-heavy retrieval can be bounded before execution;
- task understanding remains separate from source understanding.

Tradeoffs:

- the planner needs explicit retrieval budgets and evidence type vocabulary;
- retrieve-stage implementation must respect plan constraints.

## Follow-ups

- Define retrieve baseline.
- Define `RetrieveToReasonHandoff`.
- Define evidence bundle schema and retrieval validation rules.
