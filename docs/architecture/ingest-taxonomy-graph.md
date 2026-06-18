# Ingest: Taxonomy-Governed Graph Entry

This document defines the first major system stage: `ingest`.

Use the canonical terms from [Terminology](terminology.md).

The ingest stage should not only copy raw files into storage. It should convert source material into source-grounded ingest artifacts under a human-governed taxonomy.

Ingest does not create durable knowledge records by itself.

## Reference Reviewed

This design is informed by the local OmniMeta project:

```text
/Users/dujung/Documents/OmniMeta
```

Useful references:

- `README.md`
- `src/types.ts`
- `src/validator.ts`
- `docs/entity-model-guidelines.md`
- `docs/background-taxonomy-entity-review.md`
- `docs/runtime-considerations.md`
- `docs/nosql-migration-playbook.md`
- `examples/domains/*.json`

OmniMeta provides a concrete model for:

- taxonomy bundles;
- category trees;
- attribute definitions;
- vocabularies;
- aliases and normalization;
- entity types;
- relation types;
- validation rules;
- versioned runtime bundles;
- human feedback loops.

## Core Thesis

Ingest should produce structured, versioned, taxonomy-aware artifacts that contain source structure, access units, and shallow graph candidates.

The taxonomy is not fixed forever. It should evolve with human review, validation, versioning, and migration rules.

## Why Taxonomy at Ingest

If taxonomy is delayed until retrieval, the system stores ambiguous records and tries to repair them later.

Putting taxonomy into ingest gives the system:

- consistent entity types and relation types;
- validated attribute definitions and attribute values;
- canonical terms;
- alias normalization;
- stable graph relationships;
- taxonomy version tracking;
- human-reviewable schema changes.

## Ingest Position in the Ultimate Loop

```text
raw source
  -> store original in object storage
  -> parse
  -> create source manifest and access units
  -> classify against taxonomy
  -> extract shallow graph candidates
  -> validate
  -> write source record
  -> write ingest artifact
```

The output of ingest feeds `understand`. Some shallow relation candidates may also be read by `connect`, but semantic interpretation belongs to `understand`.

The boundary between ingest and understand is defined in [Ingest and Understand Boundary](ingest-understand-boundary.md).

Media-specific parsing and access-unit extraction are defined in [Media Ingest Strategies](media-ingest-strategies.md).

The boundary between taxonomy and versioning is defined in [Taxonomy vs Versioning Responsibilities](taxonomy-vs-versioning.md).

Wiki-style source structure is interpreted through [Wiki and Taxonomy Hybrid Architecture](wiki-taxonomy-hybrid.md).

## Taxonomy Bundle

The taxonomy bundle is the human-governed standard used during ingest.

Recommended top-level shape:

```json
{
  "schema_version": "0.1.0",
  "meta": {
    "name": "knowledge-pools-core",
    "description": "Core taxonomy for Knowledge Pools ingestion.",
    "updated_at": "2026-06-18T00:00:00Z"
  },
  "normalization": {},
  "rules": {},
  "categories": [],
  "attributes": [],
  "vocabularies": [],
  "entity_model": {
    "entity_types": [],
    "relation_types": []
  }
}
```

## Taxonomy Components

### Category

A category places a source or entity into a controlled hierarchy.

Examples for Knowledge Pools:

- `document`
- `conversation`
- `decision`
- `concept_note`
- `research_note`
- `code_artifact`
- `external_reference`

Recommended fields:

- `id`
- `name`
- `parent_id`
- `search_path`
- `status`
- `aliases`
- `inherit_attributes`
- `attribute_bindings`

### Attribute Definition

An attribute definition defines a typed property allowed for a category or entity type. Runtime data should call the filled value an `attribute value`.

Examples:

- `source_type`
- `author`
- `created_at`
- `valid_from`
- `valid_until`
- `confidence`
- `domain`
- `lifecycle_status`
- `evidence_strength`

Recommended fields:

- `key`
- `label`
- `type`
- `cardinality`
- `status`
- `aliases`
- `vocab_ref`
- `hint`

### Vocabulary

A vocabulary defines canonical terms and aliases.

Examples:

- lifecycle status: `draft`, `active`, `deprecated`, `superseded`
- evidence strength: `weak`, `medium`, `strong`
- source type: `markdown`, `pdf`, `image`, `audio`, `video`, `json`, `web`, `code`, `conversation`
- knowledge kind: `claim`, `decision`, `concept`, `procedure`, `question`

