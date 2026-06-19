# Decision: Stage Data Flow Contract

Date: 2026-06-19
Status: accepted

## Context

As the stage architecture grew, several objects began to appear across documents:

- `Session`;
- `Run`;
- `Task`;
- `ContextEnvelope`;
- `Artifact`;
- `HandoffEnvelope`;
- `TraceEvent`.

Without a shared boundary, implementation could confuse:

- session continuity with task context;
- context envelopes with stage handoffs;
- artifacts with durable records;
- verification outputs with update candidates.

## Decision

Define [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md) as the common object boundary for stage transitions.

The key rule is:

```text
Session
  -> Run
    -> Task
      -> ContextEnvelope
      -> Agent
      -> Artifact
      -> HandoffEnvelope
      -> next Task
```

`ContextEnvelope` is bounded task working memory assembled by the orchestrator.

`HandoffEnvelope` is the typed bridge that declares what moves to the next stage.

`Session` is continuity, not payload transfer.

`Artifact` is produced output, not automatically durable knowledge.

## Rationale

This keeps the architecture:

- LLM-independent;
- replayable;
- schema-validatable;
- auditable across stages;
- safer against accidental durable writes.

## Consequences

Positive:

- stage handoffs become easier to validate;
- context can be bounded per task;
- provider-hosted model sessions cannot become the source of truth;
- update and curation boundaries remain explicit.

Tradeoffs:

- every stage needs a little more metadata;
- handoff examples must stay aligned with the common envelope shape.

## Follow-ups

- Add concrete handoff schemas for later `plan`, `retrieve`, `reason`, `update`, `curation`, and `evaluate` stages.
- Pair TypeScript reference types with runtime schema validation.
