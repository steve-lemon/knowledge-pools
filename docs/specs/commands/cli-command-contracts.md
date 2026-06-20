# Spec: CLI Command Contracts

This spec defines the Markdown-first CLI command contracts.

It depends on:

- [Storage And Indexing Contract](../stores/storage-indexing-contract.md)
- [Common Contracts And IDs](../contracts/common-contracts.md)
- [Local Store Layout](../stores/local-store-layout.md)

The CLI is a local operator interface for implementation-near validation.

It is not a production API.

## Purpose

Define command behavior for:

- repository config discovery;
- common output format;
- exit codes;
- Markdown-first ingest;
- staged execution;
- search, ask, verify, update, curate, and evaluate workflows;
- dry-run, verbose, JSON output, and trace behavior.

## Scope

The first CLI targets local Markdown-first validation.

Commands write local JSON-compatible records under `knowledge/`.

Commands must preserve stage artifacts, handoffs, and traces separately.

## Non-Goals

- No production server API.
- No interactive UI.
- No real OpenSearch requirement.
- No media-specific CLI behavior.
- No hidden provider session state.
- No durable memory write before curation.

## Naming Convention

CLI flags use kebab-case.

TypeScript command contracts use `camelCase`.

Persisted JSON output uses `snake_case`.

Examples:

```text
--data-root
--json
--dry-run
```

```ts
export interface CommandContext {
  dataRoot: StoragePath;
  repositoryId: RepositoryId;
  json: boolean;
}
```

## Global Options

All commands support:

```text
--data-root <path>
--repository-id <id>
--config <path>
--json
--verbose
--dry-run
--trace
```

Rules:

- default `--data-root` is `knowledge`;
- command-line values override config file values;
- config values override defaults;
- `--json` prints machine-readable command output;
- `--verbose` prints human-readable extra detail unless `--json` is set;
- `--dry-run` validates inputs and planned writes without committing store changes;
- `--trace` prints or writes trace refs in command output.

## Config Discovery

Discovery order:

1. explicit `--config`;
2. `{data_root}/repository.json`;
3. default local config.

Minimum config:

```json
{
  "schema_version": "0.1.0",
  "repository_id": "repo_main",
  "local_data_root": "knowledge"
}
```

If no repository metadata exists, commands that mutate state must fail unless they explicitly initialize repository metadata.

P0 does not define an init command.

## Common Command Output

Human output may be concise.

JSON output must follow this shape:

```json
{
  "ok": true,
  "command": "kp ingest",
  "repository_id": "repo_main",
  "run_id": "run_01HXYZ",
  "created_artifact_refs": ["artifact:artifact_ingest_01HXYZ"],
  "created_handoff_refs": ["handoff:handoff_ingest_understand_01HXYZ"],
  "trace_refs": ["trace:trace_01HXYZ"],
  "warnings": []
}
```

Failure output:

```json
{
  "ok": false,
  "command": "kp ingest",
  "error": {
    "code": "missing_source_object",
    "message": "Source path does not exist.",
    "severity": "error",
    "retryable": false
  },
  "trace_refs": ["trace:trace_01HXYZ"]
}
```

JSON output uses persisted `snake_case`.

Command implementation types use `camelCase`.

## Exit Code Policy

| Code | Meaning |
| --- | --- |
| `0` | success |
| `1` | expected command failure |
| `2` | invalid CLI usage |
| `3` | validation failed |
| `4` | unresolved ref or missing object |
| `5` | storage or provider failure |
| `6` | verification failed |
| `7` | permission denied |

Dry-run validation failures use the same exit codes they would use during normal execution.

## Common Command Context

```ts
export interface CommandContext {
  commandName: string;
  repositoryId: RepositoryId;
  dataRoot: StoragePath;
  configPath?: StoragePath;
  json: boolean;
  verbose: boolean;
  dryRun: boolean;
  trace: boolean;
  startedAt: IsoDateTime;
}
```

## Command Result Type

