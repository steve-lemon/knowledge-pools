# Content Deletion Lifecycle

This document defines how Knowledge Pools handles content removal requests.

Deletion does not have to mean immediate physical deletion.

In v1, deletion should mean removing content from normal discovery, retrieval, reasoning, and answer generation while preserving enough metadata for audit and dependency cleanup.

## Core Rule

Prefer soft delete with tombstones before physical purge.

```text
active -> hidden -> tombstoned -> purged
       -> archived
       -> legal_hold
```

Meaning:

- `active`: available for normal retrieval and reasoning;
- `hidden`: not shown in normal retrieval, but can be restored easily;
- `tombstoned`: logically deleted and replaced by a deletion marker;
- `archived`: retained for history, excluded from current-state retrieval;
- `legal_hold`: retained and protected from purge;
- `purged`: physically removed from storage and indexes where policy allows.

## Delete Is Different From Rollback

Rollback handles wrong or contaminated data.

Deletion handles intentional removal, lifecycle expiry, access withdrawal, user request, or policy-driven cleanup.

| Case | Preferred state |
| --- | --- |
| User wants to hide a document temporarily | `hidden` |
| User removes content from the active knowledge pool | `tombstoned` |
| Content is old but historically useful | `archived` |
| Content must be retained for audit or compliance | `legal_hold` |
| Content must be physically removed | `purged` |
| Content was wrong or unsafe | `quarantined` or `retracted` |

## Tombstone Record

A tombstone is a durable marker that says a source, version, access unit, preview, candidate, record, or relation should no longer be used as active knowledge.

Recommended shape:

```json
{
  "tombstone_id": "ts_2026_06_19_001",
  "target_ref": "src_path_a91c72",
  "target_kind": "source",
  "delete_mode": "soft",
  "delete_reason": "user_request",
  "deleted_by": "user",
  "deleted_at": "2026-06-19T00:00:00Z",
  "restore_allowed": true,
  "purge_after": null,
  "legal_hold": false,
  "affected_refs": [
    "srcv_md_sha256_1111aaaabbbb",
    "idx_access_unit_md_sha256_1111aaaabbbb_001"
  ]
}
```

Tombstones should be indexed as metadata, but they should not contain full source content.

## Deletion Levels

Use explicit deletion modes.

| Mode | Meaning | Reversible |
| --- | --- | --- |
| `hide` | remove from normal UI/search, keep all data active internally | yes |
| `soft_delete` | mark inactive and create tombstone | yes |
| `archive` | remove from current retrieval but keep for history | yes |
| `purge_projection` | remove index projections, keep source objects | yes by reindexing |
| `purge_derived` | remove previews, summaries, transcripts, extracted artifacts | partially |
| `purge_source` | remove original source bytes where allowed | no |

V1 should implement `hide`, `soft_delete`, `archive`, and `purge_projection` first.

Physical source purge can wait until retention and compliance rules are explicit.

## Delete Propagation

Deleting a source should propagate to derived artifacts and projections.

```text
source
  -> source versions
  -> manifests
  -> access units
  -> preview artifacts
  -> index projections
  -> candidates
  -> durable records and relations that cite the source
```

Propagation does not always mean deleting every dependent record.

Rules:

- index projections become inactive;
- previews and derived artifacts become hidden or tombstoned;
- candidates derived only from deleted content become tombstoned;
- durable records that cite deleted evidence should be marked `evidence_unavailable` or require review;
- relations derived only from deleted evidence should be deactivated or flagged;
- answers should not use deleted content as current evidence.

## Retrieval Behavior

Normal retrieval must exclude deleted content.

Default filter:

```text
is_current = true
projection_status = active
version_status not in [hidden, tombstoned, archived, quarantined, retracted, deleted, purged]
```

Audit retrieval may include tombstoned or archived content only when explicitly requested and authorized.

If a durable knowledge record still exists but its evidence was deleted, verification should warn that evidence is unavailable.

## Restore

Soft-deleted content can be restored by creating a restore event.

Restore should:

1. validate the target still exists;
2. remove or close the tombstone;
3. reactivate eligible projections;
4. reindex if projections were purged;
5. record who restored the content and why.

Restore must not silently revive content under legal hold, purge restriction, or policy conflict.

## Physical Purge

Physical purge is optional and policy-driven.

Before purging, check:

- legal hold;
- retention policy;
- evidence dependencies;
- active decisions or claims citing the content;
- backup and object-store version behavior;
- audit requirements.

Purge may remove:

- source bytes;
- manifests;
- access units;
- derived previews;
- summaries;
- transcripts;
- OCR output;
- OpenSearch projections.

Even after purge, a minimal tombstone should remain unless policy requires complete erasure.

## Minimal V1 Rule

For v1:

- deletion creates a tombstone;
- normal retrieval excludes hidden, tombstoned, archived, quarantined, retracted, deleted, and purged content;
- OpenSearch projections are deactivated, not trusted as the source of truth;
- source bytes are retained unless a future purge policy says otherwise;
- restore is allowed only for `hidden`, `soft_delete`, and `archive` modes;
- physical purge is manual and must create an audit event.

## Design Rule

Deletion is a visibility and lifecycle decision first.

Physical erasure is a later policy decision.
