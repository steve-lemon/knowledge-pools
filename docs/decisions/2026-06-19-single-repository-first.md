# Decision: Single Repository First

Date: 2026-06-19
Status: accepted

## Context

The architecture risk review identified many important concerns, but implementing all of them immediately would make the first version too complex. The user requested a simpler, incremental direction: start with a single repository and only connect multiple repositories or clusters when needed.

## Decision

Adopt a single-repository-first implementation posture.

V1 should use one logical repository that owns sources, manifests, taxonomy bundle, artifacts, OpenSearch-compatible index documents, sessions, runs, traces, and evaluation fixtures.

Multiple repositories and repository clusters are deferred until there is a concrete isolation or cross-repository retrieval need.

## Rationale

This keeps implementation small while preserving the architecture's future path. The repository boundary gives a clean unit of ownership without requiring distributed systems too early.

## Consequences

The implementation plan should prioritize:

- local filesystem object-store adapter;
- OpenSearch-compatible document fixtures;
- simple source manifests;
- minimal provenance fields;
- simple lifecycle fields;
- optional future fields such as `repository_id` without heavy behavior.

Complex access engines, distributed workflows, multi-index federation, graph databases, and vector databases are deferred.

## Follow-ups

- Update implementation plan to separate MVP requirements from later hardening.
- Keep architecture risk review as a backlog, not an immediate build list.
- Define a minimal repository layout.

