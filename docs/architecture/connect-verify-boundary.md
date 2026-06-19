# Connect and Verify Boundary

This document defines the stage boundary between `connect` and `verify`.

The goal is to keep relationship proposal separate from evidence audit.

## Boundary Review: connect -> verify

Previous stage owns:

- relating candidates to existing records, sources, candidates, and graph context;
- producing `RelationshipProposal` artifacts;
- preserving endpoint refs, evidence refs, taxonomy refs, ambiguity refs, and review refs;
- producing a `ConnectionArtifact`;
- producing a `ConnectToVerifyHandoff`.

Next stage owns:

- checking whether proposed relationships are supported by evidence;
- checking whether endpoints resolve;
- checking whether relation types are allowed by taxonomy;
- checking whether conflicts, freshness, and uncertainty are represented honestly;
- producing a `VerificationReport`;
- deciding whether proposals are verified, rejected, uncertain, stale, or need review.

Previous stage must not:

- accept relationship proposals as durable graph edges;
- decide that a contradiction is true;
- decide that a supersession is accepted;
- write durable graph records;
- write durable memory.

Next stage must not:

- create new relationship proposals as its primary output;
- mutate durable graph records;
- curate accepted memory;
- rewrite source evidence;
- silently repair invalid proposals;
- hide unsupported or stale relationships.

Handoff artifact:

- `ConnectToVerifyHandoff`.

Required handoff fields:

- `connection_artifact_ref`;
- `relationship_proposal_refs`;
- `conflict_candidate_refs`;
- `unresolved_candidate_refs`;
- `ambiguity_refs`;
- `review_refs`;
- `quality_report_ref`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `trace_refs`.

Candidate vs durable record status:

- relationship proposals remain proposals;
- verification results are audit outcomes;
- verified does not mean curated;
- durable graph records are created only after curation.

Validation needed before moving on:

- handoff schema validates;
- connection artifact resolves;
- relationship proposal refs resolve;
- proposal endpoint refs resolve or are marked unresolved;
- evidence refs resolve;
- taxonomy refs resolve;
- verification report schema validates.

## Design Rule

Connect proposes possible edges.

Verify audits whether those proposed edges are supported.

Neither stage writes durable graph memory.
