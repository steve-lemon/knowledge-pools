# Architecture Risk Review

This document lists important gaps and improvement areas in the current Knowledge Pools architecture.

The goal is not to expand the system for its own sake. The goal is to identify the parts that will become expensive if ignored too long.

## Summary

The current baseline is strong in these areas:

- source preservation;
- taxonomy-governed ingest;
- media-specific access units;
- OpenSearch as the v1 indexing boundary;
- LLM-independent agent/session design;
- taxonomy vs versioning separation.

The main missing concerns are:

- security and access control;
- deletion, retention, and compliance;
- duplicate detection and canonicalization;
- ingestion failure handling and idempotency;
- OpenSearch mapping evolution;
- source update diffing;
- quality evaluation and regression sets;
- provenance depth;
- multi-tenant or project boundary;
- operational observability.

## 1. Security and Access Control

Current gap:

The architecture says where sources and indexes live, but not who can read which source or derived index document.

Why it matters:

Indexed projections can leak sensitive source content even if the original object store is protected.

Needed:

- access policy on `SourceRecord`;
- inherited access policy on `AccessUnit`;
- inherited access policy on OpenSearch documents;
- redaction support for sensitive fields;
- audit log for source reads;
- clear rule for whether summaries may contain restricted content.

Recommendation:

Add access control metadata to every source and indexed document:

- `tenant_id`
- `project_id`
- `visibility`
- `acl_refs`
- `sensitivity`
- `redaction_status`

## 2. Retention and Deletion

Current gap:

The system preserves sources and versions, but it does not define deletion, retention, or tombstone behavior.

Why it matters:

If a source is deleted or must be removed, OpenSearch projections, derived summaries, access units, and graph candidates also need to be handled.

Needed:

- source tombstone record;
- delete propagation workflow;
- retention policy;
- legal hold or preserve flag;
- index purge vs soft delete policy;
- derived artifact cleanup.

Recommendation:

Do not hard-delete first. Use tombstones and purge workflows.

## 3. Duplicate Detection and Canonicalization

Current gap:

Content hashing exists, but deduplication strategy is not defined.

Why it matters:

The same source may appear through multiple paths, formats, exports, or updated copies.

Needed:

- exact duplicate detection by content hash;
- near-duplicate detection later;
- canonical source selection;
- alias records for duplicate source URIs;
- duplicate relation such as `same_as` or `duplicate_of`.

Recommendation:

Start with exact hash deduplication. Defer near-duplicate detection.

## 4. Ingest Idempotency and Retry

Current gap:

The ingest flow does not yet define idempotency keys, retry behavior, or partial failure recovery.

Why it matters:

Ingest will involve object writes, parsing, taxonomy analysis, and OpenSearch indexing. Any step can fail.

Needed:

- ingest job ID;
- idempotency key;
- per-stage status;
- retry-safe writes;
- dead-letter queue or failed job registry;
- partial artifact cleanup or resume behavior.

Recommendation:

Make ingest resumable by stage:

```text
stored -> manifested -> parsed -> analyzed -> indexed -> verified
```

## 5. OpenSearch Mapping Evolution

Current gap:

OpenSearch is selected, but mapping versioning and reindex strategy are not detailed.

Why it matters:

Taxonomy and access-unit shapes will evolve. OpenSearch mappings are not infinitely flexible without cost.

Needed:

- index naming convention;
- mapping version;
- alias-based cutover;
- reindex plan;
- compatibility window;
- query regression checks before alias switch.

Recommendation:

Use versioned indexes plus aliases:

```text
kp-sources-v001
kp-access-units-v001
kp-graph-candidates-v001

aliases:
kp-sources-current
kp-access-units-current
kp-graph-candidates-current
```

## 6. Source Update Diffing

Current gap:

The architecture tracks source versions but does not define how to compare versions.

Why it matters:

For long documents, full reprocessing on every change is wasteful and makes provenance harder to inspect.

Needed:

- source version diff;
- access-unit stability policy;
- unchanged access-unit reuse;
- changed unit reindexing;
- superseded evidence refs.

Recommendation:

Start with full reingest on content hash change. Add access-unit diffing after the first MVP.

## 7. Provenance Depth

Current gap:

Source links exist, but derived outputs need more complete provenance chains.

Why it matters:

An answer may rely on a summary that relies on an access unit that came from OCR on a PDF page. That chain must be inspectable.

Needed:

- `derived_from` chain for every derived artifact;
- parser version;
- model adapter version if LLM-assisted;
- prompt or instruction version where applicable;
- confidence and validation status;
- exact source locator.

Recommendation:

Every derived artifact should include:

- `input_refs`
- `source_refs`
- `access_unit_refs`
- `processor`
- `processor_version`
- `created_at`

## 8. Evaluation and Regression Sets

Current gap:

Evaluation exists conceptually, but no concrete evaluation data shape is defined.

Why it matters:

Taxonomy, parser, and index changes can silently degrade retrieval quality.

Needed:

- golden queries;
- expected source refs;
- expected access units;
- retrieval quality metrics;
- answer grounding checks;
- before/after comparison for reindexing.

Recommendation:

Create small regression sets early, even before full LLM answering.

## 9. Multi-Project and Multi-Tenant Boundaries

Current gap:

The architecture mentions projects but does not define namespace boundaries.

Why it matters:

Taxonomy, source access, memory, and indexes may differ by project or tenant.

Needed:

- `tenant_id`;
- `project_id`;
- taxonomy bundle scope;
- index routing or filtered aliases;
- per-project retention and access policies.

Recommendation:

Even if v1 is single-user, include optional `tenant_id` and `project_id` fields now.

## 10. Observability

Current gap:

Run traces are mentioned, but operational observability is not specified.

Why it matters:

Ingest quality problems will often appear as parser failures, indexing drift, or missing source links.

Needed:

- structured logs;
- ingest metrics;
- parser error reports;
- indexing failure counts;
- source fetch audit;
- taxonomy proposal counts;
- OpenSearch query diagnostics.

Recommendation:

Define trace events for ingest stages before implementing advanced agents.

## 11. Binary and Derived Object Management

Current gap:

Image renditions and parsed source units are mentioned, but storage rules are not complete.

Needed:

- derived object naming convention;
- checksum for every derived object;
- relation between original and derived objects;
- cleanup policy when source is deleted or superseded.

Recommendation:

Store derived objects under the source ID and version:

```text
sources/{source_id}/versions/{source_version}/original
sources/{source_id}/versions/{source_version}/derived/{rendition_id}
```

## Priority Improvements

Before implementation, define these:

1. Source manifest and access unit schema.
2. OpenSearch document shapes and index aliases.
3. Ingest job state machine with idempotency.
4. Source link/provenance contract.
5. Access control metadata fields.
6. Source update and deletion policy.
7. Small retrieval regression set format.

## Design Rule

The architecture should stay simple, but not vague.

Use object storage and OpenSearch as the v1 infrastructure, while explicitly defining provenance, versioning, access control, and reindex behavior before large-scale ingest.