### Entity Type

An entity type defines a stable graph node role.

Examples:

- `source`
- `claim`
- `decision`
- `concept`
- `procedure`
- `question`
- `person`
- `project`
- `tool`
- `code_module`

Entity types should be low-cardinality, stable, and useful for retrieval or reasoning.

### Relation Type

A relation type defines a stable graph edge.

Examples:

- `derived_from`
- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `mentions`
- `applies_to`
- `authored_by`
- `belongs_to_project`

Relation types should be added only when the edge itself matters for retrieval, reasoning, verification, or maintenance.

## Ingest Artifact

Every ingest run should produce an `IngestArtifact` like:

```json
{
  "artifact_id": "ingest_artifact_01",
  "type": "taxonomy_ingest_result",
  "schema_version": "0.1.0",
  "taxonomy_version": "0.1.0",
  "source_ref": "source_01",
  "source_manifest_ref": "source_manifest_01",
  "access_unit_refs": ["source_01#section_001"],
  "wiki_signals": {
    "outgoing_links": ["source_02"],
    "tags": ["architecture"],
    "aliases": ["ingest design"]
  },
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "markdown",
    "lifecycle_status": "draft"
  },
  "shallow_entities": [
    {
      "id": "marker_heading_01",
      "type": "source",
      "category_ids": ["source"],
      "attribute_values": {
        "marker_kind": "heading",
        "confidence": 1.0
      },
      "evidence_refs": ["source_01#section_001"]
    }
  ],
  "shallow_relations": [
    {
      "type": "derived_from",
      "from_entity_id": "marker_heading_01",
      "to_entity_id": "source_01"
    }
  ],
  "validation": {
    "status": "passed",
    "issues": []
  }
}
```

The `shallow_entities` and `shallow_relations` fields are candidates extracted from visible structure or taxonomy cues. They are not durable knowledge records.

## Human-Governed Evolution

The taxonomy should evolve with people in the loop.

Suggested workflow:

1. Ingest detects unknown category, attribute definition, vocabulary term, entity type, or relation type.
2. System creates a taxonomy change proposal.
3. Human reviews the proposal.
4. Accepted changes update the taxonomy bundle.
5. Bundle validation runs.
6. New bundle version is published.
7. Existing records are migrated or marked with older taxonomy versions.

## Change Proposal Types

Recommended proposal types:

- `add_category`
- `add_attribute`
- `add_vocabulary_term`
- `add_alias`
- `add_entity_type`
- `add_relation_type`
- `deprecate_term`
- `supersede_category`
- `migration_required`

Each proposal should include:

- observed input;
- normalized candidate;
- source evidence;
- affected records or artifacts;
- suggested change;
- risk level;
- reviewer decision.

## Validation Rules

Initial validation should include:

- schema version is valid;
- IDs are unique;
- category parent references exist;
- category graph has no cycles;
- search paths are unique;
- attribute definition keys are unique;
- enum/color attributes reference valid vocabularies;
- vocabulary aliases do not conflict;
- relation endpoints reference known entity types;
- runtime entity instance category IDs are allowed;
- runtime attribute values are allowed by category bindings;
- ingest artifacts include taxonomy version.

## Relation Endpoint Design

OmniMeta uses one `from_entity_type` and one `to_entity_type` per relation type. That is a strong fit for image relations such as `model -> wears -> dress`.

Knowledge graphs often need more flexible relation signatures.

For Knowledge Pools, relation definitions may start with single endpoints, but should support `allowed_endpoint_pairs` as the graph grows.

Example:

```json
{
  "id": "depends_on",
  "label": "Depends On",
  "status": "active",
  "allowed_endpoint_pairs": [
    { "from_entity_type": "decision", "to_entity_type": "concept" },
    { "from_entity_type": "procedure", "to_entity_type": "tool" },
    { "from_entity_type": "code_module", "to_entity_type": "code_module" }
  ]
}
```

Use a single endpoint pair only when the relation is truly narrow.

## What Ingest Should Not Do

Ingest should not:

- silently invent durable taxonomy;
- overwrite old taxonomy semantics;
- treat LLM guesses as accepted graph structure;
- discard source provenance;
- promote every extracted phrase into a graph node;
- create high-cardinality entity types for one-off tags.

## Design Rule

Ingest turns raw material into source-preserved, taxonomy-aware artifacts that contain access units, source signals, and shallow graph candidates.

The taxonomy is allowed to evolve, but only through explicit proposals, validation, and versioning.
