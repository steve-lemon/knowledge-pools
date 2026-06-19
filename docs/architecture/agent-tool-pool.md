# Agent Tool Pool

This document defines the shared tool pool used by Knowledge Pools agents.

The goal is to keep agent capabilities consistent, auditable, and LLM-independent.

Agents should call tools through stable ports. The implementation behind a port may be a local function, CLI, API, database query, object store call, model adapter, or human review workflow.

## Core Rule

Tools are shared capabilities, not agent-owned behavior.

An agent receives a task, a context envelope, and a set of allowed tool ports.

```text
task + context envelope + allowed tool ports
  -> agent
  -> tool calls
  -> typed artifacts + traces
```

The same agent role can run with different tool implementations if the port contracts remain stable.

## Implementation Posture

The tool pool is intentionally implementable with simple local infrastructure first.

V1 should not require a full agent framework, graph database, vector database, distributed queue, or provider-specific tool-calling runtime.

The first implementation can use:

- local filesystem or object-store-compatible paths for sources and artifacts;
- JSON files for records, traces, and run workspaces;
- deterministic parsers and validators;
- optional OpenSearch for projection search;
- optional model adapter for structured extraction;
- explicit orchestrator permission checks.

The tool pool should be read as a port catalog, not a mandate to implement every port immediately.

## Implementation Tiers

| Tier | Meaning | Examples |
| --- | --- | --- |
| V1 required | Needed for the first local implementation path | source read, artifact read/write, schema validation, candidate emit, audit trace |
| V1 optional | Useful in v1 when available, but not required to prove the architecture | model adapter, OpenSearch projection search, taxonomy classify |
| Deferred | Needed for scale, governance, or later stages | durable memory write, rollback, deletion, graph traversal, evaluation reports |

## V1 Implementable Port Set

The first implementation should focus on ports that can be backed by local files and simple functions.

Required V1 ports:

| Port | Simple implementation |
| --- | --- |
| `artifact.read` | Read JSON or text artifacts from the run workspace |
| `artifact.write` | Write JSON artifacts to the run workspace |
| `source.write` | Write source records and source-version metadata to local JSON/object paths |
| `source.version` | Create or resolve immutable source-version IDs from hashes |
| `source.locate` | Resolve source/access-unit refs from manifest JSON |
| `source.read` | Read exact source units from filesystem/object-store paths |
| `hash.compute` | Compute SHA-256 from local bytes |
| `mime.detect` | Detect media hint from metadata and lightweight inspection |
| `parse.document` | Parse Markdown/text structure with deterministic rules |
| `chunk.create` | Create heading-aware access units for Markdown/text |
| `taxonomy.read` | Load taxonomy bundle JSON |
| `taxonomy.validate` | Validate category, attribute, and candidate type refs |
| `schema.validate` | Validate artifacts against local schemas |
| `candidate.emit` | Write candidate JSON artifacts |
| `ambiguity.emit` | Write ambiguity note artifacts |
| `review.request` | Write review request artifacts |
| `audit.trace` | Append tool-call trace events |

Optional V1 ports:

| Port | Simple implementation |
| --- | --- |
| `index.write_projection` | Write OpenSearch documents or local fixture documents |
| `index.search` | Query OpenSearch or local fixture search |
| `record.search` | Search local JSON records |
| `retrieval.fetch_evidence` | Resolve refs and call `source.read` |
| `retrieval.plan` | Deterministic planner over task type and constraints |
| `model.complete` | Model adapter returning schema-validated JSON |
| `verification.check` | Deterministic grounding and freshness checks |
| `evaluation.record` | Append evaluation JSON records |

Deferred ports:

- `source.tombstone`;
- `source.restore`;
- `parse.media`;
- `preview.create`;
- `model.embed`;
- `graph.query`;
- `reason.synthesize`;
- `curation.decide`;
- `curation.propose`;
- `memory.write`;
- `memory.update_status`;
- `rollback.create_event`;
- `delete.create_tombstone`;
- `audit.read_trace`;
- `evaluation.report`.

Deferred does not mean unimportant.

It means the architecture can be proven without implementing it first.

## Tool Port Shape

Every tool port should define:

- `port_id`;
- purpose;
- allowed input schema;
- output schema;
- side effect level;
- required permissions;
- trace requirements;
- failure modes;
- stage access policy.

Recommended side effect levels:

| Level | Meaning |
| --- | --- |
| `read_only` | Reads stored data or metadata |
| `derive` | Creates derived artifacts from existing data |
| `propose` | Emits candidates or proposals |
| `mutate_projection` | Changes indexes or projections |
| `mutate_durable` | Changes durable records or lifecycle state |
| `external_effect` | Calls external systems or produces externally visible effects |

Most agents should only have `read_only`, `derive`, or `propose` tools.

Durable mutation should be limited to curation and accepted durable-update workflows.

## Common Tool Families

