# Decision: Stage Transition Boundary Review

Date: 2026-06-19
Status: accepted

## Context

While finalizing the ingest stage, the boundary between `ingest` and `understand` needed explicit clarification.

This showed that every major stage transition can create similar ambiguity if responsibilities, handoff artifacts, candidate status, and durable record boundaries are not reviewed.

## Decision

Before moving from one major stage to the next, perform a required boundary review.

The review must define:

- previous stage responsibilities;
- next stage responsibilities;
- what each stage must not do;
- handoff artifacts;
- required handoff fields;
- candidate vs durable record status;
- validation needed before moving on.

The operational checklist lives in [Stage Transition Guidelines](../operations/stage-transition-guidelines.md).

## Rationale

Knowledge Pools depends on clear separation between source evidence, derived artifacts, semantic candidates, connected graph proposals, verified outputs, and durable memory.

Stage boundary drift would make the system harder to reason about and easier to overfit around LLM-generated interpretation.

## Consequences

Every future transition should update architecture docs before implementation begins.

The implementation plan should not advance to a new major stage unless its boundary and handoff contract are explicit.

