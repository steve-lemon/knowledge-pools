# Knowledge Update Agent Spec

The Knowledge Update Agent converts useful run outcomes into update candidates.

Stage baseline: [Update Baseline](../architecture/update-baseline.md).

Input handoff: [Verify to Update Handoff](../architecture/verify-update-handoff.md).

Output handoff: `UpdateToCurationHandoff`.

## Responsibilities

- consume `VerifyToUpdateHandoff`;
- inspect the referenced verification report and update signals;
- emit `UpdateCandidate` artifacts for reusable verified outcomes;
- convert unsupported or uncertain outcomes into review, open-question, or needs-more-evidence candidates;
- preserve verification, evidence, source, run, and taxonomy refs;
- emit a quality report and trace events.

## Non-Responsibilities

- do not re-verify claims;
- do not decide whether a candidate is accepted;
- do not write durable memory;
- do not mutate source lifecycle or index projections;
- do not store raw full source content or full transcripts as candidates.

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `review.request`;
- `curation.propose`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.tombstone`;
- `delete.create_tombstone`;
- `rollback.create_event`.

## Outputs

- update candidates;
- update quality report;
- review requests;
- curation proposals;
- `UpdateToCurationHandoff`;
- trace events.

## Validation Rules

- `VerifyToUpdateHandoff` must validate before work starts.
- The verification report ref must resolve.
- Unsupported refs must not produce fact-like candidates.
- Every candidate must include provenance through source, evidence, run, verification, or review refs.
- Every candidate must declare type, proposed record kind, status, and review requirement.
- Taxonomy-bound fields must validate against the referenced taxonomy version.

## Markdown-First V1

The first implementation should emit candidates only from verified Markdown/text evidence paths.

Media-derived update candidates are deferred until each media type has verified access-unit refs and media-specific verification rules.

## Design Rule

The Knowledge Update Agent proposes memory changes.

It does not accept or write durable memory.
