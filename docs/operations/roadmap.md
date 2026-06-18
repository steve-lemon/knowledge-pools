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
- Provide keyword and source lookup.
- Store run traces.

## Phase 2: Understanding and Planning

- Extract basic claims and concepts.
- Add retrieval planning.
- Create evidence bundle format.
- Add basic temporal metadata.

## Phase 3: Verification Loop

- Add answer grounding checks.
- Track unsupported claims.
- Surface contradictory records.
- Add freshness and supersession checks.

## Phase 4: Knowledge Graph

- Add graph-backed relationships.
- Link claims, concepts, decisions, and sources.
- Support graph traversal in retrieval planning.

## Phase 5: Durable Memory and Curation

- Store project decisions.
- Store active project context.
- Store reusable user preferences.
- Add update review before committing new durable memory.

## Phase 6: Agent Orchestration and Evaluation

- Add planner-driven retrieval.
- Add specialized ingestion, reasoning, verifier, and updater agents.
- Add evaluation traces for agent runs.
- Use evaluation signals to improve retrieval and verification.
