# Roadmap

## Phase 0: Repository Foundation

- Create documentation structure.
- Define architecture and agent roles.
- Define initial knowledge model.
- Start decision log.
- Define the ultimate knowledge loop.
- Map the loop to concrete system components.

## Phase 1: Local Knowledge MVP

- Ingest Markdown files.
- Parse document structure.
- Store source records.
- Define on-disk record schemas.
- Implement the V1 required tool-port subset with local file and JSON backends.
- Provide keyword and source lookup.
- Store run traces.

## Phase 2: Understanding and Planning

- Extract basic claims and concepts.
- Use the shared tool pool for the Understanding Agent and Retrieval Planner.
- Add retrieval planning.
- Create evidence bundle format.
- Add basic temporal metadata.

## Phase 3: Connection and Verification Loop

- Add relationship proposal verification.
- Track unsupported proposals and claims.
- Surface contradictory or stale records.
- Add freshness and supersession checks.

## Phase 4: Plan, Retrieve, and Reason

- Add task understanding inside the Retrieval Planner.
- Create evidence bundle format.
- Add planned source, keyword, structured, and graph-aware retrieval.
- Produce draft answers or proposed actions from evidence.
- Add answer grounding checks after reasoning is available.

## Phase 5: Knowledge Graph and Curation

- Add graph-backed relationships.
- Link claims, concepts, decisions, and sources.
- Support graph traversal in retrieval planning.
- Add curation decisions before durable graph writes.

## Phase 6: Durable Memory and Update Candidates

- Produce update candidates after useful verified interactions.
- Store project decisions.
- Store active project context.
- Store reusable user preferences.
- Add update review before committing new durable memory.

## Phase 7: Agent Orchestration and Evaluation

- Add planner-driven retrieval.
- Add specialized ingestion, reasoning, verifier, and updater agents.
- Add evaluation traces for agent runs.
- Use evaluation signals to improve retrieval and verification.
