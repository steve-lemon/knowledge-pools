# Decision: Feedback Update Relationships

Date: 2026-06-19
Status: accepted

## Context

The knowledge loop includes `verify -> update -> curation -> evaluate`.

The user asked how relationships are formed when the feedback loop adds new knowledge.

## Decision

Feedback must not become durable memory directly.

Feedback becomes an `UpdateCandidate` first.

Each update candidate should carry:

- source refs or run refs;
- evidence refs;
- related existing records;
- proposed relationships;
- confidence;
- review status.

Durable records are created only after verification and curation.

## Rationale

Feedback can be useful, but it can also be wrong, ambiguous, stale, or too local to preserve.

Treating feedback as a candidate keeps memory curated and preserves traceable relationships such as `supports`, `contradicts`, `supersedes`, `answered_by`, and `derived_from_feedback`.

## Consequences

Implementation should define:

- update candidate schema;
- relationship proposal schema;
- curation decision schema;
- rules for supersession instead of overwriting;
- verification warnings when old knowledge is contradicted or superseded.

