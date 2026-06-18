# Decision: Source Version ID Lifecycle

Date: 2026-06-19
Status: accepted

## Context

The ID policy separates logical `source_id` from immutable `source_version_id`.

The user raised an important concern: if original source content versions up repeatedly, the system may accumulate old projections, stale access units, previews, and evidence refs.

## Decision

Keep `source_id` stable and create a new `source_version_id` whenever source bytes change to a content hash not already known in the repository.

If a source reverts to a previously seen full content hash, reuse that immutable source version and move the current pointer.

Track the active version with:

- `current_source_version_id`;
- `version_status`;
- `is_current`;
- `supersedes_source_version_id`;
- `superseded_by_source_version_id`.

OpenSearch projections should include current/historical fields so retrieval can default to current sources while still preserving historical evidence.

## Rationale

This prevents stable logical source identity from being confused with immutable source content.

It also lets the system answer both current-state questions and historical questions without overwriting old evidence.

## Consequences

Implementation must:

- update the current pointer only after new ingest/index validation passes;
- keep old manifests and access units addressable while retained evidence refs point to them;
- filter current retrieval by `is_current = true` by default;
- allow historical retrieval when explicitly requested;
- warn verification when superseded evidence is used as current evidence;
- define retention policy before deleting old source versions or derived artifacts.
