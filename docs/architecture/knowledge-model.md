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

### Update Candidate

A proposed durable knowledge change produced by feedback, verification, reasoning, or user correction.

Fields:

- `id`
- `candidate_type`
- `proposed_record_kind`
- `status`
- `statement`
- `source_refs`
- `evidence_refs`
- `related_record_refs`
- `relationship_proposals`
- `confidence`
- `requires_review`

Update candidates are not durable knowledge records until curation accepts them.

### Understanding Artifact

A source-grounded interpretation artifact produced by the understand stage.

Fields:

- `id`
- `source_id`
- `source_version_id`
- `source_manifest_ref`
- `taxonomy_bundle_id`
- `taxonomy_version`
- `candidate_refs`
- `ambiguity_refs`
- `review_refs`
- `generator`

Understanding artifacts group candidates and interpretation metadata.

They are not durable knowledge records.

### Knowledge Candidate

A proposed claim, decision, concept, procedure, question, constraint, or bounded summary extracted from source evidence.

Fields:

- `id`
- `candidate_kind`
- `status`
- `statement_ref`
- `short_label`
- `evidence_refs`
- `source_id`
- `source_version_id`
- `taxonomy_bundle_id`
- `taxonomy_version`
- `confidence`
- `ambiguity_refs`
- `requires_review`

Knowledge candidates must remain candidates until connect, verify, and curation stages approve durable storage.

### Connection Artifact

A structured artifact produced by the connect stage.

Fields:

- `id`
- `understanding_artifact_ref`
- `relationship_proposal_refs`
- `duplicate_candidate_refs`
- `unresolved_relation_refs`
- `review_refs`
- `quality_report_ref`
- `taxonomy_bundle_id`
- `taxonomy_version`

Connection artifacts group relationship proposals.

They are not durable graph records.

### Relationship Proposal

A candidate edge between a candidate, record, source, concept, or graph node.

Fields:

- `id`
- `relation_type`
- `status`
- `from_ref`
- `to_ref`
- `evidence_refs`
- `confidence`
- `rationale_ref`
- `ambiguity_refs`
- `requires_review`

Relationship proposals remain candidates until verification and curation approve them.

### Verification Report

An audit artifact produced by the verify stage.

Fields:

- `id`
- `mode`
- `target_artifact_ref`
- `checked_ref_count`
- `verified_refs`
- `rejected_refs`
- `unsupported_refs`
- `uncertain_refs`
- `stale_evidence_refs`
- `review_refs`
- `quality_report_ref`

Verification reports are audit artifacts.

They do not create durable knowledge or graph records.

### Verification Result

A per-target audit result.

Fields:

- `id`
- `target_ref`
- `target_type`
- `status`
- `checks`
- `evidence_refs`
- `confidence`
- `requires_review`

Verification results can guide curation, but they do not apply curation decisions.

## Relationship Types

- `duplicates`
- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `derived_from`
- `mentions`
- `applies_to`
- `answered_by`
- `derived_from_feedback`

## Status Values

Recommended initial status values:

- `draft`
- `active`
- `deprecated`
- `superseded`
- `unknown`
