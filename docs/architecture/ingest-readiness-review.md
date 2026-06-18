# Ingest Readiness Review

This document reviews whether the `ingest` architecture is ready to hand off into `understand`.

## Verdict

The ingest architecture is sufficiently reviewed as a v1 architecture baseline.

It is ready to move into the `understand` stage.

It is not yet a complete implementation specification.

## What Is Covered

The current ingest baseline covers:

- source object storage as the ground truth;
- single repository first posture;
- media-specific access strategies;
- Markdown, image, WAV, MP4, and PDF concept proofs;
- source records and source versions;
- source manifests and access units;
- preview artifacts;
- content-minimal indexing;
- deterministic index IDs;
- source version lifecycle and current pointer behavior;
- OpenSearch schema discipline;
- taxonomy-governed classification;
- typed runtime attributes;
- ingest vs understand boundary;
- stage transition guidelines.

## Why This Is Enough To Move Forward

The key architectural boundaries are now explicit:

```text
object store = source truth
source manifest = access contract
access unit = retrievable evidence boundary
preview artifact = navigation aid
OpenSearch = typed retrieval projection
taxonomy = semantic control
ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence
```

The design also avoids the main early traps:

- treating OpenSearch as the content store;
- losing original source provenance;
- using dynamic OpenSearch mappings for arbitrary attributes;
- confusing `source_id` with immutable source content;
- treating previews or summaries as evidence;
- letting ingest silently become semantic understanding.

## Remaining Implementation Risks

These are not blockers for moving to `understand`, but they must be handled before or during implementation.

### 1. Concrete Schemas

Still needed:

- `SourceRecord`;
- `SourceVersion`;
- `SourceManifest`;
- `AccessUnit`;
- `PreviewArtifact`;
- `IngestArtifact`;
- `OpenSearchDocument`;
- validation schemas for all of the above.

### 2. Access Control

The architecture says previews and index documents must respect access policy, but v1 access fields are not yet fully specified.

Minimum needed before real sensitive data:

- `visibility`;
- `sensitivity`;
- `acl_refs`;
- redaction status;
- source fetch audit trail.

### 3. Retention and Deletion

Source versions are retained by default, but deletion and purge behavior are not implemented.

Still needed:

- tombstone policy;
- derived artifact cleanup;
- index projection cleanup;
- legal hold or retention flags.

### 4. Ingest Job Idempotency

The architecture requires deterministic IDs, but job execution still needs concrete resumability rules.

Still needed:

- ingest job id;
- idempotency key;
- per-stage status;
- retry behavior;
- partial failure recovery.

### 5. OpenSearch Reindex Evolution

OpenSearch field schema is defined, but index migration and alias cutover are not fully specified.

Still needed:

- index naming convention;
- mapping version;
- alias-based cutover;
- query regression checks;
- reindex workflow.

### 6. Source Diffing

The system currently supports source versioning, not efficient source diffing.

V1 can full-reingest on content hash change.

Later:

- detect unchanged access units;
- preserve stable evidence refs across versions when possible;
- reindex only changed units.

### 7. Evaluation Fixtures

The architecture defines what must be traceable, but not the regression set yet.

Still needed:

- golden queries;
- expected source refs;
- expected access unit refs;
- index fixture checks;
- grounding checks.

## Move-Forward Rule

Proceed to `understand` if the next work keeps these constraints:

- do not change the ingest boundary without a boundary review;
- do not create durable knowledge in ingest;
- do not add OpenSearch fields without updating the schema;
- do not store raw source content in OpenSearch;
- do not treat preview artifacts as evidence;
- do not drop old source versions while evidence refs depend on them.

## Final Assessment

The ingest design is complete enough as an architecture baseline.

The next stage should define:

- `UnderstandingArtifact`;
- knowledge candidate schema;
- evidence span alignment;
- ambiguity and confidence model;
- handoff from ingest to understand;
- validation that understanding outputs remain candidates.

