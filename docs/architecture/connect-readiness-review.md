# Connect Readiness Review

This document is the final architecture checklist before implementing the `connect` stage.

The goal is to keep the first implementation useful, local-friendly, and safe from accidental durable graph mutation.

## Current Assessment

The `connect` baseline is ready for a v1 implementation if the first version stays conservative:

- consume `UnderstandToConnectHandoff`;
- use deterministic matching before model-assisted relation proposal;
- use local records and fixtures before requiring a graph database;
- emit `RelationshipProposal` artifacts only;
- preserve evidence refs and endpoint refs;
- block durable graph and memory writes;
- hand off proposals to `verify`.

The architecture is strong enough to proceed, but tool permissions must be enforced carefully.

## Scope Boundary

Connect owns:

- validating the understand-to-connect handoff;
- resolving understanding artifact refs;
- resolving knowledge candidate refs;
- searching existing records or candidate fixtures;
- optionally querying graph neighborhoods when available;
- proposing duplicate, support, contradiction, dependency, supersession, mention, and applies-to relationships;
- attaching endpoint refs, evidence refs, rationale refs, ambiguity refs, and review refs;
- writing connection artifacts and quality reports;
- producing a handoff to `verify`.

Connect does not own:

- source interpretation;
- creating new knowledge candidates from raw source units;
- deciding relationship truth;
- accepting graph edges;
- writing durable graph records;
- writing durable memory;
- source lifecycle mutation;
- curation or rollback.

## Tool Access Review

### Required V1 Ports

The first implementation should require only ports that can be backed by local files or simple deterministic functions.

| Port | Purpose | Side effect level |
| --- | --- | --- |
| `artifact.read` | Read handoff, understanding artifact, candidates, and quality reports | `read_only` |
| `record.search` | Search local JSON records, candidate fixtures, and accepted record fixtures | `read_only` |
| `taxonomy.read` | Load active taxonomy bundle and relation rules | `read_only` |
| `taxonomy.validate` | Validate relation types and endpoint compatibility | `read_only` |
| `schema.validate` | Validate handoff, proposal, artifact, and quality report schemas | `read_only` |
| `candidate.emit` | Emit relationship proposal artifacts | `propose` |
| `artifact.write` | Write connection artifact, quality report, unresolved notes, and rationale artifacts | `derive` |
| `audit.trace` | Append tool-call and stage trace events | `derive` |

### Optional V1 Ports

| Port | Purpose | Side effect level |
| --- | --- | --- |
| `graph.query` | Query graph records or projected relation neighborhoods when available | `read_only` |
| `index.search` | Search OpenSearch or local projection fixtures for candidate/record lookup | `read_only` |
| `ambiguity.emit` | Emit ambiguity notes for uncertain relation proposals | `propose` |
| `review.request` | Emit human or system review requests | `propose` |
| `model.complete` | Produce model-assisted relationship proposals | `derive` |

### Forbidden Ports

The `connect` stage must not receive:

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

If any forbidden port is granted, the orchestrator should reject the task before execution.

## Required Tool Sequence

The v1 sequence should be:

```text
artifact.read handoff
  -> schema.validate handoff
  -> artifact.read understanding artifact
  -> artifact.read candidate refs
  -> taxonomy.read relation rules
  -> taxonomy.validate relation policy
  -> record.search existing records and candidates
  -> optional graph.query graph neighborhoods
  -> candidate.emit relationship proposals
  -> artifact.write connection artifact and quality report
  -> schema.validate outputs
  -> audit.trace every step
```

Model-assisted proposal, if enabled, must happen before `candidate.emit` and after bounded context has been prepared.

Model output must still pass schema, endpoint, relation type, and evidence validation.

## Must-Have Implementation Checks

### 1. Handoff Integrity

Before relation proposal, the agent must check:

- handoff schema is valid;
- `validation_status` is `passed` or `passed_with_warnings`;
- understanding artifact ref resolves;
- all required candidate refs resolve;
- quality report ref resolves;
- source id and source version id are preserved;
- taxonomy bundle id and version resolve.

### 2. Endpoint Integrity

Every relationship proposal must have:

- `from_ref`;
- `to_ref`;
- endpoint type or resolvability status;
- unresolved endpoint note when an endpoint cannot be resolved.

Unresolved endpoints may produce unresolved relation artifacts, but they must not be accepted as normal graph edges.

### 3. Evidence Preservation

Every proposal must keep:

- evidence refs from the source candidate;
- source id;
- source version id;
- taxonomy refs;
- rationale ref or explicit indirect-evidence rationale.

Preview artifacts, summaries, or similarity scores cannot be the only grounding.

### 4. Relation Type Validation

Every relation type must be allowed by the active taxonomy version.

If the taxonomy does not allow a relation type, emit validation failure, ambiguity, or review.

### 5. Proposal-Level Only

The stage may emit:

- `ConnectionArtifact`;
- `RelationshipProposal`;
- unresolved relation note;
- ambiguity note;
- review request;
- quality report.

It must not emit:

- `GraphRecord`;
- durable edge;
- accepted duplicate decision;
- accepted contradiction decision;
- memory write.

### 6. Deterministic Matching First

V1 matching should start with:

- normalized label equality;
- explicit wiki links or mentions;
- known aliases;
- compatible candidate kinds;
- shared source/access-unit refs;
- taxonomy relation rules.

Semantic similarity may create a low-confidence proposal, not an accepted edge.

### 7. Model-Assisted Mode

Model use is optional.

When enabled:

- input must be bounded to candidate refs and selected existing record snippets;
- output must match proposal schema;
- unsupported relations must become ambiguity or review;
- model metadata must be recorded;
- no provider-specific session state becomes durable architecture state.

### 8. Quality Gate Before Verify

The Connection Agent should hand off to `verify` only when:

- connection artifact schema validates;
- relationship proposal schemas validate;
- every proposal has endpoint refs;
- unresolved endpoint count is recorded;
- evidence coverage is recorded;
- relation type validation passes;
- review-required proposals are marked;
- quality report exists.

## Quality Report Minimum Fields

The quality report should include:

- relation proposal count;
- relation proposal count by type;
- duplicate proposal count;
- unresolved endpoint count;
- schema failure count;
- evidence coverage rate;
- review rate;
- model-assisted proposal count;
- similarity-only proposal count;
- forbidden tool grant count.

## V1 Go Criteria

Proceed to implementation when the following are true:

- `UnderstandToConnectHandoff` schema is available;
- `ConnectionArtifact` and `RelationshipProposal` schemas are available;
- local record/candidate fixture search is available through `record.search`;
- taxonomy relation validation is available;
- required tool grants can be enforced by the orchestrator;
- forbidden ports are blocked;
- failed runs can be traced;
- output can be validated before handoff to `verify`.

## Design Rule

Connect should be graph-aware, but not graph-mutating.

Its job is to propose inspectable edges, not to accept them.
