# Decision: Simplified Infrastructure Baseline

Date: 2026-06-19
Status: accepted

## Context

The architecture had several possible storage targets: filesystem, SQLite, Postgres, Kuzu, pgvector, Qdrant, and keyword indexes. Before implementation, the infrastructure needs a simpler baseline.

The user requested:

- original sources stored in filesystem-compatible storage such as AWS S3;
- support for large files and long documents;
- taxonomy-based analysis saved into an indexing server;
- OpenSearch as the main indexing server;
- durable links from indexed records back to original sources for grounded answer generation.

## Decision

Use object storage plus OpenSearch as the v1 infrastructure baseline.

Object storage is the source-of-truth layer for original files.

OpenSearch is the main searchable projection layer for taxonomy-aware analysis, source records, access units, graph candidates, knowledge records, and retrieval metadata.

## Rationale

This keeps the first implementation practical while still supporting detailed search, structured filters, taxonomy filters, nested entity/relation queries, and later source-grounded answer generation.

## Consequences

The first implementation should prioritize:

- source manifests;
- access-unit locators;
- OpenSearch mappings;
- source provenance fields;
- taxonomy-aware indexed documents;
- source-unit retrieval for answer grounding.

Standalone graph databases, vector databases, and relational metadata stores are deferred.

## Follow-ups

- Define OpenSearch document shapes.
- Define source manifest schema.
- Define access unit schema for text, PDF, image, and JSON.
- Update ingest implementation plan around object storage and OpenSearch.

