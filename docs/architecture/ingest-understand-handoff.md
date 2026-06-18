# Ingest to Understand Handoff

This document defines the concrete handoff contract between the Ingestion Agent and the Understanding Agent.

## Core Rule

The Understanding Agent should not guess how to fetch evidence.

Ingest must hand off enough refs for Understand to reproduce every source-unit fetch.

```text
Ingestion Agent
  -> IngestToUnderstandHandoff
  -> Understanding Agent
```

## Handoff Artifact

Recommended artifact name:

```text
IngestToUnderstandHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_ingest_understand_001",
  "handoff_type": "ingest_to_understand",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "source_manifest_ref": "artifact://runs/run_001/ingest/source-manifest.json",
  "ingest_artifact_ref": "artifact://runs/run_001/ingest/ingest-artifact.json",
  "access_unit_refs": [
    "src_path_a91c72#section_001"
  ],
  "preview_refs": [
    "outline_preview_v001"
  ],
  "shallow_candidate_refs": [
    "shallow_decision_marker_001"
  ],
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "parser_policy_ref": "parser_policy_markdown_v1",
  "source_content_hash": "sha256:...",
  "media_type": "text/markdown",
  "media_hint": "md",
  "validation_report_ref": "artifact://runs/run_001/ingest/validation-report.json",
  "validation_status": "passed",
  "trace_refs": [
    "trace_ingest_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs and metadata, not full source text.

## Required Fields

The handoff must include:

- `handoff_id`;
- `handoff_type`;
- `schema_version`;
- `run_id`;
- `source_id`;
- `source_version_id`;
- `source_manifest_ref`;
- `ingest_artifact_ref`;
- `access_unit_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `parser_policy_ref`;
- `source_content_hash`;
- `media_type`;
- `media_hint`;
- `validation_report_ref`;
- `validation_status`;
- `trace_refs`.

Optional but recommended:

- `preview_refs`;
- `shallow_candidate_refs`;
- `wiki_signal_refs`;
- `media_signal_refs`;
- `index_projection_refs`.

## Producer Responsibility

The Ingestion Agent must:

- create source records and source versions before handoff;
- write source manifest and access-unit artifacts;
- validate access-unit refs;
- include taxonomy bundle id and version;
- include parser policy ref;
- include validation report ref;
- mark validation status;
- avoid semantic knowledge extraction;
- emit trace refs.

The Ingestion Agent should not hand off if required refs are missing.

If ingest partially succeeds, it should hand off only when `validation_status` allows understand to continue.

## Consumer Responsibility

The Understanding Agent must:

- validate handoff schema;
- reject handoff if required refs are missing;
- load ingest artifact and source manifest by ref;
- resolve every access-unit ref before extraction;
- fetch exact source units through `source.locate` and `source.read`;
- preserve source id, source version id, taxonomy refs, and parser policy refs in every candidate;
- treat shallow candidates as hints, not semantic truth.

The Understanding Agent should fail explicitly with `invalid_handoff` or `unresolved_access_unit_ref` rather than silently skipping required evidence.

## Shallow Candidate Handling

Ingest may emit shallow candidates from visible structure.

Examples:

- decision marker from `# Decision`;
- question marker from `# Question`;
- wiki link relation marker;
- citation marker;
- OCR span marker;
- transcript span marker.

Understand may use these as extraction hints.

It must still produce its own `KnowledgeCandidate` artifacts with evidence refs.

## Validation Gate

Understand can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- source manifest ref resolves;
- access-unit refs resolve;
- taxonomy bundle ref resolves;
- source version id matches the manifest;
- source content hash matches the expected source version metadata;
- the handoff schema validates.

If `validation_status` is `failed`, Understand must not run except in an explicit debug mode.

## Version and Reprocessing Rules

If source bytes change:

- ingest creates or reuses a `source_version_id`;
- handoff points to the new source version;
- understand creates a new `UnderstandingArtifact`.

If parser policy changes but source bytes do not:

- source version remains stable;
- manifest and access units may change;
- handoff must include the new parser policy ref;
- understand creates a new `UnderstandingArtifact`.

If taxonomy changes:

- source version remains stable;
- handoff must include the taxonomy bundle id and version;
- understand may reclassify or re-emit candidates under the new taxonomy version.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- Markdown/text handoff must include heading-aware access units;
- understand must reject missing source manifest or access-unit refs;
- shallow candidates are hints only;
- every downstream knowledge candidate keeps handoff source/version/taxonomy refs.

## Design Rule

Ingest owns addressability.

Understand owns interpretation.

The handoff keeps those responsibilities connected without merging them.
