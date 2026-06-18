# Terminology

This document defines canonical terms for Knowledge Pools.

Use these terms consistently in documentation, schemas, code, and user-facing explanations.

## Core Rule

Do not use `schema`, `taxonomy`, `record`, `artifact`, `entity`, or `category` interchangeably.

Each term has a different role in the system.

## Canonical Terms

### Taxonomy

The human-governed conceptual system used to classify and constrain knowledge.

Use when referring to the whole controlled language:

- categories
- attribute definitions
- vocabularies
- entity types
- relation types
- normalization rules
- governance rules

Avoid using `taxonomy` to mean a single JSON file.

### Taxonomy Schema

The structural contract for a taxonomy bundle.

It defines what fields a valid taxonomy bundle may contain.

Use for:

- TypeScript types
- JSON Schema
- validator expectations

Avoid using `schema` when you mean the actual current taxonomy data.

### Taxonomy Bundle

A versioned taxonomy document that conforms to the taxonomy schema.

The bundle is the runtime reference used during ingest.

Required properties:

- name
- version
- checksum
- categories
- attribute definitions
- vocabularies
- entity model
- validation status

### Category

A controlled hierarchical classification assigned to a source record, knowledge record, or entity instance.

Categories answer:

> Where does this thing belong in the taxonomy?

Examples:

- `source`
- `knowledge_record`
- `project_context`
- `research_note`

Do not use category for object role or graph node type. Use `entity type` for that.

### Attribute Definition

A typed property definition in the taxonomy.

Attribute definitions answer:

> What fields are allowed, what type are they, and which vocabulary constrains them?

Examples:

- `source_type`
- `knowledge_kind`
- `confidence`
- `lifecycle_status`

### Attribute Value

The runtime value assigned to an attribute definition.

Example:

```json
{
  "source_type": "markdown",
  "confidence": 0.82
}
```

Do not call runtime values "attributes" without context when precision matters.

### Vocabulary

A controlled set of canonical terms for an enum-like attribute.

Examples:

- source types
- lifecycle statuses
- knowledge kinds

### Vocabulary Term

One canonical value inside a vocabulary.

Example:

```json
{ "value": "markdown", "aliases": ["md"] }
```

### Alias

An alternate input string that normalizes to a canonical category, attribute definition, entity type, relation type, or vocabulary term.

Aliases help ingestion accept human variation without creating duplicate graph meaning.

### Entity Type

A stable graph node role defined by the taxonomy.

Entity types answer:

> What kind of node is this in the knowledge graph?

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

Entity types should be low-cardinality and reusable.

### Entity Instance

A runtime graph node candidate or stored graph node.

Example:

```json
{
  "id": "ent_claim_01",
  "type": "claim",
  "category_ids": ["knowledge_record"],
  "attribute_values": {
    "confidence": 0.7
  }
}
```

### Relation Type

A stable graph edge type defined by the taxonomy.

Relation types answer:

> What kind of relationship is allowed between nodes?

Examples:

- `derived_from`
- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `mentions`

### Relation Instance

A runtime edge candidate or stored graph edge.

Example:

```json
{
  "type": "derived_from",
  "from_entity_id": "ent_claim_01",
  "to_entity_id": "source_01"
}
```

### Source

The original material being ingested.

Examples:

- Markdown file
- PDF
- web page
- code file
- conversation excerpt

The source itself is not the parsed record. It is the underlying material.

### Source Record

A durable metadata record describing a source.

Source records preserve provenance:

- id
- uri or path
- content hash
- imported time
- parser
- taxonomy version

### Source Manifest

A durable manifest that describes how to access a source, especially when the source is large or structured.

Source manifests contain:

- source id
- object URI
- media type
- content hash
- access units
- parser metadata

### Access Unit

A retrievable part of a source.

Examples:

- text chunk
- Markdown section
- PDF page
- PDF text span
- image region
- JSON path

Access units let the system retrieve exact source material for grounded answers without loading an entire file.

### Wiki Signal

A structural or authoring signal extracted from wiki-style source material.

Examples:

- heading
- outgoing link
- backlink
- tag
- alias
- redirect
- citation

