# Implementation Specification Architecture

This document defines the architecture for implementation-near specifications.

It does not define runtime code.

It defines how future runtime code should be split into modules, what each module must specify, and how each module should be validated before implementation.

Use it with:

- [Implementation-Near Specification Preparation](../operations/implementation-near-spec.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Agent Superclass Contract](agent-superclass-contract.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [OpenSearch Index Schema](opensearch-index-schema.md)

## Purpose

The next project phase should prepare detailed specs for:

- important modules;
- infrastructure boundaries;
- agents;
- shared tool ports;
- interfaces;
- functions;
- classes;
- objects;
- data contracts;
- validation and verification methods.

Each detailed review should produce implementation-ready contracts without requiring immediate source code.

## Architecture Layers

The implementation-near architecture is split into these layers.

```text
CLI and external interfaces
  -> runtime orchestrator
  -> agent stage modules
  -> shared tool ports
  -> stores and infrastructure adapters
  -> schemas and data contracts
  -> fixtures and validation harness
```

No layer should depend on hidden LLM state.

Every layer should pass explicit refs, typed records, artifacts, handoffs, and trace events.

## Future Runtime Folder Model

This is the target module model for future TypeScript implementation.

It is not a request to create runtime folders yet.

```text
src/
  cli/
    commands/
    output/
    config/
  core/
    ids/
    refs/
    result/
    errors/
    validation/
    clock/
  contracts/
    common/
    source/
    artifacts/
    handoffs/
    evidence/
    index/
    lifecycle/
  runtime/
    orchestrator/
    sessions/
    runs/
    tasks/
    context/
    traces/
  agents/
    base/
    ingestion/
    understanding/
    connection/
    retrieval-planner/
    retrieval/
    reasoning/
    verifier/
    updater/
    curation/
    evaluation/
  tools/
    source/
    parse/
    chunk/
    preview/
    taxonomy/
    schema/
    artifact/
    index/
    retrieval/
    model/
    verification/
    audit/
    evaluation/
  stores/
    filesystem/
    source-store/
    artifact-store/
    run-store/
    trace-store/
    taxonomy-store/
    index-projection-store/
  fixtures/
    markdown/
    expected/
```

## Specification Folder Model

Detailed implementation specs should live under `docs/specs/`.

```text
docs/specs/
  README.md
  modules/
  commands/
  contracts/
  agents/
  tools/
  stores/
  fixtures/
  validation/
```

Use architecture docs to define system intent.

Use specs docs to define implementation-facing contracts.

## Module Groups

| Group | Future runtime area | Spec location | Owns | Must not own |
| --- | --- | --- | --- | --- |
| CLI | `src/cli/` | `docs/specs/commands/` | command contracts, arguments, output format, exit behavior | stage logic, durable mutation policy |
| Core | `src/core/` | `docs/specs/modules/` | IDs, refs, result types, errors, validation primitives | domain-specific stage behavior |
| Contracts | `src/contracts/` | `docs/specs/contracts/` | TypeScript interfaces, JSON-compatible schemas, enum values | tool implementations |
| Runtime | `src/runtime/` | `docs/specs/modules/` | sessions, runs, tasks, context assembly, handoff routing, trace orchestration | semantic extraction, reasoning |
| Agents | `src/agents/` | `docs/specs/agents/` | stage-specific task handling and artifact creation | hidden state, direct infrastructure access outside tools |
| Tools | `src/tools/` | `docs/specs/tools/` | stable ports and provider-independent implementations | agent policy decisions |
| Stores | `src/stores/` | `docs/specs/stores/` | filesystem layout, record persistence, projections, artifact IO | interpretation of knowledge |
| Fixtures | `src/fixtures/` or test resources | `docs/specs/fixtures/` | sample inputs and expected outputs | production behavior |
| Validation | `src/core/validation/` and test harness | `docs/specs/validation/` | schema checks, ref resolution, trace checks, regression gates | silent correction of invalid artifacts |

## Infrastructure Boundaries

The first detailed specs should keep infrastructure simple and replaceable.

| Infrastructure module | V1 form | Primary requirements | Validation method |
| --- | --- | --- | --- |
| Source storage | Filesystem-compatible paths | preserve original source, track immutable versions, compute hash | source hash check, version ref resolution |
| Artifact store | Local JSON files | write typed artifacts by stage, keep provenance | schema validation, artifact lookup test |
| Run store | Local JSON files | record sessions, runs, tasks, statuses | run replay check |
| Trace store | Append-only local trace records | record tool calls, decisions, refs, timestamps | trace completeness check |
| Taxonomy store | Local taxonomy bundle | provide category, attribute, and relation refs | taxonomy ref validation |
| Index projection store | Local OpenSearch-compatible JSON fixtures first | store retrieval maps, not raw content | content-minimal index audit |
| Evidence fetch path | `source.locate` + `source.read` | fetch exact bounded Markdown units by ref | citation-to-source check |
| Model adapter | Optional tool implementation | return schema-validated output, no durable hidden state | output schema and provenance check |

## Agent Module Requirements

Each agent spec should eventually define:

- class name or module entry point;
- task input type;
- context requirements;
- allowed tool ports;
- produced artifact type;
- produced handoff type;
- validation rules;
- trace events;
- failure modes;
- deterministic fallback behavior.

| Stage | Future module | Agent | Primary spec focus |
| --- | --- | --- | --- |
| `ingest` | `src/agents/ingestion/` | `IngestionAgent` | source/version/manifest/access-unit contracts |
| `understand` | `src/agents/understanding/` | `UnderstandingAgent` | candidate extraction and evidence alignment |
| `connect` | `src/agents/connection/` | `ConnectionAgent` | relationship proposal contracts |
| `plan` | `src/agents/retrieval-planner/` | `RetrievalPlanner` | task understanding and retrieval strategy |
| `retrieve` | `src/agents/retrieval/` | `RetrievalAgent` | evidence bundle construction |
| `reason` | `src/agents/reasoning/` | `ReasoningAgent` | cited draft answer or proposed action |
| `verify` | `src/agents/verifier/` | `VerifierAgent` | grounding, freshness, and conflict checks |
| `update` | `src/agents/updater/` | `KnowledgeUpdateAgent` | update candidate contracts |
| `curation` | `src/agents/curation/` | `CurationAgent` | durable write decision contracts |
| `evaluate` | `src/agents/evaluation/` | `EvaluationAgent` | trace, quality, and regression signals |

## Tool Module Requirements

Every tool spec should define a stable port contract.

| Tool family | Example ports | First detailed spec requirements |
| --- | --- | --- |
| Source | `source.locate`, `source.read`, `source.write`, `source.version` | input refs, output locators, hash/version behavior, failure modes |
| Parse | `parse.document` | Markdown parser contract, frontmatter, headings, links, blocks |
| Chunk | `chunk.create` | access-unit boundaries, stable IDs, locator rules |
| Preview | `preview.create`, `preview.lookup` | outline/summary refs, no raw content leakage |
| Taxonomy | `taxonomy.read`, `taxonomy.validate`, `taxonomy.classify` | category refs, attribute refs, schema version behavior |
| Schema | `schema.validate` | validator input/output, error shape |
| Artifact | `artifact.read`, `artifact.write` | artifact metadata, payload, provenance, validation |
| Index | `index.write_projection`, `index.search` | OpenSearch-compatible document shape, query boundary |
| Retrieval | `retrieval.plan`, `retrieval.fetch_evidence` | evidence requirements, bounded fetch behavior |
| Model | `model.complete` | optional adapter, schema output, provider independence |
| Verification | `verification.check` | citation support, missing evidence, stale evidence |
| Audit | `audit.trace`, `audit.read_trace` | append-only events, replay requirements |
| Evaluation | `evaluation.record` | quality signals, regression outcome shape |

## Contract Groups

Detailed specs should group data contracts by ownership.

| Contract group | Examples | Primary owner |
| --- | --- | --- |
| Identity and refs | `SourceId`, `VersionId`, `ArtifactId`, `RunId`, `RefString` | Core |
| Runtime records | `Session`, `Run`, `Task`, `ContextEnvelope`, `TraceEvent` | Runtime |
| Source records | `SourceRecord`, `SourceVersion`, `SourceManifest`, `AccessUnit` | Source store and ingest |
| Artifact records | `Artifact<TPayload>`, `ArtifactMeta`, validation summary | Artifact store |
| Handoffs | stage-to-stage handoff payloads | Runtime and producing agent |
| Knowledge candidates | claims, concepts, decisions, procedures, questions | Understanding |
| Relationship proposals | duplicate, mention, support, contradict, supersede | Connect |
| Retrieval records | `RetrievalPlan`, `EvidenceRequirement`, `EvidenceBundle` | Plan and retrieve |
| Reasoning records | `DraftAnswer`, `ProposedAction`, assumptions | Reason |
| Verification records | `VerificationReport`, unsupported claims, warnings | Verify |
| Lifecycle records | update candidates, curation decisions, tombstones, quarantine | Update and curation |
| Evaluation records | evaluation report, quality signals, regression result | Evaluate |
| Index records | OpenSearch-compatible projection docs | Index projection store |

## Detailed Spec Template

Every future detailed spec should include these sections.

```text
# Spec: Name

## Purpose
## Scope
## Non-Goals
## Owned Responsibilities
## Dependencies
## Public Interfaces
## TypeScript Types
## Classes Or Functions
## Input Contracts
## Output Contracts
## Side Effects
## Tool Ports
## Validation Rules
## Failure Modes
## Trace Events
## Fixtures
## Acceptance Criteria
## Open Questions
```

## Interface Definition Rule

When a future spec defines an interface, it should include:

- TypeScript type or interface name;
- stable field names;
- allowed enum values;
- nullable or optional field policy;
- versioning policy;
- ID and ref policy;
- provenance fields;
- validation behavior;
- example JSON;
- compatibility notes with OpenSearch or filesystem storage when relevant.

## Function And Class Definition Rule

When a future spec defines functions or classes, it should include:

- name;
- responsibility;
- constructor dependencies;
- method signatures;
- sync or async behavior;
- return type;
- error type;
- side effect level;
- trace requirements;
- tests or fixture assertions.

The first implementation can use functions rather than complex classes when a module has no durable state.

Use classes only when constructor dependencies, lifecycle, or polymorphic adapters make the contract clearer.

## Validation Strategy

Each module should define validation at four levels.

| Level | Question | Examples |
| --- | --- | --- |
| Schema validation | Is the object shaped correctly? | required fields, enum values, version format |
| Ref validation | Can every ref be resolved? | source refs, artifact refs, evidence refs |
| Boundary validation | Is the module respecting ownership? | no raw content in index projections, no durable write before curation |
| Behavioral validation | Does the module produce expected results? | fixture comparison, unsupported claim detection |

## Verification Methods

Detailed specs should define how to verify implementation later.

Minimum methods:

- fixture input and expected output comparison;
- schema validation;
- ref resolution checks;
- trace completeness checks;
- negative tests for invalid refs and unsupported claims;
- content-minimal index audit;
- stage handoff validation;
- run replay check.

## First Review Order

Use this order for the next detailed reviews:

1. Contracts and IDs.
2. Local store layout.
3. CLI command contracts.
4. Tool port contracts.
5. Base runtime and orchestrator contracts.
6. Ingest agent spec for Markdown.
7. Understand agent spec for Markdown.
8. Connect through evaluate stage specs.
9. Fixture and regression specification.

This order keeps later agent specs from inventing incompatible objects.

## Readiness Gate

Before moving from implementation-near specs to runtime code, confirm:

- module ownership is clear;
- folder targets are documented;
- command contracts are stable;
- shared object contracts are defined;
- tool ports have input and output schemas;
- store adapters have read/write/ref behavior;
- every stage has artifact and handoff schemas;
- validation rules are explicit;
- fixture expectations are written;
- no spec requires media support before Markdown works.
