# Decision: Curation Readiness Review

Date: 2026-06-19
Status: accepted

## Context

Curation is the first stage that may write durable memory.

The architecture needs a final tool-permission review before moving to evaluation so that durable writes, lifecycle updates, rollback, deletion, and projection mutation remain clearly bounded.

## Decision

Mark the curation architecture as ready to hand off to evaluation design.

Require `artifact.read`, `schema.validate`, `curation.decide`, `memory.write`, `artifact.write`, and `audit.trace`.

Allow lifecycle status updates, record search, taxonomy validation, review requests, rollback events, and tombstones only as optional bounded tools.

Forbid candidate emission, verification checks, broad retrieval, raw source reads, source writes, source versioning, direct index projection mutation, and provider-specific memory writes.

## Rationale

Curation should be powerful enough to create durable knowledge, but only behind explicit decision artifacts.

The durable write boundary must be visible, traceable, and reversible.

## Consequences

- Every durable record needs a curation decision.
- Rejections and deferrals remain valid outcomes.
- Supersession and retraction are lifecycle state changes, not silent overwrites.
- Projection updates should follow durable state instead of being performed directly by curation.

## Follow-ups

- Define evaluation baseline and `EvaluationReport`.
- Detail `CurationToEvaluateHandoff`.
- Add regression checks for curation decisions and later corrections.