Wiki signals are runtime extraction results. They are not taxonomy definitions by default.

### Narrative Layer

The human-authored layer of the system.

It contains source documents, headings, links, tags, and explanatory writing.

The narrative layer is optimized for human understanding, not strict schema control.

### Semantic Control Layer

The taxonomy-governed layer of the system.

It defines accepted categories, attribute definitions, vocabularies, entity types, and relation types.

The semantic control layer is optimized for consistent retrieval, validation, and automation.

### Rendition

A derived representation of a source object, usually for images or PDFs.

Examples:

- image thumbnail
- standard-size image
- OCR-ready image
- rendered PDF page image

Renditions are operational access assets, not taxonomy definitions.

### Source Version

A version of a source created when source content changes.

Source versions are tracked by content hash and object-store version where available.

### Parser Version

The version of the parser or extraction policy that produced a source manifest, access units, or indexed documents.

Parser versions are operational metadata, not taxonomy versions.

### Knowledge Record

A durable record representing reusable knowledge.

Examples:

- claim
- decision
- concept
- procedure
- question

Knowledge records may become graph nodes.

### Artifact

A run-scoped structured output produced by an agent or pipeline step.

Artifacts are inspectable handoff objects.

Examples:

- ingest artifact
- retrieval plan
- evidence bundle
- draft answer
- verification report

Artifacts are not automatically durable knowledge records.

### Ingest Artifact

The structured result of one ingest operation.

It links:

- source record
- source manifest
- taxonomy bundle version
- category assignments
- entity candidates
- relation candidates
- validation result
- taxonomy proposals

### Graph Candidate

An entity instance or relation instance proposed during ingest or understanding.

Graph candidates require validation before becoming graph records.

### Graph Record

A validated and stored graph node or edge.

Graph records should preserve provenance and taxonomy version.

### Taxonomy Proposal

A human-reviewable request to evolve the taxonomy.

Agents can propose taxonomy changes, but humans approve them.

### Context Envelope

A bounded context package assembled by the orchestrator for an agent task.

Do not confuse context envelopes with LLM chat history.

### Session

A continuity boundary for user or workflow state.

The system owns sessions. LLM providers do not.

### Run

One workflow execution inside a session.

Examples:

- ingest a folder
- answer a question
- verify an answer

### Task

One unit of work assigned to one agent.

## Common Confusions

### Category vs Entity Type

Category classifies placement in a taxonomy.

Entity type defines graph node role.

Example:

- category: `knowledge_record`
- entity type: `claim`

### Taxonomy Schema vs Taxonomy Bundle

Taxonomy schema is the structure.

Taxonomy bundle is the versioned data that follows the structure.

### Record vs Artifact

Record is durable domain data.

Artifact is run-scoped workflow output.

An artifact may lead to a record, but they are not the same thing.

### Attribute Definition vs Attribute Value

Attribute definition lives in the taxonomy.

Attribute value lives on a runtime record or entity instance.

### Relation Type vs Relation Instance

Relation type defines allowed edge semantics.

Relation instance is an actual edge between two nodes.

## Naming Rules

Use these suffixes in code and schema names:

- `*Schema` for structural contracts.
- `*Bundle` for versioned taxonomy documents.
- `*Record` for durable stored domain records.
- `*Artifact` for run-scoped workflow outputs.
- `*Type` for taxonomy-defined type definitions.
- `*Instance` for runtime nodes or edges.
- `*Proposal` for human-reviewable changes.

Examples:

- `TaxonomySchema`
- `TaxonomyBundle`
- `SourceRecord`
- `IngestArtifact`
- `EntityType`
- `EntityInstance`
- `RelationType`
- `RelationInstance`
- `TaxonomyProposal`

## Design Rule

When a term could mean either a definition or a runtime value, include the qualifier.

Prefer:

- `attribute definition`
- `attribute value`
- `entity type`
- `entity instance`
- `relation type`
- `relation instance`

Avoid:

- "attribute" when both definition and value are possible;
- "entity" when both type and instance are possible;
- "schema" when the versioned taxonomy data is meant.
