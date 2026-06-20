# Roadmap

## Phase 0: Repository Foundation

- Create documentation structure.
- Define architecture and agent roles.
- Define initial knowledge model.
- Start decision log.
- Define the ultimate knowledge loop.
- Map the loop to concrete system components.

## Phase 1: Local Knowledge MVP

- Prepare implementation-near specifications before runtime code.
- Define command contracts, module boundaries, local store layout, TypeScript-facing schemas, fixtures, and validation gates.
- Ingest Markdown files.
- Parse document structure.
- Store source records.
- Define on-disk record schemas.
- Implement the V1 required tool-port subset with local file and JSON backends.
- Provide keyword and source lookup.
- Store run traces.
- Keep image, audio, video, and PDF as documented extension tracks only.

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
- Add planned source and keyword retrieval for Markdown/text first.
- Produce draft answers or proposed actions from Markdown/text evidence.
- Add answer grounding checks for Markdown/text evidence.
- Expand to structured, graph-aware, and media-specific retrieval after the Markdown/text flow is stable.

## Phase 4.5: Media Expansion Tracks

- Add image access units, previews, OCR/labels, and region evidence.
- Add PDF page, block, table, figure, and OCR evidence.
- Add audio transcript spans, time ranges, waveform previews, and confidence handling.
- Add video scene, subtitle, frame range, keyframe, and storyboard evidence.
- Keep Markdown/text regression tests passing while each media type is added.

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
