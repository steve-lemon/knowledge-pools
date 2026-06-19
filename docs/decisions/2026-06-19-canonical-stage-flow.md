# Decision: Canonical Stage Flow

Date: 2026-06-19
Status: accepted

## Context

The project has used a short loop for explanation:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

As the architecture became more concrete, several responsibilities needed explicit stage ownership:

- user-question understanding belongs to planning, not source understanding;
- update should produce candidates, not write durable memory directly;
- curation must decide what becomes durable;
- evaluation should record traces and quality signals after a run.

## Decision

Use the following canonical implementation flow:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

Use [Ultimate Knowledge Loop](../architecture/ultimate-loop.md) as the source of truth for stage order and ownership.

## Rationale

This keeps the system implementable and auditable:

- `plan` owns task understanding and retrieval strategy;
- `update` owns reusable update candidates;
- `curation` owns durable memory and graph acceptance;
- `evaluate` owns learning signals and regression data.

The short loop may still be used in social or high-level explanations, but implementation documents should use the canonical flow.

## Consequences

Positive:

- stage boundaries are clearer;
- durable writes are isolated behind curation;
- agent tool permissions are easier to enforce;
- implementation can progress incrementally without pretending the full loop is done.

Tradeoffs:

- the architecture has more named stages;
- older documents may need small wording updates when they use the short loop as if it were the implementation flow.

## Follow-ups

- Keep stage transition reviews aligned with the canonical flow.
- Add detailed baselines for `plan`, `retrieve`, `reason`, `update`, `curation`, and `evaluate` as those stages become active.
