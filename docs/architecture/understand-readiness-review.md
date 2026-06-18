# Understand Readiness Review

This document is the final architecture checklist before implementing the `understand` stage.

The goal is not to expand scope. The goal is to prevent the first implementation from accidentally becoming retrieval, connection, verification, or durable memory.

## Current Assessment

The `understand` baseline is ready for a v1 implementation if the first version stays conservative:

- start with Markdown/text structural understanding;
- use deterministic extractors before model-assisted extraction;
- require evidence refs for every candidate;
- keep every output as candidate-level;
- hand off to `connect` through typed artifacts;
- do not write durable memory or graph relationships.

The architecture is strong enough to proceed, but several guardrails must be explicit in implementation.

## Scope Boundary

Understand owns:

- validating the ingest-to-understand handoff;
- resolving source access units;
- reading exact source units;
- extracting candidate meaning units;
- attaching evidence refs;
- recording uncertainty;
- emitting review requests;
- writing understanding artifacts;
- producing a handoff to `connect`.

Understand does not own:

- user-question interpretation;
- retrieval planning;
- relationship acceptance;
- contradiction decisions;
- supersession decisions;
- durable memory writes;
- source lifecycle changes;
- rollback or deletion.

## Must-Have Implementation Checks

### 1. Handoff Integrity

Before extraction, the agent must check:

- handoff schema is valid;
- `source_id` and `source_version_id` match the source manifest;
- `source_content_hash` matches source version metadata;
- every access-unit ref resolves;
- taxonomy bundle and version resolve;
- parser policy ref is present;
- validation status is `passed` or `passed_with_warnings`.

If these checks fail, the agent should emit a failed artifact or trace event and stop.

### 2. Evidence Coverage

Every candidate must have evidence refs.

The evidence refs must resolve to the same source version used in the handoff.

Candidates derived only from preview, summary, OCR, transcript, or model output must mark the derived artifact and original source locator.

### 3. Candidate-Level Only

All outputs remain candidates.

The stage may emit:

- `KnowledgeCandidate`;
- `AmbiguityNote`;
- `ReviewRequest`;
- `QualityReport`;
- `UnderstandingArtifact`.

It must not emit durable `KnowledgeRecord` objects.

### 4. Duplicate and Near-Duplicate Control

Understand should reduce obvious duplicates within the same access unit.

It should not decide global duplicate relationships.

Recommended rule:

- local duplicate collapse is allowed when two candidates have the same kind, same normalized label, and same evidence refs;
- cross-source duplicate detection belongs to `connect`;
- possible duplicate hints may be handed off as relation hints, not accepted relations.

### 5. Taxonomy Alignment

Understand may classify candidates using the active taxonomy.

It must not silently evolve the taxonomy.

When a source does not fit the taxonomy, emit:

- ambiguity note;
- review request;
- optional taxonomy proposal candidate if that tool is explicitly enabled later.

### 6. Generated Text Policy

Generated statements, summaries, rationales, and explanations should be bounded.

Long generated text should live behind artifact refs, not in OpenSearch projections.

Generated text must record:

- generator kind;
- generator name;
- version or config hash;
- input artifact refs;
- evidence refs.

### 7. Sensitive Data Handling

Understand may encounter personal, secret, regulated, or confidential content.

V1 should at least preserve flags from ingest if present.

Recommended fields:

- `sensitivity_flags`;
- `redaction_status`;
- `review_required_reason`;
- `allowed_audience_ref`.

If sensitivity is unknown but suspected, emit a review request instead of broadening visibility.

### 8. Idempotency and Reprocessing

Re-running understand with the same handoff, taxonomy version, parser policy, and extraction policy should produce stable candidate IDs when possible.

Candidate ID inputs should include:

- candidate kind;
- source version id;
- access-unit scope;
- extraction policy ref;
- normalized label or statement hash;
- ordinal only as a last resort.

If source bytes, parser policy, taxonomy version, or extraction policy changes, produce a new `UnderstandingArtifact`.

### 9. Model-Assisted Extraction

Model output is never trusted directly.

When model use is enabled:

- input must be bounded by access-unit refs;
- output must match schema;
- every candidate must preserve evidence refs;
- unsupported model claims must be rejected or converted to ambiguity;
- model metadata must be recorded.

The deterministic path must remain usable without a model adapter.

### 10. Quality Gate Before Connect

The Understanding Agent should hand off to `connect` only when:

- artifact schema validation passed;
- candidate schema validation passed;
- evidence coverage is 100% for emitted candidates;
- unresolved evidence ref count is zero;
- review-required candidates are marked;
- failed extractors are recorded;
- quality report exists.

If the quality report fails the minimum bar, the handoff can be blocked or marked `completed_with_warnings`.

## Understand to Connect Handoff

The next handoff should use the common `HandoffEnvelope` with an `UnderstandToConnectPayload`.

Minimum payload:

```json
{
  "understanding_artifact_ref": "artifact://runs/run_001/understand/understanding-artifact.json",
  "knowledge_candidate_refs": [
    "artifact://runs/run_001/understand/candidates/kc_claim_001.json"
  ],
  "ambiguity_refs": [],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/understand/quality-report.json",
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

`connect` may use this to propose graph relationships.

It must not assume that every candidate is already true, unique, or durable.

## Deferred Items

These should not block v1:

- full PDF table reasoning;
- visual-only image/video interpretation;
- speaker identity resolution;
- cross-source contradiction analysis;
- automatic taxonomy evolution;
- automatic durable memory write;
- privacy policy engine.

They should remain visible as future stages or later enhancements.

## V1 Go Criteria

Proceed to implementation when the following are true:

- `IngestToUnderstandHandoff` schema is available;
- `UnderstandingArtifact` and `KnowledgeCandidate` schemas are available;
- Markdown/text access-unit reader is available;
- structural extractors are defined;
- quality report shape is defined;
- failed runs can be traced;
- output can be validated before handoff.

## Design Rule

Understand should be conservative, replayable, and evidence-first.

Its job is to make candidate knowledge inspectable, not to decide truth.
