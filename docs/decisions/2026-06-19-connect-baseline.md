# Decision: Connect Baseline

Date: 2026-06-19

Status: Accepted

## Context

The project completed the `understand` baseline and defined candidate-level outputs.

The next stage must relate candidates to existing records and graph context without promoting them to durable truth.

## Decision

Define the `connect` stage as a relationship proposal stage.

The Connection Agent consumes `UnderstandToConnectHandoff`, reads knowledge candidates, searches existing records and graph neighborhoods, and emits `ConnectionArtifact` plus relationship proposals.

Relationship proposals remain candidates until verification and curation.

## Consequences

Positive:

- graph noise is reduced because edges are proposed before acceptance;
- contradiction, support, duplicate, and supersession checks become inspectable;
- existing records can influence interpretation without mutating memory;
- later verification has concrete relationship proposals to audit.

Tradeoffs:

- v1 needs relation proposal schemas before graph storage;
- the system must track unresolved endpoints explicitly;
- overly broad similarity matching could create noise unless quality gates are strict.

## Implementation Note

V1 should start with deterministic local duplicate and mention proposals, then add model-assisted relation proposal only after schema validation and evidence checks are working.
