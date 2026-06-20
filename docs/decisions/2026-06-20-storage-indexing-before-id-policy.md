# Decision: Storage And Indexing Contract Before ID Policy

Date: 2026-06-20
Status: accepted

## Context

The implementation-near spec checklist originally started with shared contracts and IDs.

During review, storage and indexing boundaries were identified as the stronger foundation because they define source truth, projection behavior, access-unit refs, content-minimal indexing, and future media extension constraints.

If ID policy is finalized first, it may accidentally encode assumptions that conflict with storage or retrieval boundaries.

## Decision

Move storage and indexing contract review before shared contracts and ID policy.

Create a P0 storage/indexing spec that defines:

- source object store as evidence source of truth;
- OpenSearch-compatible index as retrieval map;
- source version and manifest ownership;
- access-unit addressing;
- derived and preview artifact storage;
- artifact and trace boundaries;
- required index projection fields;
- content-minimal indexing;
- mapping and typed attribute discipline;
- lifecycle and projection status behavior;
- media extension constraints;
- validation and failure behavior.

The common ID/ref contract must be derived from this storage/indexing contract.

## Rationale

IDs should identify real boundaries in the system.

Those boundaries are created by storage, indexing, source versioning, manifests, access units, artifacts, evidence bundles, and traces.

Defining storage and indexing first prevents ID policy from becoming arbitrary naming.

## Alternatives

Keep shared IDs first.

This keeps the checklist simpler, but risks defining IDs before knowing the storage and indexing objects they identify.

Merge storage/indexing and ID policy into one spec.

This would reduce files, but it would blur infrastructure boundaries with common contract definitions.

## Consequences

The first P0 completed spec is now storage and indexing.

The next P0 spec should define shared contracts and IDs using the storage/indexing contract as input.

Future media expansion must extend the same storage/indexing model rather than creating separate pipelines.

## Follow-ups

- Define `docs/specs/contracts/common-contracts.md`.
- Ensure ID families distinguish logical source, source version, manifest, access unit, artifact, handoff, index projection, evidence, and trace.
- Ensure local store layout implements the storage/indexing contract.