```ts
export interface CommandResult {
  ok: boolean;
  commandName: string;
  repositoryId: RepositoryId;
  runId?: RunId;
  createdArtifactRefs: RefString[];
  createdHandoffRefs: RefString[];
  traceRefs: RefString[];
  warnings: ContractError[];
  error?: ContractError;
}
```

Persisted or JSON printed command result maps to `snake_case`.

## `kp ingest <path>`

Purpose:

- import Markdown/text source files into local source storage;
- create source records, source versions, manifests, access units, ingest artifacts, index projections, and ingest-to-understand handoffs.

Input:

```text
kp ingest <path> [--recursive] [--include <glob>] [--exclude <glob>]
```

P0 media:

- Markdown;
- plain text;
- JSON only as a source object when explicitly allowed later.

Creates:

- `Run`;
- ingest task record;
- `SourceRecord`;
- `SourceVersion`;
- `SourceManifest`;
- `AccessUnit[]`;
- `IngestArtifact`;
- `IngestToUnderstandHandoff`;
- OpenSearch-compatible local projection fixtures;
- trace events.

Must write to:

- `knowledge/sources/`;
- `knowledge/artifacts/ingest/`;
- `knowledge/handoffs/ingest-understand/`;
- `knowledge/index-projections/`;
- `knowledge/traces/`.

Failure behavior:

- missing path: exit `4`;
- unsupported media: exit `1`;
- hash mismatch after write: exit `3`;
- invalid projection schema: exit `3`;
- storage failure: exit `5`.

Dry-run:

- scans files;
- computes planned source IDs and source version IDs;
- validates planned writes;
- does not write source, artifact, projection, or trace records except optional dry-run trace when `--trace` is set.

## `kp understand <run-id>`

Purpose:

- consume ingest artifacts and handoffs;
- produce source-grounded knowledge candidates.

Input:

```text
kp understand <run-id>
```

Creates:

- `UnderstandingArtifact`;
- `UnderstandToConnectHandoff`;
- ambiguity or review artifacts when needed;
- trace events.

Must not:

- create durable knowledge records;
- mutate source versions;
- write durable graph records.

Failure behavior:

- missing run: exit `4`;
- missing ingest handoff: exit `4`;
- invalid source/access-unit refs: exit `3`;
- insufficient source evidence: exit `3`.

## `kp connect <run-id>`

Purpose:

- consume understanding candidates;
- propose relationships between candidates and known context.

Input:

```text
kp connect <run-id>
```

Creates:

- `ConnectionArtifact`;
- relationship proposals;
- optional verification handoff for relationship proposals;
- trace events.

Must not:

- write durable graph edges;
- mark relationship proposals as true.

Failure behavior:

- missing understanding artifact: exit `4`;
- invalid candidate refs: exit `3`;
- taxonomy relation violation: exit `3`.

## `kp plan "<question>"`

Purpose:

- understand user task intent;
- create retrieval strategy without fetching evidence.

Input:

```text
kp plan "<question>" [--freshness latest|stable|historical|any]
```

Creates:

- `RetrievalPlan`;
- `PlanToRetrieveHandoff`;
- trace events.

Must not:

- fetch source evidence;
- call `source.read`;
- create draft answers.

Failure behavior:

- empty question: exit `2`;
- unsupported freshness value: exit `2`;
- invalid plan schema: exit `3`.

## `kp retrieve <plan-id>`

Purpose:

- execute a retrieval plan;
- create bounded evidence bundles from approved refs.

Input:

```text
kp retrieve <plan-id>
```

Creates:

- `EvidenceBundle`;
- `RetrieveToReasonHandoff`;
- missing evidence records when needed;
- trace events.

Reads:

- local projection fixtures;
- source manifests;
- exact source access units.

Failure behavior:

- missing plan: exit `4`;
- unresolved access unit: exit `4`;
- inactive projection used as current evidence: exit `3`;
- evidence fetch failure: exit `5`.

## `kp search "<query>"`

Purpose:

- inspect OpenSearch-compatible local projection fixtures;
- validate retrieval map behavior before full `kp ask`.

Input:

```text
kp search "<query>" [--type <index_document_type>] [--limit <n>]
```

Creates:

