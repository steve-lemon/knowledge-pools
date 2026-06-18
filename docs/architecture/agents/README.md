# Agent Specs

This directory contains one specification per agent role.

Use [../agents.md](../agents.md) as the high-level role map.

Shared contracts:

- [Single Agent Model](../single-agent-model.md)
- [Agent Connection Model](../agent-connection-model.md)
- [Context and Session Model](../context-session-model.md)
- [Agent Tool Pool](../agent-tool-pool.md)

## Agent Specs

- [Ingestion Agent](ingestion-agent.md)
- [Understanding Agent](understanding-agent.md)
- [Retrieval Planner](retrieval-planner.md)
- [Retrieval Agent](retrieval-agent.md)
- [Reasoning Agent](reasoning-agent.md)
- [Verifier Agent](verifier-agent.md)
- [Knowledge Update Agent](knowledge-update-agent.md)
- [Curation Agent](curation-agent.md)
- [Evaluation Agent](evaluation-agent.md)

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
