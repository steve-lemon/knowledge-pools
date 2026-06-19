# Terminology

This document defines canonical terms for Knowledge Pools.

Use these terms consistently in documentation, schemas, code, and user-facing explanations.

## Core Rule

Do not use `schema`, `taxonomy`, `record`, `artifact`, `entity`, or `category` interchangeably.

Each term has a different role in the system.

## Canonical Terms

### Stage, Agent, and Artifact Names

Use stage names as lowercase verb-like workflow steps.

Use agent names as noun phrases ending in `Agent`, except `Retrieval Planner`, which is a planner role.

Primary artifact names should match the stage outcome.

Canonical stage order:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

Older short explanations may omit `plan`, `curation`, and `evaluate`, but implementation documents should use the canonical order above.

| Stage | Canonical agent name | Primary output artifact | Meaning |
| --- | --- | --- | --- |
| `ingest` | `Ingestion Agent` | `IngestArtifact` | Preserve and structure source evidence |
| `understand` | `Understanding Agent` | `UnderstandingArtifact` | Convert source evidence into knowledge candidates |
| `connect` | `Connection Agent` | `ConnectionArtifact` | Propose relationships between candidates and existing knowledge |
| `plan` | `Retrieval Planner` | `RetrievalPlan` | Understand user task and decide retrieval strategy |
| `retrieve` | `Retrieval Agent` | `EvidenceBundle` | Gather source-grounded evidence |
| `reason` | `Reasoning Agent` | `DraftAnswer` or `ProposedAction` | Synthesize from evidence |
| `verify` | `Verifier Agent` | `VerificationReport` | Audit grounding, freshness, and conflicts |
| `update` | `Knowledge Update Agent` | `UpdateCandidate` | Propose reusable memory changes |
| `curation` | `Curation Agent` | `CurationDecision` | Decide what becomes durable memory |
| `evaluate` | `Evaluation Agent` | `EvaluationReport` | Record quality signals and improvement data |

Do not use `Understanding Agent` for user-question interpretation.

User-question interpretation is `task understanding`, and it belongs to `Retrieval Planner`.

#### Naming Pattern

Prefer these forms:

- stage: `ingest`
- agent: `Ingestion Agent`
- artifact: `IngestArtifact`
- task intent: `ingest_source`
- tool namespace: `source.*`, `artifact.*`, `candidate.*`

Avoid mixing forms:

- do not call the `ingest` stage "ingestion" unless referring to the agent or general activity;
- do not call source `understand` "task understanding";
- do not call `Retrieval Planner` the "Planning Agent" unless the role is renamed everywhere.

### Candidate and Proposal Quick Map

Use these names to avoid mixing stage responsibilities:

| Term | Stage | Meaning | Durable? |
| --- | --- | --- | --- |
| `ShallowRelationCandidate` | `ingest` | Visible source-structure relation signal | No |
| `KnowledgeCandidate` | `understand` | Proposed claim, decision, concept, procedure, question, constraint, or summary | No |
| `RelationshipProposal` | `connect` | Proposed edge between candidates, records, sources, or graph context | No |
| `GraphRecord` | after verification and curation | Accepted graph node or edge | Yes |

Do not call a `RelationshipProposal` a `relation candidate`.

Reserve `relation candidate` language for shallow ingest signals only, and prefer `ShallowRelationCandidate` when possible.

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

### Preview Artifact

A source-derived object optimized for quick browsing, triage, or retrieval inspection.

Examples:

- image thumbnail
- standard-size image preview
- document summary
- heading outline
- page thumbnail
- waveform preview
- spectrogram preview
- low-bitrate audio proxy
- video poster frame
- storyboard preview
- low-bitrate video proxy

Preview artifacts are not the source of truth. They must keep a `derived_from` reference back to a source version or access unit.

Preview artifacts may be durable within a source version, but they should not become taxonomy definitions or replace exact source access units for answer grounding.

### Source Version

A version of a source created when source content changes.

Source versions are tracked by content hash and object-store version where available.

### Source Version ID

A deterministic identifier for an immutable source version.

Source version IDs should change when source bytes change.

Changing taxonomy classification, preview generation, or index projection should not create a new source version ID unless the original source content changed.

### Media Hint

A compact normalized type hint used in IDs and routing.

Examples:

- `md`
- `pdf`
- `jpg`
- `png`
- `wav`
- `mp4`
- `json`

The media hint is not authoritative. The authoritative field is `media_type`.

### Index Document ID

The deterministic identifier used as the OpenSearch `_id` for one indexed projection.

Index document IDs are projection IDs. They should point back to durable source IDs, source version IDs, access unit IDs, preview artifact IDs, and full hashes.

### OpenSearch Projection

A typed search document derived from source records, access units, preview artifacts, candidates, or durable records.

OpenSearch projections are retrieval maps. They are not source truth and should not contain unrestricted source content.

### Typed Attribute Entry

The OpenSearch-safe representation of a runtime taxonomy attribute.