- optional search trace events;
- no stage artifact by default unless `--trace` or `--json` requires persisted audit output.

Must not:

- fetch evidence unless explicitly extended later;
- create draft answers;
- mutate projections.

Failure behavior:

- empty query: exit `2`;
- invalid projection fixture: exit `3`;
- index fixture missing: exit `4`.

## `kp ask "<question>"`

Purpose:

- convenience command for the Markdown-first question-answer path.

Input:

```text
kp ask "<question>"
```

Orchestrates:

```text
plan -> retrieve -> reason -> verify
```

Creates:

- `RetrievalPlan`;
- `EvidenceBundle`;
- `DraftAnswer` or `ProposedAction`;
- `VerificationReport`;
- optional `UpdateCandidate` only when verification passes and update policy allows candidate emission;
- trace events.

Rules:

- `kp ask` must still persist each stage artifact separately;
- verification failure should return a failed or warning answer result, not silently present unsupported claims;
- answer citations must point to evidence refs.

Failure behavior:

- planning failure: corresponding plan exit code;
- retrieval failure: corresponding retrieve exit code;
- reasoning failure: exit `1` or `5`;
- verification failure: exit `6`.

## `kp verify <run-id>`

Purpose:

- verify draft answers, proposed actions, or relationship proposals in a run.

Input:

```text
kp verify <run-id>
```

Creates:

- `VerificationReport`;
- `VerifyToUpdateHandoff` when applicable;
- trace events.

Failure behavior:

- missing run: exit `4`;
- missing evidence bundle: exit `4`;
- unsupported claims: exit `6`;
- stale evidence presented as current: exit `6`.

## `kp update <run-id>`

Purpose:

- convert verified useful outcomes into update candidates.

Input:

```text
kp update <run-id>
```

Creates:

- `UpdateCandidate`;
- `UpdateToCurationHandoff`;
- trace events.

Must not:

- write durable memory;
- mutate graph records;
- update source records directly.

Failure behavior:

- missing verification report: exit `4`;
- unsupported or failed verification: exit `6`;
- missing provenance: exit `3`.

## `kp curate <candidate-id>`

Purpose:

- record a curation decision for an update candidate.

Input:

```text
kp curate <candidate-id> --decision accept|edit|defer|reject|retract|supersede
```

Creates:

- `CurationDecision`;
- `CurationToEvaluateHandoff`;
- lifecycle event records when applicable;
- trace events.

P0/P1 posture:

- curation decision contracts are specified;
- durable write behavior remains limited until lifecycle specs are complete.

Failure behavior:

- missing candidate: exit `4`;
- invalid decision: exit `2`;
- missing provenance: exit `3`;
- durable write attempted without accepted decision: exit `3`.

## `kp evaluate <run-id>`

Purpose:

- evaluate run traces, artifacts, verification outcome, and regression signals.

Input:

```text
kp evaluate <run-id>
```

Creates:

- `EvaluationReport`;
- trace or regression summary artifacts;
- no source mutation.

Failure behavior:

- missing run: exit `4`;
- missing trace: exit `4`;
- invalid artifact chain: exit `3`.

## Trace Behavior

Every mutating or stage-producing command must emit trace events.

Trace events must include:

- command name;
- run id when applicable;
- task id when applicable;
- input refs;
- output refs;
- store writes;
- validation status;
- error code when applicable.

Trace JSON Lines use persisted `snake_case`.

## Dry-Run Behavior

Dry-run must:

- validate inputs;
- compute planned refs when deterministic;
- report planned writes;
- avoid writing source, artifact, handoff, projection, or lifecycle records;
- avoid promoting current pointers;
- avoid creating durable update decisions.

Dry-run may:

- print planned command output;
- write ephemeral local logs only if configured outside the repository store.

## Acceptance Criteria

This spec is ready when:

- global options and config discovery are defined;
- common output format is defined;
- exit code policy is defined;
- every target command has purpose, input, created records, and failure behavior;
- `kp search` is included for projection fixture inspection;
- `kp ask` preserves separate stage artifacts;
- dry-run, verbose, JSON output, and trace behavior are defined.
