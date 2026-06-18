# Knowledge Model

Knowledge Pools stores more than document chunks.

Use the canonical terms from [Terminology](terminology.md).

## Primary Records and Definitions

Knowledge records should be interpreted through a versioned taxonomy when possible.

See:

- [Ingest: Taxonomy-Governed Graph Entry](ingest-taxonomy-graph.md)
- [Taxonomy Schema](taxonomy-schema.md)
- [Taxonomy Evolution Workflow](taxonomy-evolution.md)

### Source

The original material being ingested.

Fields:

- `id`
- `type`
- `title`
- `uri`
- `created_at`
- `imported_at`
- `author`
- `version`
- `content_hash`
- `taxonomy_version`
- `category_ids`

### Claim

A statement extracted from or supported by sources.

Fields:

- `id`
- `statement`
- `source_ids`
- `evidence_spans`
- `confidence`
- `created_at`
- `valid_from`
- `valid_until`
- `status`

### Decision

A durable project choice with rationale.

Fields:

- `id`
- `title`
- `decision`
- `rationale`
- `alternatives`
- `consequences`
- `decided_at`
- `supersedes`
- `source_ids`

### Concept

A named idea or domain object.

Fields:

- `id`
- `name`
- `aliases`
- `definition`
- `related_concepts`

### Procedure

A reusable method or workflow.

Fields:

- `id`
- `title`
- `steps`
- `preconditions`
- `outputs`
- `failure_modes`

### Question

An unresolved inquiry worth preserving.

Fields:

- `id`
- `question`
- `context`
- `status`
- `related_entities`

### Taxonomy Bundle

A versioned standard for categories, attributes, vocabularies, entity types, and relation types.

Fields:

- `schema_version`
- `meta`
- `normalization`
- `rules`
- `categories`
- `attributes`
- `vocabularies`
- `entity_model`

### Taxonomy Proposal

A human-reviewable request to evolve the taxonomy.

Fields:

- `id`
- `type`
- `status`
- `observed_input`
- `normalized_candidate`
- `source_refs`
- `affected_record_refs`
- `rationale`
- `risk`
- `review`

## Relationship Types

- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `derived_from`
- `mentions`
- `applies_to`
- `answered_by`

## Status Values

Recommended initial status values:

- `draft`
- `active`
- `deprecated`
- `superseded`
- `unknown`
