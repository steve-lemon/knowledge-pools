# Decision: Taxonomy-Governed Ingest

Date: 2026-06-18
Status: accepted

## Context

The first major stage to design is `ingest`. The user proposed introducing a taxonomy system and building primarily around a knowledge graph. The user also noted that schemas and structures should evolve together with humans.

The local OmniMeta project at `/Users/dujung/Documents/OmniMeta` was reviewed as a reference. It provides a concrete taxonomy model with categories, attributes, vocabularies, aliases, entity types, relation types, validation, runtime bundles, and migration guidance.

## Decision

Design Knowledge Pools ingest as a taxonomy-governed graph entry stage.

Ingest should:

- preserve raw sources;
- classify sources and extracted candidates against a versioned taxonomy;
- produce graph-ready artifacts;
- validate categories, attributes, vocabularies, entities, and relations;
- record taxonomy version on every ingest artifact;
- create taxonomy change proposals when unknown concepts appear;
- require human review before taxonomy changes become durable standards.

## Rationale

This prevents the graph from becoming an uncontrolled set of LLM-generated tags. It also makes retrieval, reasoning, verification, and migration more reliable because graph records are built from explicit schemas and controlled vocabularies.

## Alternatives

- Ingest raw chunks first and classify later.
- Let agents invent graph nodes and edge types freely.
- Use only vector embeddings for early ingestion.
- Hard-code schema once and avoid taxonomy evolution.

## Consequences

The first implementation must include taxonomy schema, validation, and proposal records earlier than originally planned. This adds upfront structure, but it supports the project's goal of a durable, inspectable, human-aligned knowledge graph.

## Follow-ups

- Create an initial `knowledge-pools-core` taxonomy bundle.
- Define validation rules for the taxonomy.
- Add ingest artifact and taxonomy proposal schemas.
- Decide whether to reuse OmniMeta code patterns directly or reimplement a smaller Knowledge Pools-specific validator.

