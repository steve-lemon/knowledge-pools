# Single Repository First

This document defines the implementation posture for Knowledge Pools.

The system should start as a single-repository, single-node architecture and grow only when pressure appears.

## Core Principle

Prefer one repository boundary first.

Add multiple stores, services, queues, or clusters only when a concrete scale, reliability, or isolation need appears.

## What Single Repository Means

For the first implementation, a repository is the unit that owns:

- source objects;
- source manifests;
- taxonomy bundle;
- ingest artifacts;
- OpenSearch-compatible index documents or fixtures;
- sessions;
- runs;
- traces;
- evaluation fixtures.

Local development layout:

```text
knowledge/
  sources/
  manifests/
  taxonomy/
  artifacts/
  index-documents/
  sessions/
  runs/
  eval/
```

Production can map the same logical repository to:

```text
object storage prefix
OpenSearch index alias set
```

The shape stays the same even if the backing infrastructure changes.

## V1 Infrastructure Posture

Start with:

- local filesystem as the object-store adapter;
- OpenSearch-compatible JSON documents as fixtures;
- no standalone graph database;
- no separate vector database;
- no distributed workflow queue;
- no multi-tenant cluster logic;
- no separate relational metadata database.

Then connect a real OpenSearch instance once document shapes and query patterns stabilize.

## Progressive Expansion

### Phase 1: Single Repository

One repository owns all source and index data.

Use for:

- local MVP;
- one user;
- one project;
- small to medium source set.

### Phase 2: Single Repository With External OpenSearch

Keep one logical repository, but move index documents into OpenSearch.

Use when:

- keyword and structured search need real query support;
- fixtures become insufficient;
- document count grows.

### Phase 3: Multiple Repositories

Add multiple repositories only when isolation is needed.

Use when:

- projects need different taxonomy bundles;
- access boundaries differ;
- retention policies differ;
- source volume requires separation.

### Phase 4: Repository Cluster

Cluster repositories only when cross-repository retrieval becomes a product requirement.

A repository cluster should provide:

- registry of repositories;
- federated retrieval planner;
- cross-repository source provenance;
- optional shared taxonomy base;
- explicit trust/access rules.

## Repository Cluster Model

```text
repository cluster
  -> repository A
       -> source store
       -> OpenSearch alias set
       -> taxonomy bundle
  -> repository B
       -> source store
       -> OpenSearch alias set
       -> taxonomy bundle
  -> federation layer
       -> route query
       -> merge evidence
       -> preserve provenance
```

The cluster should not erase repository boundaries.

Every retrieved item must retain:

- repository id;
- source id;
- access unit refs;
- taxonomy bundle id/version;
- index alias or index version.

## Do Not Build Yet

Do not build these in the first implementation:

- multi-repository routing;
- cross-index joins;
- distributed ingest workers;
- global taxonomy registry;
- repository federation;
- tenant-level ACL engine;
- vector database abstraction;
- graph database abstraction.

Design fields may leave room for them, but code should stay small.

## Minimal Fields To Keep Future Options Open

Include optional fields:

- `repository_id`
- `project_id`
- `taxonomy_bundle_id`
- `taxonomy_version`
- `source_id`
- `source_version`
- `access_unit_refs`

Avoid implementing heavy behavior around these fields until needed.

## Design Rule

Single repository first.

Multiple repositories only when isolation is real.

Repository clusters only when cross-repository retrieval is real.