### Source Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `source.read` | Fetch source bytes or exact access-unit content | `read_only` |
| `source.locate` | Resolve source/access-unit/preview refs to object locations | `read_only` |
| `source.write` | Store original source or source version | `mutate_durable` |
| `source.version` | Create or resolve immutable source versions | `mutate_durable` |
| `source.tombstone` | Hide, soft-delete, archive, or tombstone content | `mutate_durable` |
| `source.restore` | Restore soft-deleted or archived content | `mutate_durable` |

### Parsing and Media Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `parse.document` | Parse text, Markdown, PDF, JSON, or code structure | `derive` |
| `parse.media` | Extract media metadata, OCR, transcript, subtitles, frames, or waveform data | `derive` |
| `chunk.create` | Create access units from source structure | `derive` |
| `preview.create` | Create thumbnails, summaries, outlines, waveform previews, or video previews | `derive` |
| `hash.compute` | Compute source or artifact hashes | `derive` |
| `mime.detect` | Detect media type and extension hints | `derive` |

### Taxonomy and Schema Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `taxonomy.read` | Load taxonomy bundle and vocabularies | `read_only` |
| `taxonomy.classify` | Assign categories or typed attributes to source/access units/candidates | `derive` |
| `taxonomy.validate` | Validate attributes, categories, and relation types | `read_only` |
| `taxonomy.propose` | Propose new taxonomy terms or schema refinements | `propose` |
| `schema.validate` | Validate artifacts against JSON/schema contracts | `read_only` |

### Candidate and Artifact Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `artifact.write` | Store run-local or derived artifacts | `derive` |
| `artifact.read` | Read artifacts by ref | `read_only` |
| `candidate.emit` | Emit knowledge, relation, or update candidates | `propose` |
| `ambiguity.emit` | Emit ambiguity notes | `propose` |
| `review.request` | Create review request artifacts | `propose` |

### Index and Retrieval Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `index.write_projection` | Write content-minimal OpenSearch projections | `mutate_projection` |
| `index.deactivate_projection` | Hide, tombstone, quarantine, or retract projections | `mutate_projection` |
| `index.search` | Search OpenSearch projections | `read_only` |
| `record.search` | Search durable records and candidates | `read_only` |
| `graph.query` | Query graph records or projected relations | `read_only` |
| `retrieval.fetch_evidence` | Fetch exact source units after retrieval | `read_only` |
| `retrieval.plan` | Create a structured retrieval plan from task constraints | `derive` |
| `preview.lookup` | Resolve preview artifacts such as thumbnails, storyboards, waveform previews, or summaries | `read_only` |

### Reasoning and Model Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `model.complete` | Produce structured model-assisted output | `derive` |
| `model.embed` | Produce embeddings where enabled | `derive` |
| `reason.synthesize` | Create draft answers or plans from evidence | `derive` |
| `verification.check` | Check grounding, freshness, contradiction, and policy constraints | `read_only` |

Model tools are optional implementation details.

They must not expose provider-specific chat state as durable system state.

### Lifecycle and Governance Tools

| Port | Purpose | Side effect |
| --- | --- | --- |
| `curation.decide` | Accept, edit, defer, reject, retract, or supersede candidates | `mutate_durable` |
| `curation.propose` | Propose a curation action without applying it | `propose` |
| `memory.write` | Write durable accepted knowledge records | `mutate_durable` |
| `memory.update_status` | Supersede, retract, archive, quarantine, or tombstone records | `mutate_durable` |
| `rollback.create_event` | Create rollback events and affected-ref lists | `mutate_durable` |
| `delete.create_tombstone` | Create content tombstone records | `mutate_durable` |
| `audit.trace` | Store trace events for tool calls and decisions | `derive` |
| `audit.read_trace` | Read run traces and tool-call traces | `read_only` |
| `evaluation.record` | Store quality signals and run outcomes | `derive` |
| `evaluation.report` | Produce quality reports from stored signals | `derive` |

## Stage Tool Access

The orchestrator should grant tools by stage, not by agent personality.

| Stage | Default allowed tool families |
| --- | --- |
| `ingest` | source, parsing/media, taxonomy read/classify, artifact, candidate emit, index projection |
| `understand` | source read/locate, artifact read/write, taxonomy read/validate/classify, candidate emit, ambiguity emit, review request, model adapter |
| `connect` | artifact read/write, record search, optional graph query, taxonomy read/validate, schema validate, candidate emit, ambiguity emit, review request, optional model adapter |
| `plan` | retrieval plan, record search, index search metadata, schema validate, artifact write, optional graph query, optional preview lookup, optional model adapter |
| `retrieve` | artifact read/write, schema validate, index search, record search, graph query, source locate/read, evidence fetch, optional preview lookup |
| `reason` | artifact read/write, schema validate, optional bounded source read, model adapter, reason synthesize |
| `verify` | artifact read/write, schema validate, taxonomy read/validate, verification check, optional evidence read, optional record/graph search, audit trace |
| `update` | artifact read/write, schema validate, candidate emit, optional review request, optional taxonomy read/validate, optional record search, optional `curation.propose`, audit trace |
| `curation` | curation decide, memory write, memory status update, rollback/delete events |
| `evaluate` | `audit.read_trace`, `evaluation.record`, `evaluation.report` |

