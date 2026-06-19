# Understand and Connect Boundary

This document defines the stage boundary between `understand` and `connect`.

The goal is to keep source interpretation separate from relationship proposal.

## Boundary Review: understand -> connect

Previous stage owns:

- converting source access units into knowledge candidates;
- preserving source, version, taxonomy, and evidence refs;
- recording ambiguity and review needs;
- producing an `UnderstandingArtifact`;
- producing an `UnderstandToConnectHandoff`.

Next stage owns:

- relating candidates to other candidates, existing records, sources, and graph context;
- proposing duplicate, support, contradiction, dependency, supersession, mention, and applicability relationships;
- preserving evidence refs and uncertainty for every relation proposal;
- producing a `ConnectionArtifact`;
- producing a handoff to verification or curation.

Previous stage must not:

- decide global duplicate relationships;
- accept graph edges;
- mark a candidate as durable truth;
- decide contradiction or supersession against existing records;
- write durable memory.

Next stage must not:

- reinterpret source units without evidence refs;
- create new source understanding candidates from raw source content;
- accept relationships as durable graph records;
- verify that a claim is true;
- curate durable memory;
- mutate source lifecycle state.

Handoff artifact:

- `UnderstandToConnectHandoff`.

Required handoff fields:

- `understanding_artifact_ref`;
- `knowledge_candidate_refs`;
- `ambiguity_refs`;
- `review_refs`;
- `quality_report_ref`;
- `source_id`;
- `source_version_id`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `trace_refs`.

Candidate vs durable record status:

- knowledge candidates remain candidates;
- relation proposals remain candidates;
- graph records are not created by `connect`;
- durable acceptance belongs to verification and curation.

Validation needed before moving on:

- handoff schema validates;
- understanding artifact resolves;
- candidate refs resolve;
- candidate evidence refs resolve;
- taxonomy refs resolve;
- quality report exists;
- relation proposal schema validates;
- no relation is marked durable or accepted.

## Design Rule

Understand says what meaning may be present.

Connect says how that candidate may relate to other knowledge.

Neither stage decides durable truth.
