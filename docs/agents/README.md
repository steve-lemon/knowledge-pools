# Agent Specs

This directory contains one specification per agent role.

Use [Agent Design](../architecture/agents.md) as the high-level role map.

For task-focused reading sets, see [Work Context Packs](../operations/work-context-packs.md).

Shared contracts:

- [Single Agent Model](../architecture/single-agent-model.md)
- [Agent Superclass Contract](../architecture/agent-superclass-contract.md)
- [Agent Connection Model](../architecture/agent-connection-model.md)
- [Context and Session Model](../architecture/context-session-model.md)
- [Agent Tool Pool](../architecture/agent-tool-pool.md)

## Agent Specs

- [Ingestion Agent](ingestion-agent.md)
- [Understanding Agent](understanding-agent.md)
- [Connection Agent](connection-agent.md)
- [Retrieval Planner](retrieval-planner.md)
- [Retrieval Agent](retrieval-agent.md)
- [Reasoning Agent](reasoning-agent.md)
- [Verifier Agent](verifier-agent.md)
- [Knowledge Update Agent](knowledge-update-agent.md)
- [Curation Agent](curation-agent.md)
- [Evaluation Agent](evaluation-agent.md)

## Stage Mapping

The canonical stage order is defined in [Ultimate Knowledge Loop](../architecture/ultimate-loop.md).

| Stage | Agent spec | Primary output |
| --- | --- | --- |
| `ingest` | [Ingestion Agent](ingestion-agent.md) | `IngestArtifact` |
| `understand` | [Understanding Agent](understanding-agent.md) | `UnderstandingArtifact` |
| `connect` | [Connection Agent](connection-agent.md) | `ConnectionArtifact` |
| `plan` | [Retrieval Planner](retrieval-planner.md) | `RetrievalPlan` |
| `retrieve` | [Retrieval Agent](retrieval-agent.md) | `EvidenceBundle` |
| `reason` | [Reasoning Agent](reasoning-agent.md) | `DraftAnswer` or `ProposedAction` |
| `verify` | [Verifier Agent](verifier-agent.md) | `VerificationReport` |
| `update` | [Knowledge Update Agent](knowledge-update-agent.md) | `UpdateCandidate` |
| `curation` | [Curation Agent](curation-agent.md) | `CurationDecision` |
| `evaluate` | [Evaluation Agent](evaluation-agent.md) | `EvaluationReport` |

## Rule

Every agent spec must declare:

- purpose;
- responsibilities;
- non-responsibilities;
- trigger;
- task contract;
- context needs;
- required, optional, and forbidden tool ports;
- output artifacts;
- validation and trace requirements;
- handoff target.
