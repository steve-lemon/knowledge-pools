# Verify Baseline

This document defines the v1 baseline for the `verify` stage.

`verify` audits whether answers, claims, actions, or relationship proposals are grounded, fresh, and conflict-aware.

It does not write durable memory.

It does not curate graph edges.

## Primary Purpose

The primary purpose of `verify` is to make unsupported, stale, contradictory, or under-evidenced outputs visible before they become trusted.

For the current stage transition, verification starts with `RelationshipProposal` artifacts emitted by `connect`.

Later, the same Verifier Agent can also audit `DraftAnswer` or `ProposedAction` artifacts emitted by `reason`.

The key shift is:

```text
proposal or answer -> evidence-grounded verification result
```

## Verification Modes

V1 should distinguish two verification modes:

| Mode | Input | Output |
| --- | --- | --- |
| `verify_relationships` | `ConnectionArtifact` and `RelationshipProposal[]` | relationship verification report |
| `verify_answer` | `DraftAnswer` or `ProposedAction` plus evidence bundle | answer verification report |

This baseline focuses first on `verify_relationships` because it follows `connect`.

## Expected Results

Verify should produce:

- `VerificationReport`;
- verified proposal refs;
- rejected proposal refs;
- uncertain proposal refs;
- stale evidence warnings;
- unsupported relationship warnings;
- contradiction warnings;
- missing evidence notes;
- review requests for risky verification outcomes.

The expected output is not durable memory.

The expected output is an audit report that later curation can use.

## Expected Effects

Verify improves the system in these ways:

| Effect | Why it matters |
| --- | --- |
| Better trust boundary | Proposals are checked before graph insertion |
| Conflict visibility | Contradictions and unresolved evidence become explicit |
| Safer curation | Curation receives audit outcomes, not raw proposals only |
| Better retrieval quality | Future retrieval can prefer verified relationships |
| Better debugging | Failed proposals show which evidence or endpoint was missing |
| Model independence | Deterministic checks and model-assisted checks share one report schema |

## Stage Boundary

```text
connect = relate candidates to existing records and graph context
verify = check whether proposed relationships and claims are supported
curation = decide what becomes durable memory or graph state
```

The detailed boundary is defined in [Connect and Verify Boundary](connect-verify-boundary.md).

The concrete handoff is defined in [Connect to Verify Handoff](connect-verify-handoff.md).

## Core Rule

Verification output is audit output.

The stage may say:

- "this relationship proposal is supported by cited evidence";
- "this relationship proposal is unsupported";
- "this proposal has unresolved endpoints";
- "this proposal needs human review";
- "this evidence appears stale."

It must not say:

- "this graph edge is now accepted";
- "this candidate is now durable knowledge";
- "this memory update has been applied";
- "this source should be deleted."

## Inputs

Required inputs for relationship verification:

- `connection_artifact_ref`;
- `relationship_proposal_refs`;
- `quality_report_ref`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- proposal endpoint refs;
- proposal evidence refs.

Optional inputs:

- ambiguity refs;
- review refs;
- conflict candidate refs;
- unresolved candidate refs;
- source access for direct evidence reads;
- graph neighborhood refs;
- verification policy ref.

## Outputs

The primary output is a `VerificationReport`.

Recommended shape:

```json
{
  "report_id": "vr_2026_06_19_001",
  "report_type": "verification_report",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "mode": "verify_relationships",
  "connection_artifact_ref": "artifact://runs/run_001/connect/connection-artifact.json",
  "checked_ref_count": 3,
  "verified_refs": [
    "artifact://runs/run_001/connect/relations/rp_supports_001.json"
  ],
  "rejected_refs": [],
  "unsupported_refs": [],
  "uncertain_refs": [],
  "missing_evidence_refs": [],
  "stale_evidence_refs": [],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/verify/quality-report.json",
  "created_at": "2026-06-19T00:00:00Z"
}
```

## Verification Result

Recommended shape:

```json
{
  "verification_result_id": "vrr_rp_supports_001",
  "target_ref": "artifact://runs/run_001/connect/relations/rp_supports_001.json",
  "target_type": "relationship_proposal",
  "status": "verified",
  "checks": [
    {
      "check_id": "evidence_resolves",
      "status": "passed"
    },
    {
      "check_id": "relation_supported_by_evidence",
      "status": "passed"
    }
  ],
  "evidence_refs": [
    "src_path_a91c72#section_003"
  ],
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "confidence": 0.81,
  "requires_review": false
}
```

Verification result text and detailed rationale should live behind refs when long.

## Verification Status Values

Recommended v1 statuses:

| Status | Meaning |
| --- | --- |
| `verified` | Evidence and endpoint checks passed |
| `rejected` | Evidence contradicts or fails the proposal |
| `unsupported` | Required evidence is missing or insufficient |
| `uncertain` | Evidence is ambiguous or low quality |
| `stale` | Evidence exists but is outdated or superseded |
| `needs_review` | Human or system review is required |

## V1 Workflow

The first implementation should be deterministic-first and local-file friendly.

Recommended workflow:

```text
load connect-to-verify handoff
  -> validate proposal refs
  -> load connection artifact
  -> load relationship proposals
  -> resolve endpoint refs
  -> resolve evidence refs
  -> validate relation type against taxonomy
  -> run deterministic evidence checks
  -> emit verification results
  -> emit review requests when needed
  -> validate output schemas
  -> write verification report
  -> emit trace
```

V1 can start by checking evidence refs, endpoint refs, and taxonomy relation validity.

Model-assisted verification can be added later, but it must never override missing evidence.

## Tool Access

Required ports:

- `artifact.read`;
- `schema.validate`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `verification.check`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `record.search`;
- `graph.query`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `review.request`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `source.restore`;
- `index.deactivate_projection`;
- `rollback.create_event`;
- `delete.create_tombstone`.

## Validation Rules

A verification report is valid only if:

- every checked target ref resolves;
- every verification result has a target ref;
- every result has a status;
- every evidence ref resolves or is listed as missing;
- every relation type is checked against taxonomy;
- stale or superseded evidence is marked;
- review-required results are marked;
- no durable graph or memory record is written.

Recommended failure classes:

- `invalid_handoff`;
- `missing_connection_artifact`;
- `unresolved_proposal_ref`;
- `unresolved_endpoint_ref`;
- `missing_evidence_ref`;
- `taxonomy_validation_failed`;
- `verification_schema_invalid`;
- `permission_required`.

## Quality Bar

Verify quality should be measured before moving to curation.

Minimum checks:

- checked target count;
- verified count;
- rejected count;
- unsupported count;
- uncertain count;
- stale evidence count;
- missing evidence count;
- review-required count;
- schema failure count.

V1 should prefer explicit uncertainty over false confidence.

## Handoff to Curation or Update

Curation receives:

- verification report ref;
- verified proposal refs;
- rejected proposal refs;
- unsupported proposal refs;
- uncertain proposal refs;
- review refs;
- quality report ref;
- taxonomy refs;
- trace refs.

Curation is responsible for deciding whether verified proposals become durable graph records or memory updates.

## Minimal V1 Rule

For v1:

- consume `ConnectToVerifyHandoff`;
- support relationship proposal verification first;
- verify endpoint refs and evidence refs;
- validate relation type against taxonomy;
- emit verification report and result artifacts;
- keep verified results as audit outcomes, not durable graph writes;
- defer answer verification until retrieval and reasoning stages are designed.

## Design Rule

Verify does not decide memory.

Verify audits whether a proposal or answer deserves trust.