Instead of dynamic fields such as `attribute_values.confidence`, use a typed entry:

```json
{
  "key": "confidence",
  "value_type": "number",
  "number_value": 0.82
}
```

Typed attribute entries prevent the same attribute name from being indexed with different OpenSearch data types.

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

### Agent Superclass Contract

The shared runtime contract that every agent implementation must satisfy.

It defines common task, context, artifact, validation, trace, error, tool grant, and handoff shapes.

It does not define stage-specific semantics.

Detailed behavior remains in each agent spec.

### Stage-Specific Agent

An implementation of one loop stage, such as the Ingestion Agent, Understanding Agent, or Verifier Agent.

A stage-specific agent provides its own input payload, output artifact payload, validation rules, and handoff payload while satisfying the Agent Superclass Contract.

### Artifact

A run-scoped structured output produced by an agent or pipeline step.

Artifacts are inspectable outputs.

Examples:

- ingest artifact
- retrieval plan
- evidence bundle
- draft answer
- verification report

Artifacts are not automatically durable knowledge records.

### Handoff Envelope

A typed transition object that transfers responsibility from one stage or agent to another.

Handoff envelopes contain refs, constraints, validation status, quality report refs, and trace refs.

They should not contain unbounded source content.

A handoff references artifacts.

It is not the same thing as the artifact itself.

### Handoff Artifact

A persisted artifact representation of a `HandoffEnvelope`.

Use this term only when referring to the stored JSON artifact.

### IngestToUnderstandHandoff

The handoff artifact produced by the Ingestion Agent and consumed by the Understanding Agent.

It links:

- source id;
- source version id;
- source manifest ref;
- ingest artifact ref;
- access unit refs;
- taxonomy bundle id and version;
- parser policy ref;
- source content hash;
- media type and media hint;
- validation status;
- trace refs.

It lets Understand fetch exact evidence without guessing how ingest stored the source.

### Ingest Artifact

The structured result of one ingest operation.

It links:

- source record
- source manifest
- taxonomy bundle version
- category assignments
- entity candidates
- shallow relation candidates
- validation result
- taxonomy proposals

Ingest artifacts may include shallow candidates from visible structure, but they are not durable knowledge records.

### Shallow Relation Candidate

A visible-structure relation signal emitted during ingest.

Examples:

- wiki link;
- citation marker;
- explicit backlink;
- file reference;
- table-of-contents relation;
- visible media annotation link.

Shallow relation candidates do not assert semantic meaning.

They may become hints for `understand` or `connect`, but they are not relationship proposals.

### Understanding Artifact

The structured result of interpreting one or more ingest artifacts into knowledge candidates.

It links:

- source record;
- source manifest;
- access units;
- taxonomy bundle version;
- knowledge candidates;
- evidence spans;
- confidence notes;
- ambiguity notes;
- review requirements.

Understanding artifacts are still candidates. They become durable knowledge only after connection, verification, and curation.

Understanding artifacts come from source/document understanding, not from runtime user-question interpretation.

### Task Understanding

The runtime interpretation of a user's question, instruction, or workflow request.

Task understanding identifies intent, constraints, required evidence types, freshness scope, and expected answer shape.

It belongs to planning, not to the source `understand` stage.

### Retrieval Plan

A run-scoped artifact produced by the `plan` stage.

It describes:

- task intent;
- expected answer shape;
- freshness scope;
- required evidence types;
- retrieval steps;
- conflict-search requirement;
- retrieval budget or limits.

It is not an evidence bundle.

It is not an answer.

It may be media-aware, but it is not media evidence.

For media-specific examples, see [Media Plan Concept Proofs](media-plan-concept-proofs.md).

### PlanToRetrieveHandoff

The handoff envelope produced by the Retrieval Planner and consumed by the Retrieval Agent.

It carries the retrieval plan ref and constraints needed to gather evidence.

### Required Evidence Type

A planner-level label for the kind of evidence retrieval should gather.

Examples:

- `markdown_section`;
- `image_region`;
- `ocr_span`;
- `transcript_span`;
- `subtitle_span`;
- `pdf_page`;
- `decision_record`.

Required evidence types guide retrieval.

They are not evidence refs themselves.

### Retrieval Step

One executable search or lookup instruction inside a `RetrievalPlan`.

Examples:

- `source_lookup`;
- `keyword_search`;
- `record_search`;
- `graph_query`;
- `preview_lookup`.

Retrieval steps describe how to search.

They do not contain the fetched evidence.

### Retrieval Budget

A planner-defined limit that bounds retrieval cost, breadth, or media-heavy fetches.

Examples:

- maximum evidence refs;
- maximum search steps;
- avoid full video/audio fetch;
- require bounded clips or time ranges.

Retrieval budget helps prevent broad media queries from becoming unbounded source reads.

### Knowledge Candidate

A proposed claim, decision, concept, procedure, question, constraint, or bounded summary extracted from source evidence.

