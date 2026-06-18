# Decision: Media Ingest Strategies and Version Boundaries

Date: 2026-06-19
Status: accepted

## Context

Ingest must handle different media types such as text, PDF, image, JSON, code, and conversations. The user raised additional concerns about large-file chunking, image resolutions, document summaries, wiki-style document links, and source updates.

The key design question is whether these concerns should be managed by taxonomy or by a separate version/access/indexing system.

## Decision

Use media-specific ingest strategies behind a shared ingest contract.

Each strategy produces:

- source record;
- source manifest;
- access units;
- ingest artifact;
- graph candidates;
- OpenSearch index documents.

Taxonomy manages semantic meaning. Versioning, source manifests, and indexing policies manage operational concerns such as chunking, image renditions, source updates, and search projections.

## Rationale

Chunk sizes, PDF locators, image renditions, summaries, and parser versions change for operational reasons. If those are encoded as taxonomy, the taxonomy becomes noisy and unstable.

Taxonomy should remain a human-governed semantic layer for categories, attribute definitions, vocabularies, entity types, and relation types.

## Consequences

The implementation must define:

- media ingest strategy interface;
- source manifest schema;
- access unit schema;
- version fields for source, manifest, parser, taxonomy, and index;
- OpenSearch document shapes for source summaries and detailed access units.

## Follow-ups

- Define concrete `AccessUnit` variants.
- Define image rendition policy.
- Define source update and reindex behavior.
- Define OpenSearch mappings for source-level summary and access-unit detail documents.

