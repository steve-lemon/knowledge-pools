# Decision: Ingest to Understand Handoff

Date: 2026-06-19
Status: accepted

## Context

The user asked how the Understanding Agent connects to the previous ingest stage.

The architecture already defines the boundary, but the concrete agent-to-agent handoff needed to be made explicit.

## Decision

Define an `IngestToUnderstandHandoff` artifact.

The Ingestion Agent produces it after source records, source versions, source manifests, access units, taxonomy refs, validation reports, and traces are available.

The Understanding Agent consumes it and must validate it before extracting knowledge candidates.

## Rationale

This avoids hidden coupling between the two stages.

Understand should not guess where evidence lives or which source version it is reading.

The handoff preserves the separation:

- ingest owns addressability;
- understand owns interpretation.

## Consequences

The implementation needs:

- a handoff JSON schema;
- producer validation in Ingestion Agent;
- consumer validation in Understanding Agent;
- explicit failure behavior for invalid handoff and unresolved access units.

## Follow-ups

- Add fixtures for valid and invalid handoff examples.
- Add tests that Understanding Agent rejects missing manifest or access-unit refs.
