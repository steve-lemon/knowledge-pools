# Ingestion Agent Spec

This document defines the v1 contract for the Ingestion Agent.

The Ingestion Agent implements the `ingest` stage.

It stores source material, creates source versions, parses structure, creates access units, applies taxonomy-aware classification, emits shallow candidates, and writes ingest artifacts.

It does not extract durable semantic knowledge.

## Purpose

The Ingestion Agent turns raw source inputs into source-grounded, versioned, retrievable artifacts.

```text
raw source
  -> IngestionAgent
  -> SourceRecord
  -> SourceVersion
  -> SourceManifest
  -> AccessUnit[]
  -> PreviewArtifact[]
  -> IngestArtifact
  -> shallow candidates
```

The agent prepares evidence for later understanding and retrieval.

## Responsibilities

The agent owns:

- accepting raw file or object refs;
- detecting media type;
- computing source hash;
- creating or resolving `source_id` and `source_version_id`;
- storing source records and source-version metadata;
- parsing source structure;
- creating source manifests;
- creating access units;
- creating preview artifact refs when available;
- loading and validating taxonomy bundle refs;
- applying source/access-unit category assignments;
- emitting shallow candidates from visible structure;
- writing ingest artifacts;
- writing content-minimal index projections when enabled;
- emitting validation reports and traces.

The agent does not own:

- semantic claim extraction beyond obvious typed markers;
- durable knowledge creation;
- cross-source relationship decisions;
- contradiction or supersession decisions;
- curation;
- rollback;
- deletion policy.

## Trigger

The agent may run when:

- a file or object is added;
- a source path changes;
- a user requests ingest for a folder;
- a source version hash changes;
- parser policy changes require reingest;
- taxonomy classification needs refresh.

V1 should support manual or CLI-triggered ingest first.

## Task Contract

Recommended task shape:

```json
{
  "task_id": "task_ingest_001",
  "run_id": "run_001",
  "agent_id": "ingestion_agent",
  "stage": "ingest",
  "intent": "ingest_source",
  "input": {
    "source_uri": "file:///knowledge/input/notes.md",
    "repository_id": "repo_main",
    "source_id": null,
    "mode": "markdown_v1"
  },
  "constraints": {
    "preserve_original": true,
    "create_access_units": true,
    "allow_index_projection": false,
    "preferred_precision": "high"
  },
  "allowed_tool_ports": [
    "source.read",
    "source.write",
    "source.version",
    "hash.compute",
    "mime.detect",
    "parse.document",
    "chunk.create",
    "taxonomy.read",
    "taxonomy.validate",
    "artifact.write",
    "audit.trace"
  ]
}
```

## Context Envelope

Recommended fields:

- `context_id`;
- `task_id`;
- `run_id`;
- `repository_id`;
- `source_uri`;
- `source_id`;
- `taxonomy_bundle_ref`;
- `taxonomy_version`;
- `parser_policy_ref`;
- `index_policy_ref`;
- `allowed_tool_ports`;
- `schema_refs`;
- `excluded_context`.

The context should carry refs and policies, not unbounded source text.

## Tool Contract

Required ports:

- `source.read`;
- `source.write`;
- `source.version`;
- `hash.compute`;
- `mime.detect`;
- `parse.document`;
- `chunk.create`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `parse.media`;
- `preview.create`;
- `taxonomy.classify`;
- `taxonomy.propose`;
- `index.write_projection`;
- `schema.validate`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `curation.propose`;
- `rollback.create_event`;
- `delete.create_tombstone`;
- `source.tombstone`;
- `source.restore`.

Maximum side effect level:

- `mutate_projection` when index projection is enabled;
- otherwise `derive` plus source-version writes.

The agent may write source and ingest artifacts.

It must not write durable knowledge records.

## Processing Pipeline

V1 pipeline:

```text
1. read task and context envelope
2. verify allowed tool ports
3. read source bytes or source object metadata
4. detect media type and media hint
5. compute content hash
6. create or resolve source version
7. parse document structure
8. create source manifest
9. create access units
10. load and validate taxonomy bundle
11. assign source/access-unit categories
12. emit shallow candidates from visible structure
13. write source and ingest artifacts
14. optionally write index projections
15. write validation report
16. emit trace events
```

V1 should start with Markdown/text.

Media-specific parsing can be added through `parse.media` later.

## V1 Extraction Policy

Ingest can emit shallow candidates only when visible source structure makes them obvious.

Allowed examples:

| Source pattern | Shallow output |
| --- | --- |
| Markdown heading | heading access unit |
| Wiki link | link signal or relation candidate |
| Tag | tag signal |
| Explicit `Decision:` heading | decision marker |
| Explicit `Question:` heading | question marker |
| Ordered list | list structure |

Ingest should not infer implicit claims, rationale, contradictions, or supersession.

Those belong to `understand` and `connect`.

## Output Artifacts

The agent writes:

- `source-record.json`;
- `source-version.json`;
- `source-manifest.json`;
- `access-units/*.json`;
- `preview-artifacts/*.json` when available;
- `ingest-artifact.json`;
- `validation-report.json`;
- `traces/tool-calls.jsonl`;
- optional `index-projections/*.json`.

### Ingest Artifact

Required fields:

- `artifact_id`;
- `artifact_type`;
- `schema_version`;
- `task_id`;
- `run_id`;
- `repository_id`;
- `source_id`;
- `source_version_id`;
- `source_manifest_ref`;
- `access_unit_refs`;
- `preview_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `parser_policy_ref`;
- `source_content_hash`;
- `media_type`;
- `media_hint`;
- `shallow_candidate_refs`;
- `validation_report_ref`;
- `status`;
- `created_at`.

## Validation

The agent must fail or emit validation warnings when:

- source cannot be read;
- media type cannot be detected;
- hash computation fails;
- source version cannot be created or resolved;
- parser output is invalid;
- access unit IDs are unstable or missing;
- taxonomy bundle is missing;
- taxonomy assignment is invalid;
- artifact schema validation fails;
- index projection would violate content-minimal policy.

Failure classes:

- `source_read_failed`;
- `media_detection_failed`;
- `hash_failed`;
- `source_version_failed`;
- `parser_failed`;
- `manifest_schema_invalid`;
- `access_unit_schema_invalid`;
- `taxonomy_validation_failed`;
- `index_projection_invalid`;
- `permission_required`.

## Trace Events

Every tool call should produce a trace event.

Stage-level events:

- `ingest.started`;
- `ingest.source_read`;
- `ingest.source_version_resolved`;
- `ingest.parsed`;
- `ingest.access_units_created`;
- `ingest.taxonomy_validated`;
- `ingest.artifacts_written`;
- `ingest.validation_failed`;
- `ingest.completed`.

## Handoff To Understand

The agent hands off:

- ingest artifact ref;
- source id;
- source version id;
- source manifest ref;
- access unit refs;
- preview refs;
- taxonomy bundle id and version;
- parser policy ref;
- validation status;
- trace refs.

Understand may read these refs to create semantic knowledge candidates.

## V1 Acceptance Criteria

The Ingestion Agent v1 is acceptable when:

- it can ingest Markdown/text files;
- it computes stable source hashes;
- it creates source version metadata;
- it creates source manifests and heading-aware access units;
- it writes an ingest artifact;
- it records taxonomy bundle refs;
- it emits shallow markers only, not semantic knowledge;
- it writes a validation report and trace events;
- it can hand off to the Understanding Agent.

## Design Rule

The Ingestion Agent preserves and structures evidence.

It is not a semantic memory writer.
