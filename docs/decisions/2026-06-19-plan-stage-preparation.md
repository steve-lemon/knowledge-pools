# Decision: Plan Stage Preparation

Date: 2026-06-19
Status: accepted

## Context

After clarifying ingest, understand, connect, verify, and the shared stage data flow contract, the next canonical runtime stage is `plan`.

The project also clarified that source `understand` and runtime task understanding are different responsibilities.

## Decision

Prepare the `plan` stage as the next architecture focus.

The `plan` stage will:

- own task understanding;
- produce `RetrievalPlan`;
- define required evidence types;
- set freshness scope;
- decide whether conflict search is required;
- hand off to `retrieve` through `PlanToRetrieveHandoff`.

It will not:

- fetch full evidence;
- synthesize answers;
- verify claims;
- write durable memory.

## Rationale

Planning before retrieval avoids treating similarity search as the whole retrieval strategy.

It also gives the system a clear place to interpret user intent without confusing it with source/document understanding.

## Consequences

Positive:

- retrieval becomes strategy-driven;
- answer shape and freshness requirements become explicit;
- conflict search can be requested before reasoning;
- the `retrieve` stage can stay focused on evidence gathering.

Tradeoffs:

- the planner needs a schema-valid artifact and handoff before retrieval can run;
- early v1 planning should remain deterministic and small.

## Follow-ups

- Add detailed retrieve baseline.
- Add `RetrieveToReasonHandoff`.
- Expand answer verification after `plan`, `retrieve`, and `reason` are designed.
