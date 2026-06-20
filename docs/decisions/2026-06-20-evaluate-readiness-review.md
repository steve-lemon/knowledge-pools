# Decision: Evaluate Readiness Review

Date: 2026-06-20
Status: accepted

## Context

Evaluation is the final canonical loop stage.

It records process quality signals after curation, but it must not become an automatic self-modification mechanism.

## Decision

Mark the evaluate architecture as ready as the final loop baseline.

Require `audit.read_trace`, `audit.trace`, `artifact.read`, `schema.validate`, `evaluation.record`, and `artifact.write`.

Allow aggregate reporting, bounded record search, taxonomy reads, and review requests as optional tools.

Forbid durable memory writes, curation decisions, update candidate emission, verification checks, evidence fetching, source lifecycle mutation, deletion, and direct index projection mutation.

## Rationale

Evaluation should make quality signals visible and reusable for future work.

It should not fix the system silently or bypass update and curation.

## Consequences

- The canonical loop now has baseline and readiness coverage through evaluation.
- Markdown-first implementation can use evaluation reports as regression material.
- Future improvements must still pass through feedback, update, and curation workflows.

## Follow-ups

- Define concrete TypeScript schemas for evaluation reports and signals.
- Implement Markdown-first vertical slice and regression fixture generation.