## Agent Design Requirement

Every future agent design must declare its tool contract.

Each agent section should include:

- required tool ports;
- optional tool ports;
- explicitly forbidden tool ports;
- expected artifacts produced through those tools;
- side effect level allowed for the stage.

Agent designs should not introduce private capabilities outside this pool.

If a new capability is needed, update this document first, then link the agent to the new port.

Minimal template:

```markdown
### Tool Contract

Required ports:

- ...

Optional ports:

- ...

Forbidden ports:

- ...

Maximum side effect level:

- ...
```

## Understand Stage Tool Set

The first `understand` implementation should use a narrow tool set.

The full agent contract is defined in [Understanding Agent Spec](../agents/understanding-agent.md).

Required:

- `artifact.read`;
- `source.locate`;
- `source.read`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `schema.validate`;
- `candidate.emit`;
- `ambiguity.emit`;
- `review.request`;
- `artifact.write`;
- `audit.trace`.

Optional:

- `taxonomy.classify`;
- `model.complete`;
- `parse.document` for structural re-checks;
- `retrieval.fetch_evidence` when access-unit refs need exact text or media spans.

Not allowed:

- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `index.deactivate_projection`;
- `rollback.create_event`;
- `delete.create_tombstone`.

Understand may interpret and propose, but it must not mutate durable memory or lifecycle state.

## Plan Stage Tool Set

The first `plan` implementation should use a narrow tool set.

The full agent contract is defined in [Retrieval Planner Spec](../agents/retrieval-planner.md).

Required:

- `retrieval.plan`;
- `record.search`;
- `index.search`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional:

- `graph.query`;
- `taxonomy.read`;
- `model.complete`;
- `artifact.read`;
- `preview.lookup`.

Not allowed:

- `source.read`;
- `retrieval.fetch_evidence`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

Plan may inspect metadata and produce a retrieval strategy, but it must not fetch evidence or synthesize answers.

## Retrieve Stage Tool Set

The first `retrieve` implementation should execute a validated plan and return evidence bundles.

The full agent contract is defined in [Retrieval Agent Spec](../agents/retrieval-agent.md).

Required:

- `artifact.read`;
- `schema.validate`;
- `index.search`;
- `record.search`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `artifact.write`;
- `audit.trace`.

Optional:

- `graph.query`;
- `preview.lookup`;
- `taxonomy.read`;
- `model.embed`.

Not allowed:

- `retrieval.plan`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

Retrieve may fetch bounded evidence, but it must not synthesize answers or mutate durable state.

## Reason Stage Tool Set

The first `reason` implementation should synthesize from a validated evidence bundle and return draft artifacts.

The full agent contract is defined in [Reasoning Agent Spec](../agents/reasoning-agent.md).

Required:

- `artifact.read`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional:

- `source.read`;
- `model.complete`;
- `reason.synthesize`;
- `record.search`.

Not allowed:

- `retrieval.plan`;
- `index.search`;
- `retrieval.fetch_evidence`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

Reason may synthesize draft output from evidence, but it must not retrieve new evidence, verify itself, or mutate durable state.

## Permission Model

Every tool call should be checked against:

- agent id;
- stage;
- task id;
- context envelope;
- allowed tool ports;
- source access policy;
- side effect level;
- requested target refs.

If a tool needs stronger permissions than the agent has, it should fail with:

```text
permission_required
```

The agent may then emit a review request or handoff request instead of bypassing the boundary.

## Trace Requirements

Every tool call should emit a trace event with:

- `tool_call_id`;
- `port_id`;
- `agent_id`;
- `task_id`;
- `run_id`;
- input refs;
- output refs;
- side effect level;
- status;
- error class when failed;
- created_at.

For model-assisted tools, also record:

- adapter name;
- model family or runtime class;
- prompt or instruction version;
- config hash;
- token or cost metadata when available;
- output schema validation result.

## Tool Result Rule

Tools should return refs and structured metadata, not unbounded prose.

Good:

```json
{
  "status": "completed",
  "artifact_refs": ["kc_claim_001"],
  "trace_ref": "trace_tool_001"
}
```

Risky:

```json
{
  "result": "Here is everything I found..."
}
```

When text is unavoidable, it should be stored as a bounded artifact with a ref.

## Minimal V1 Rule

For v1:

- define tool ports as interfaces before binding them to real implementations;
- grant tools by workflow stage;
- make all mutation tools explicit and traceable;
- keep `understand` limited to read, derive, and propose tools;
- validate every tool output before passing it to the next stage.

## Design Rule

Agents do not own tools.

Agents receive temporary permission to use shared tool ports for one task.
