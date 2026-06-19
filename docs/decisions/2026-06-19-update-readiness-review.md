# Decision: Update Readiness Review

Date: 2026-06-19
Status: accepted

## Context

The update stage now has a baseline, media concept proofs, and a Knowledge Update Agent spec.

Before moving to curation, the tool boundary needs a final review because update sits directly before durable memory governance.

## Decision

Mark the update architecture as ready to hand off to curation design.

Keep the update stage proposal-only.

Require `artifact.read`, `schema.validate`, `candidate.emit`, `artifact.write`, and `audit.trace`.

Allow review, taxonomy validation, duplicate lookup, model assistance, and curation proposal only as optional bounded tools.

Forbid durable memory writes, source reads, broad retrieval, verification checks, lifecycle mutation, index projection mutation, rollback, and deletion.

## Rationale

Update should learn from verified work without becoming an automatic memory writer.

The safest boundary is to consume verification results and emit typed candidates, while leaving evidence support, curation decisions, and durable mutation to their own stages.

## Consequences

- Markdown-first update can be implemented with local artifacts and schemas.
- Curation receives typed candidates instead of raw verification reports.
- Media-derived updates stay conservative until media verification paths are stable.
- Empty update runs remain valid and preferable to noisy memory.

## Follow-ups

- Define curation baseline and `CurationDecision`.
- Detail `UpdateToCurationHandoff`.
- Implement duplicate candidate checks before durable acceptance.
