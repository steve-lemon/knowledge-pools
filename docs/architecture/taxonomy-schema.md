# Taxonomy Schema

This document defines the starting taxonomy schema for Knowledge Pools.

Use the canonical terms from [Terminology](terminology.md).

It adapts the OmniMeta pattern from image metadata to general knowledge ingestion.

## Top-Level Schema

```json
{
  "schema_version": "0.1.0",
  "meta": {
    "name": "knowledge-pools-core",
    "description": "Core taxonomy for source-grounded knowledge ingestion.",
    "updated_at": "2026-06-18T00:00:00Z"
  },
  "normalization": {
    "case_insensitive": true,
    "trim_whitespace": true,
    "unicode_normalization": "NFC",
    "alias_resolution_order": [
      "attribute_alias",
      "category_alias",
      "vocabulary_term_alias",
      "entity_type_alias",
      "relation_type_alias"
    ],
    "deprecated_policy": {
      "accept_input": true,
      "store_as_canonical_if_possible": true,
      "warn_on_use": true
    }
  },
  "rules": {
    "id_unique": true,
    "attribute_key_unique": true,
    "search_path_unique": true,
    "child_override_parent": true,
    "status_values": ["draft", "active", "deprecated", "superseded"],
    "multi_category": {
      "enabled": true,
      "max_categories_per_record": 5,
      "attribute_merge_strategy": "union"
    }
  },
  "categories": [],
  "attributes": [],
  "vocabularies": [],
  "entity_model": {
    "entity_types": [],
    "relation_types": []
  }
}
```

## Status Values

Knowledge Pools needs more lifecycle nuance than OmniMeta's initial `active | deprecated`.

Recommended statuses:

- `draft`
- `active`
- `deprecated`
- `superseded`

Optional runtime status:

- `unknown`

Use `unknown` for extracted runtime records when the system cannot classify confidence yet. Avoid using it for taxonomy definitions.

## Initial Categories

```json
[
  {
    "id": "source",
    "name": "Source",
    "parent_id": null,
    "search_path": "source",
    "status": "active",
    "aliases": ["document", "artifact"],
    "inherit_attributes": false,
    "attribute_bindings": [
      { "key": "source_type", "required": true, "status": "active" },
      { "key": "lifecycle_status", "required": false, "status": "active" }
    ]
  },
  {
    "id": "knowledge_record",
    "name": "Knowledge Record",
    "parent_id": null,
    "search_path": "knowledge_record",
    "status": "active",
    "aliases": ["record"],
    "inherit_attributes": false,
    "attribute_bindings": [
      { "key": "knowledge_kind", "required": true, "status": "active" },
      { "key": "confidence", "required": false, "status": "active" },
      { "key": "lifecycle_status", "required": false, "status": "active" }
    ]
  },
  {
    "id": "project_context",
    "name": "Project Context",
    "parent_id": null,
    "search_path": "project_context",
    "status": "active",
    "aliases": ["project"],
    "inherit_attributes": false,
    "attribute_bindings": [
      { "key": "domain", "required": false, "status": "active" }
    ]
  }
]
```

## Initial Attribute Definitions

```json
[
  {
    "key": "source_type",
    "label": "Source Type",
    "type": "enum",
    "cardinality": "single",
    "status": "active",
    "vocab_ref": "vocab_source_type"
  },
  {
    "key": "knowledge_kind",
    "label": "Knowledge Kind",
    "type": "enum",
    "cardinality": "single",
    "status": "active",
    "vocab_ref": "vocab_knowledge_kind"
  },
  {
    "key": "lifecycle_status",
    "label": "Lifecycle Status",
    "type": "enum",
    "cardinality": "single",
    "status": "active",
    "vocab_ref": "vocab_lifecycle_status"
  },
  {
    "key": "confidence",
    "label": "Confidence",
    "type": "number",
    "cardinality": "single",
    "status": "active"
  },
  {
    "key": "domain",
    "label": "Domain",
    "type": "string",
    "cardinality": "multi",
    "status": "active"
  }
]
```

## Initial Vocabularies

