# Spec: Tool Port Contracts

This is the index for provider-independent tool port specifications.

Tool ports are grouped by meaning so each spec can grow independently without
turning this index into a long mixed contract.

## Purpose

Route implementation-near tool-port work to the right contract group.

## Scope

This index covers Markdown-first tool-port specifications and later extension
groups. It does not define request/response details directly.

## Contract Groups

| Group | Spec | Owns |
| --- | --- | --- |
| Common runtime boundary | [Common Tool Port Contracts](common-tool-port-contracts.md) | request/response envelopes, errors, side effects, traces |
| Source storage and versioning | [Source Tool Ports](source-tool-ports.md) | `source.locate`, `source.read`, `source.write`, `source.version` |
| Document structure | [Document Structure Tool Ports](document-structure-tool-ports.md) | `parse.document`, `chunk.create` |
| Preview and derived navigation | Pending | `preview.create` |
| Taxonomy | Pending | `taxonomy.read`, `taxonomy.validate` |
| Schema and artifact stores | Pending | `schema.validate`, `artifact.read`, `artifact.write` |
| Index and retrieval | Pending | `index.write_projection`, `index.search`, `retrieval.plan`, `retrieval.fetch_evidence` |
| Verification and audit | Pending | `verification.check`, `audit.trace` |
| Model access | [LLM Gateway Contract](llm-gateway-contract.md) | provider-independent LLM adapter boundary |

## Dependency Order

Detailed tool-port specs should be added in this order:

1. Common tool-port runtime boundary.
2. Source storage and versioning ports.
3. Document structure ports.
4. Preview, taxonomy, schema, artifact, index, retrieval, verification, and audit ports.

The first three groups are currently defined because they are required for the
Markdown-first source and access-unit path.

## Core Rules

- Agents and commands call tools through provider-independent ports.
- Tool ports return typed `Result<T>` values across runtime boundaries.
- Source object storage remains the evidence source of truth.
- Index projections are retrieval maps, not evidence truth.
- Parser and chunker tools extract structure and access units, not durable
  semantic knowledge.
- Persisted JSON uses `snake_case`; TypeScript-facing APIs use `camelCase`.
