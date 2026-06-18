# Decision: Index ID Policy

Date: 2026-06-19
Status: accepted

## Context

Indexing requires stable IDs for repeatable ingest, update handling, deduplication, and source traceability.

The user suggested including a hash key and type extension in IDs. This is useful, but extension alone should not define identity because filenames and extensions can be wrong or renamed.

## Decision

Use deterministic compound IDs for OpenSearch-compatible documents:

```text
kp:{repository_id}:{document_kind}:{media_hint}:{source_hash_prefix}:{scope}
```

The ID may include a normalized media hint such as `md`, `pdf`, `jpg`, `png`, `wav`, or `json`.

The indexed document must also store:

- full content hash;
- authoritative media type;
- source id;
- source version id;
- manifest ref;
- access unit or preview refs.

## Rationale

This gives IDs that are readable, deterministic, and compact while preserving full traceability.

The hash makes immutable source versions and repeated ingest easier to reason about. The media hint makes operational inspection easier. The repository and scope fields keep room for future multi-repository and clustered retrieval.

## Consequences

Implementation must:

- compute full hashes before indexing;
- detect media type independently from filename extension;
- treat OpenSearch `_id` as a projection ID;
- validate hash-prefix collisions against full hashes;
- regenerate projection IDs when source version changes;
- keep taxonomy changes separate from source version identity.

