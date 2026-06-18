# Knowledge Model

Knowledge Pools stores more than document chunks.

## Primary Entities

### Source

An original or imported artifact.

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

