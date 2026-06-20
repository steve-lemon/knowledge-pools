# Documentation Index

This is the main navigation entry for Knowledge Pools documentation.

Use this page to choose the smallest useful reading set before starting work.

## Start Here

Read these first when joining the project or re-orienting:

- [Vision](vision.md)
- [Ultimate Knowledge Loop](architecture/ultimate-loop.md)
- [Terminology](architecture/terminology.md)
- [Architecture Overview](architecture/overview.md)
- [Implementation Plan](operations/implementation-plan.md)
- [Implementation-Near Specification Preparation](operations/implementation-near-spec.md)
- [Work Context Packs](operations/work-context-packs.md)

## Work Context Packs

For focused work, use [Work Context Packs](operations/work-context-packs.md).

That document lists which files to read for:

- stage design;
- agent design;
- ingest work;
- understand work;
- connect work;
- verify work;
- OpenSearch/index work;
- update, curation, lifecycle, rollback, and deletion work;
- social content work.

## Architecture

Use [Architecture Index](architecture/README.md) for architecture documents grouped by topic.

High-level anchors:

- [System Architecture](architecture/system-architecture.md)
- [Knowledge Model](architecture/knowledge-model.md)
- [Stage Data Flow Contract](architecture/stage-data-flow-contract.md)
- [Agent Design](architecture/agents.md)
- [Agent Tool Pool](architecture/agent-tool-pool.md)

## Agents

Use [Agent Specs](agents/README.md) for one document per agent role.

The canonical runtime order is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

## Decisions

Use [Decision Log](decisions/README.md) to understand why the architecture changed.

Decision files are historical records. Prefer current architecture docs when implementing.

## Operations

- [Implementation Plan](operations/implementation-plan.md)
- [Implementation-Near Specification Preparation](operations/implementation-near-spec.md)
- [Roadmap](operations/roadmap.md)
- [Stage Transition Guidelines](operations/stage-transition-guidelines.md)
- [Work Context Packs](operations/work-context-packs.md)

## Social

Social content is intentionally on-demand.

Use [Social README](social/README.md) and [Social Stage Plan](social/stage-plan.md) only when the user asks for social content.

## Documentation Rule

Do not read every document by default.

Start from the relevant context pack, then expand only when a boundary, schema, or decision record is needed.

## File Placement Rule

Use this layout for new documents:

| Kind | Location |
| --- | --- |
| Current architecture | `docs/architecture/` |
| Agent role spec | `docs/agents/` |
| Implementation workflow | `docs/operations/` |
| Architecture decision record | `docs/decisions/` |
| Research notes | `docs/research/` |
| Social drafts and strategy | `docs/social/` |

Do not add new top-level docs unless they are project-wide entry points.

When a new architecture document is added, link it from [Architecture Index](architecture/README.md) and the relevant context pack.
