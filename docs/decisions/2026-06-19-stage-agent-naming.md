# Decision: Stage and Agent Naming

Date: 2026-06-19
Status: accepted

## Context

The user asked to clean up terminology so that workflow stages and agent names map directly.

The architecture had stage names such as `ingest`, `understand`, and `connect`, while agent names were spread across role descriptions and separate spec files.

## Decision

Use canonical stage, agent, and primary artifact names as defined in `docs/architecture/terminology.md`.

The core mapping is:

| Stage | Agent | Primary artifact |
| --- | --- | --- |
| `ingest` | `Ingestion Agent` | `IngestArtifact` |
| `understand` | `Understanding Agent` | `UnderstandingArtifact` |
| `connect` | `Connection Agent` | `ConnectionArtifact` |
| `plan` | `Retrieval Planner` | `RetrievalPlan` |
| `retrieve` | `Retrieval Agent` | `EvidenceBundle` |
| `reason` | `Reasoning Agent` | `DraftAnswer` or `ProposedAction` |
| `verify` | `Verifier Agent` | `VerificationReport` |
| `update` | `Knowledge Update Agent` | `UpdateCandidate` |
| `curation` | `Curation Agent` | `CurationDecision` |
| `evaluate` | `Evaluation Agent` | `EvaluationReport` |

## Rationale

Direct mapping reduces confusion when moving between architecture documents, agent specs, implementation tasks, and artifact schemas.

It also clarifies that `understand` means source/document understanding, while user-question understanding belongs to `Retrieval Planner`.

## Alternatives

- Use stage names and agent names loosely.
- Rename every agent to exactly match the stage verb.
- Keep agent specs only as sections inside `agents.md`.

## Consequences

Documentation and implementation should use the canonical names.

When a new stage or agent is added, update:

- terminology;
- agent specs index;
- high-level agent design;
- implementation plan;
- decision log when the naming affects architecture.

## Follow-ups

- Define the `ConnectionArtifact` schema during the connect-stage design.
- Decide later whether `Retrieval Planner` should be renamed to `Retrieval Planning Agent`; for now it remains the canonical planner role.