```json
[
  {
    "id": "vocab_source_type",
    "status": "active",
    "terms": [
      { "value": "markdown", "status": "active", "aliases": ["md"] },
      { "value": "pdf", "status": "active" },
      { "value": "image", "status": "active", "aliases": ["jpg", "jpeg", "png"] },
      { "value": "audio", "status": "active", "aliases": ["wav"] },
      { "value": "video", "status": "active", "aliases": ["mp4"] },
      { "value": "json", "status": "active" },
      { "value": "web", "status": "active", "aliases": ["url", "html"] },
      { "value": "code", "status": "active" },
      { "value": "conversation", "status": "active", "aliases": ["chat"] }
    ]
  },
  {
    "id": "vocab_knowledge_kind",
    "status": "active",
    "terms": [
      { "value": "claim", "status": "active" },
      { "value": "decision", "status": "active" },
      { "value": "concept", "status": "active" },
      { "value": "procedure", "status": "active" },
      { "value": "question", "status": "active" }
    ]
  },
  {
    "id": "vocab_lifecycle_status",
    "status": "active",
    "terms": [
      { "value": "draft", "status": "active" },
      { "value": "active", "status": "active" },
      { "value": "deprecated", "status": "active" },
      { "value": "superseded", "status": "active" }
    ]
  }
]
```

## Initial Entity Model

```json
{
  "entity_types": [
    { "id": "source", "label": "Source", "status": "active" },
    { "id": "claim", "label": "Claim", "status": "active" },
    { "id": "decision", "label": "Decision", "status": "active" },
    { "id": "concept", "label": "Concept", "status": "active" },
    { "id": "procedure", "label": "Procedure", "status": "active" },
    { "id": "question", "label": "Question", "status": "active" },
    { "id": "project", "label": "Project", "status": "active" },
    { "id": "person", "label": "Person", "status": "active" },
    { "id": "tool", "label": "Tool", "status": "active" },
    { "id": "code_module", "label": "Code Module", "status": "active" }
  ],
  "relation_types": [
    {
      "id": "derived_from",
      "label": "Derived From",
      "status": "active",
      "from_entity_type": "claim",
      "to_entity_type": "source"
    },
    {
      "id": "supports",
      "label": "Supports",
      "status": "active",
      "from_entity_type": "source",
      "to_entity_type": "claim"
    },
    {
      "id": "contradicts",
      "label": "Contradicts",
      "status": "active",
      "from_entity_type": "claim",
      "to_entity_type": "claim"
    },
    {
      "id": "supersedes",
      "label": "Supersedes",
      "status": "active",
      "from_entity_type": "decision",
      "to_entity_type": "decision"
    },
    {
      "id": "depends_on",
      "label": "Depends On",
      "status": "active",
      "allowed_endpoint_pairs": [
        {
          "from_entity_type": "decision",
          "to_entity_type": "concept"
        },
        {
          "from_entity_type": "procedure",
          "to_entity_type": "tool"
        },
        {
          "from_entity_type": "code_module",
          "to_entity_type": "code_module"
        }
      ]
    },
    {
      "id": "mentions",
      "label": "Mentions",
      "status": "active",
      "allowed_endpoint_pairs": [
        {
          "from_entity_type": "source",
          "to_entity_type": "concept"
        },
        {
          "from_entity_type": "source",
          "to_entity_type": "person"
        },
        {
          "from_entity_type": "source",
          "to_entity_type": "tool"
        },
        {
          "from_entity_type": "source",
          "to_entity_type": "project"
        }
      ]
    },
    {
      "id": "references",
      "label": "References",
      "status": "active",
      "from_entity_type": "source",
      "to_entity_type": "source"
    },
    {
      "id": "same_as",
      "label": "Same As",
      "status": "active",
      "from_entity_type": "source",
      "to_entity_type": "source"
    },
    {
      "id": "redirects_to",
      "label": "Redirects To",
      "status": "active",
      "from_entity_type": "source",
      "to_entity_type": "source"
    }
  ]
}
```

## Relation Endpoint Rule

For narrow relations, `from_entity_type` and `to_entity_type` are enough.

For general knowledge graph relations, prefer `allowed_endpoint_pairs`.

This avoids either:

- creating many overly specific relation names too early;
- allowing vague edges such as `related_to` with no useful constraints.

## Human Evolution Rule

The schema starts small.

New categories, attribute definitions, vocabularies, entity types, and relation types should be added only through explicit change proposals and validation.

The taxonomy should act like a shared language between humans and agents, not an uncontrolled pile of tags.
