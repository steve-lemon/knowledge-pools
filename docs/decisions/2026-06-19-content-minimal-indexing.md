# Decision: Content-Minimal Indexing

Date: 2026-06-19
Status: accepted

## Context

The indexing architecture uses OpenSearch-compatible documents. The user clarified that indexed documents should not directly store source content. The purpose of indexing is to find the right media object, chunk, page, region, section, or access unit, then fetch original content from source storage for answer generation.

## Decision

Adopt a content-minimal indexing policy.

OpenSearch-compatible documents should store source references, taxonomy metadata, access-unit locators, graph candidates, and retrieval metadata. They should not store full source content or full chunks in retrievable document fields.

If full-text keyword search over content is needed, the system may use indexed-but-not-stored search text, where raw text is excluded from document `_source` and exact evidence is fetched from object storage after retrieval.

## Rationale

This preserves a single source of truth for original content, reduces accidental data duplication, limits leakage from index projections, and keeps answer generation grounded in exact source units.

## Consequences

The implementation should:

- define OpenSearch-compatible documents as retrieval maps;
- keep source object storage as the evidence store;
- include source/access-unit refs on every indexed document;
- avoid storing full chunks or full source text in `_source`;
- fetch exact evidence before reasoning or answering.

## Follow-ups

- Define index document shapes with content fields excluded from `_source`.
- Decide whether MVP uses metadata-only search or indexed-but-not-stored search text.
- Add tests that indexed documents contain source refs and do not contain full raw content.

