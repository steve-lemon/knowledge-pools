# Decision: Rollback and Quarantine

Date: 2026-06-19
Status: accepted

## Context

The architecture supports feedback-derived updates, source versioning, and OpenSearch projections.

The user asked whether rollback is possible if wrong data is injected.

Wrong data may enter as a source version, parser output, preview artifact, index projection, update candidate, relation, or accepted knowledge record.

## Decision

Support rollback through quarantine, pointer restoration, projection deactivation, and corrective records.

Rollback must not silently delete or mutate history.

Use the following principles:

- source bytes are immutable source versions;
- current state is controlled by pointers, aliases, and status fields;
- OpenSearch is a rebuildable projection;
- wrong candidates can be rejected;
- wrong accepted knowledge must be retracted or superseded through explicit relationships;
- every rollback creates a rollback event.

## Rationale

The system needs to recover quickly from bad data while preserving provenance.

Hard deletion would make audit, impact analysis, and trust repair difficult.

Quarantine lets the system immediately remove bad data from normal retrieval while keeping enough evidence to understand what happened.

## Alternatives

- Hard delete bad records immediately.
- Overwrite old records in place.
- Treat rollback as only an OpenSearch reindex problem.
- Allow feedback corrections to directly modify durable records.

## Consequences

Normal retrieval must filter out quarantined and retracted records.

The implementation needs:

- rollback event records;
- status fields for source versions, projections, candidates, records, and relations;
- impact analysis over affected refs;
- reindex support from durable source state.

## Follow-ups

- Define rollback CLI commands.
- Define active OpenSearch alias behavior.
- Add automated impact analysis.
- Add verification warnings for answers that used later-quarantined evidence.
