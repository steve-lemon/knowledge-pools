# Decision: Preview Artifacts

Date: 2026-06-19
Status: accepted

## Context

The system needs fast browsing and retrieval inspection across multiple media types without turning OpenSearch into a duplicate content store.

Images need thumbnails or resized renditions. Long documents need summaries or outlines. Audio needs waveform or proxy previews. These are useful, but they are derived data rather than original evidence.

## Decision

Introduce `PreviewArtifact` as a source-derived object.

Preview artifacts are stored beside the source version, usually under `derived/`.

The index may store preview refs and small metadata, but not large preview content.

## Rationale

This keeps the architecture simple:

- original content remains the source of truth;
- access units remain the grounding boundary;
- preview artifacts improve navigation and UI;
- OpenSearch remains a retrieval map;
- preview generation can evolve independently from taxonomy.

## Consequences

Every preview artifact should record:

- source id;
- source version;
- `derived_from` refs;
- preview kind;
- object URI;
- content hash;
- generator name;
- generator version;
- access policy.

Answer generation should not treat preview artifacts as final evidence unless the preview itself is the target being discussed.

