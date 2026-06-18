# Rollback and Quarantine Policy

This document defines how Knowledge Pools handles incorrectly injected data.

## Core Rule

Rollback must be possible, but it should be implemented as traceable state changes, not silent deletion.

Wrong data can enter through:

- bad source import;
- wrong parser output;
- incorrect taxonomy classification;
- unsafe update candidate;
- accepted but later disproven knowledge record;
- bad index projection;
- model-generated summary, transcript, or preview error.

The system should preserve enough provenance to answer:

1. What was injected?
2. Which source, run, parser, taxonomy, or curation decision created it?
3. Which indexed documents and durable records were affected?
4. What was deactivated, corrected, or restored?
5. Which answers may have used the bad data?

## Rollback Is Layered

Rollback is not one operation. It depends on the layer that was contaminated.

| Layer | Wrong data example | Preferred rollback |
| --- | --- | --- |
| Source version | wrong file uploaded as current source | move `current_source_version_id` back to the previous valid version |
| Manifest/access units | parser split pages incorrectly | mark generated artifacts invalid and regenerate with a new parser policy |
| Preview artifact | bad thumbnail, transcript, summary, or waveform | mark preview invalid and regenerate derived object |
| Index projection | OpenSearch contains stale or wrong projection | remove from active alias or set projection inactive, then reindex |
| Update candidate | feedback-derived proposal is wrong | mark candidate `rejected` or `quarantined` |
| Durable knowledge record | accepted claim is later disproven | create corrective record and mark old record `superseded`, `retracted`, or `quarantined` |
| Relation | wrong graph edge connects unrelated records | deactivate relation and record the correction reason |

## Quarantine Before Deletion

Use quarantine when wrong data may have been observed, indexed, or used as evidence.

Recommended statuses:

```text
active -> quarantined -> corrected
                  -> rejected
                  -> retracted
                  -> purged
```

Meaning:

- `active`: usable in current retrieval;
- `quarantined`: excluded from normal retrieval, retained for audit;
- `corrected`: replaced by a validated record or projection;
- `rejected`: candidate never became accepted knowledge;
- `retracted`: accepted knowledge is no longer valid;
- `purged`: physically removed by retention or compliance policy.

Quarantined records should remain addressable for audit and impact analysis.

## Source Version Rollback

If a wrong source version was promoted as current:

1. Mark the bad version `quarantined`.
2. Move `current_source_version_id` back to the latest known valid source version.
3. Exclude bad version projections from current-state retrieval.
4. Keep bad version objects until impact analysis and retention policy allow purge.
5. Record a rollback event with the reason and operator.

Example:

```json
{
  "source_id": "src_path_a91c72",
  "current_source_version_id": "srcv_md_sha256_1111aaaabbbb",
  "versions": [
    {
      "source_version_id": "srcv_md_sha256_1111aaaabbbb",
      "version_status": "current"
    },
    {
      "source_version_id": "srcv_md_sha256_2222bbbbcccc",
      "version_status": "quarantined",
      "quarantine_reason": "Wrong file uploaded during ingest run run_2026_06_19_003."
    }
  ]
}
```

If the source reverts to bytes already seen before, reuse the existing immutable `source_version_id`.

Do not create a new source version only to represent rollback metadata.

## Index Rollback

OpenSearch should be treated as a projection, not the source of truth.

Rollback options:

1. Soft deactivate bad projections with status fields.
2. Move active query aliases to a previous valid index generation.
3. Rebuild projections from valid source versions and durable records.

For v1, prefer soft deactivation plus reindexing:

```text
projection_status = quarantined
is_current = false
rollback_event_id = rb_2026_06_19_001
```

Current-state retrieval must filter out:

```text
version_status in [quarantined, retracted, deleted]
projection_status != active
```

Historical or audit retrieval may include quarantined records only when explicitly requested.

## Knowledge Record Rollback

Accepted knowledge should not be edited in place.

If an accepted claim or decision is wrong:

```text
corrective_record --retracts--> bad_record
bad_record --status--> retracted
corrective_record --derived_from--> rollback_event
```

If the older knowledge was valid at the time but is no longer current:

```text
new_record --supersedes--> old_record
old_record --status--> superseded
```

Use `retracted` when the prior record was wrong.

Use `superseded` when the prior record was valid but replaced.

Use `quarantined` when the system has not yet decided.

## Update Candidate Rollback

Update candidates are easier to roll back because they are not durable knowledge.

Rules:

- wrong proposed candidates become `rejected`;
- suspicious candidates become `quarantined`;
- accepted candidates require knowledge-record rollback if they already created durable records;
- every candidate should keep `created_by_run_id` and `curation_decision_ref`.

## Rollback Event

Every rollback should create a durable rollback event.

Recommended shape:

```json
{
  "rollback_event_id": "rb_2026_06_19_001",
  "status": "completed",
  "reason": "Wrong source version was promoted as current.",
  "detected_by": "user_correction",
  "affected_refs": [
    "srcv_md_sha256_2222bbbbcccc",
    "idx_access_unit_md_sha256_2222bbbbcccc_001",
    "claim_042"
  ],
  "actions": [
    {
      "action": "quarantine_source_version",
      "target_ref": "srcv_md_sha256_2222bbbbcccc"
    },
    {
      "action": "restore_current_pointer",
      "target_ref": "src_path_a91c72",
      "restored_ref": "srcv_md_sha256_1111aaaabbbb"
    }
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

Rollback events are part of operational memory. They should be searchable by source, run, candidate, and affected record.

## Impact Analysis

Before completing rollback, the system should identify:

- index projections created from the bad input;
- update candidates derived from the bad input;
- durable records that cite bad evidence;
- relations created from bad candidates;
- recent answers or runs that used affected refs.

This does not block emergency quarantine.

Emergency quarantine should happen first. Full impact analysis can follow.

## Minimal V1 Rule

For v1:

- keep source versions immutable;
- promote current versions only after validation;
- support `quarantined`, `retracted`, and `superseded` statuses;
- make normal retrieval exclude quarantined and retracted records;
- create a rollback event for every rollback;
- rebuild OpenSearch projections from durable state when in doubt.

## Design Rule

Rollback is not forgetting.

Rollback is restoring the active truth path while preserving an audit trail of what went wrong.
