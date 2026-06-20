# Project Purpose And Scope

This document defines what Knowledge Pools is, what it is not, and how far this repository should go.

## Purpose

Knowledge Pools is an implementation-near specification project for an agent-oriented knowledge operating system.

It explores how to move beyond basic LLM RAG by separating:

- original sources;
- structured knowledge candidates;
- retrieval maps;
- evidence bundles;
- reasoning artifacts;
- verification reports;
- update candidates;
- curation decisions;
- evaluation traces.

The project should make the architecture detailed enough that a future implementation can be built from the specs without guessing core contracts.

## Core Thesis

Most RAG systems retrieve chunks and generate answers.

Knowledge Pools treats knowledge as an auditable operating loop:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

The goal is not to store more text in an index.

The goal is to preserve original sources, create typed artifacts from them, retrieve bounded evidence, reason from that evidence, verify outputs, and update durable knowledge only after curation.

## Repository Scope

This repository is primarily for:

- architecture documents;
- implementation-near specifications;
- TypeScript-facing interface contracts;
- JSON-compatible payload contracts;
- storage and indexing contracts;
- agent contracts;
- tool port contracts;
- fixture and validation plans;
- decision records;
- limited prototype code only when it validates the architecture.

The repository is not currently scoped to become a broad production implementation.

## Implementation Boundary

The primary deliverable is documentation and specification.

Runtime code should be limited to prototype validation only.

The only planned sample implementation is `SummaryAgent`.

`SummaryAgent` exists to validate:

- the agent superclass contract;
- the tool pool contract;
- the agent connection model;
- `StorageSupportable` integration;
- `LlmGateway` integration;
- tool-call traces;
- model feasibility across gateway adapters or model policies.

Any other runtime code should be treated as support code for this prototype unless the project scope is explicitly changed.

## First Sample Code Boundary

`SummaryAgent` may include sample code for:

- a minimal `SummaryAgent`;
- a `summary.read` tool backed by one `StorageSupportable`;
- a mock `LlmGateway`;
- a no-op or disabled `LlmGateway`;
- simple fixture input;
- summary proof output;
- model feasibility report output;
- trace and validation examples.

`SummaryAgent` sample code should not include:

- full ingest pipeline implementation;
- full stage orchestrator;
- real OpenSearch deployment;
- graph database integration;
- vector database integration;
- durable memory writes;
- curation workflow implementation;
- production UI;
- broad media parser implementation;
- provider-specific hidden session state.

## Markdown-First Scope

The first implementation-near specs target Markdown/text.

Markdown-first means:

- local filesystem-compatible storage first;
- local JSON artifacts first;
- OpenSearch-compatible document shapes first, not necessarily a live OpenSearch server;
- deterministic parsing before model-assisted extraction;
- refs, artifacts, validation, and traces before broad runtime code;
- media expansion only after the Markdown/text contracts are stable.

Markdown-first does not mean Markdown-only forever.

Image, PDF, audio, and video remain extension tracks.

## In Scope

- Source storage and version contracts.
- Content-minimal indexing policy.
- Taxonomy-guided understanding.
- Agent superclass contract.
- Agent tool pool.
- Agent connection model.
- Context, session, artifact, handoff, and trace boundaries.
- LLM gateway boundary.
- Markdown-first fixture and validation plans.
- SummaryAgent prototype and feasibility harness.

## Out Of Scope For Now

- Production runtime implementation.
- Production infrastructure provisioning.
- Multi-tenant service design.
- Full ACL enforcement.
- Distributed queues.
- Multi-repository clustering.
- Real-time collaboration.
- Production-grade UI.
- Provider-specific agent framework adoption.
- Automated durable memory writes without curation.

## Design Guardrails

- Specs before runtime code.
- Source objects remain the evidence source of truth.
- Indexes are retrieval maps, not source stores.
- Agents communicate through typed artifacts, not hidden chat history.
- Tool calls go through stable ports.
- LLM calls go through `LlmGateway`.
- Durable knowledge updates require verification and curation.
- Prototype code must prove a contract, not quietly become production scope.

## Scope Change Rule

If the project expands beyond specification work or beyond `SummaryAgent` sample code, update this document first.

Then update:

- [Vision](vision.md);
- [Implementation-Near Specification Preparation](operations/implementation-near-spec.md);
- [Specification Review Checklist](operations/spec-review-checklist.md);
- [Implementation Plan](operations/implementation-plan.md).