Knowledge candidates must keep evidence refs and remain candidates until connect, verify, and curation stages approve durable storage.

### Connection Artifact

The structured result of relating knowledge candidates to other candidates, sources, records, or graph context.

Connection artifacts link relationship proposal refs, duplicate refs, unresolved relation refs, review refs, quality reports, taxonomy refs, and trace refs.

They are not durable graph records.

### Relationship Proposal

A candidate edge emitted by the connect stage.

Relationship proposals include relation type, endpoints, evidence refs, confidence, rationale refs, ambiguity refs, review flags, and taxonomy refs.

They remain proposals until verification and curation approve durable graph storage.

Use `Relationship Proposal` for the output of `connect`.

Do not call it a `relation candidate` unless referring to shallow ingest signals.

### Relation Hint

A non-authoritative signal that may help `connect` propose a relationship.

Relation hints can come from:

- shallow relation candidates;
- wiki links;
- explicit mentions;
- understand ambiguity notes;
- prior graph neighborhoods;
- search results.

Relation hints are inputs to relationship proposal, not relationship proposal outputs.

### Endpoint Ref

A reference to one side of a relationship proposal.

Endpoint refs may point to:

- knowledge candidates;
- relationship proposals;
- source records;
- access units;
- knowledge records;
- graph records;
- concepts or entities.

Every relationship proposal must have a `from_ref` and `to_ref`.

If an endpoint cannot be resolved, the proposal must be marked unresolved rather than accepted.

### UnderstandToConnectHandoff

The handoff artifact produced by the Understanding Agent and consumed by the Connection Agent.

It links:

- understanding artifact ref;
- knowledge candidate refs;
- ambiguity refs;
- review refs;
- quality report ref;
- source id;
- source version id;
- taxonomy bundle id and version;
- validation status;
- trace refs.

It lets Connect relate only validated candidate outputs without guessing which understand artifacts are ready.

### Ambiguity Note

A structured note that records uncertainty in an interpretation.

Use ambiguity notes when evidence is incomplete, wording has multiple possible meanings, source quality is weak, or a candidate is inferred rather than explicit.

### Review Request

A human or system review marker attached to a candidate, ambiguity, relation hint, or generated artifact.

Review requests should include the target ref, reason, review type, and whether the issue blocks later stages.

### Graph Candidate

An entity instance proposed before durable graph storage.

Graph candidates require validation before becoming graph records.

Use `Relationship Proposal` for candidate edges emitted by `connect`.

### Graph Record

A validated and stored graph node or edge.

Graph records should preserve provenance and taxonomy version.

### Verification Report

The structured audit output produced by the Verifier Agent.

Verification reports group verification result refs, checked target refs, unsupported refs, stale evidence refs, uncertainty, review refs, quality reports, taxonomy refs, and trace refs.

They do not write durable memory or graph records.

### Verification Result

A per-target audit result produced by the verify stage.

Verification results indicate whether a relationship proposal, draft answer claim, or proposed action is `verified`, `rejected`, `unsupported`, `uncertain`, `stale`, or `needs_review`.

Verification results guide curation, but they are not curation decisions.

### Quarantine

A temporary or permanent exclusion state for suspicious or known-bad data.

Quarantined records remain addressable for audit and impact analysis, but normal retrieval should exclude them.

### Retraction

A status for accepted knowledge that was later found to be wrong.

Retraction differs from supersession.

Use `retracted` when the prior record was invalid.

Use `superseded` when the prior record was valid but replaced by newer knowledge.

### Rollback Event

A durable operational record describing how bad data was isolated, deactivated, restored, corrected, or purged.

Rollback events should reference affected source versions, projections, candidates, knowledge records, relations, and runs.

### Tombstone

A durable marker that a source, version, access unit, preview, candidate, record, or relation has been hidden, deleted, archived, or purged from the active knowledge path.

Tombstones preserve lifecycle state without requiring immediate physical deletion.

### Soft Delete

A reversible deletion mode that removes content from normal retrieval and reasoning while keeping source objects and audit metadata.

### Purge

A physical deletion workflow for source bytes, derived artifacts, or index projections.

Purge is policy-driven and should happen only after retention, legal hold, evidence dependency, and audit checks.

### Taxonomy Proposal

A human-reviewable request to evolve the taxonomy.

Agents can propose taxonomy changes, but humans approve them.

### Context Envelope

A bounded context package assembled by the orchestrator for an agent task.

Do not confuse context envelopes with LLM chat history.

Do not confuse context envelopes with handoff envelopes.

Context defines what one task may see.

Handoff defines what moves to the next stage.

### Session

A continuity boundary for user or workflow state.

The system owns sessions. LLM providers do not.

Session is not a payload transport between stages.

### Run

One workflow execution inside a session.

Examples:

- ingest a folder
- answer a question
- verify an answer

### Task

One unit of work assigned to one agent.

For the complete object boundary, see [Stage Data Flow Contract](stage-data-flow-contract.md).

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
