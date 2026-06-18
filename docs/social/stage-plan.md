# Social Stage Plan

This plan maps project progress to publishable updates.

## Stage 0: Foundation

Repository state:

- Documentation structure created.
- Vision, architecture, agent roles, knowledge model, RAG limitations, roadmap, and decision log added.

Core message:

> I am starting Knowledge Pools as an agent-oriented knowledge repository that goes beyond chunk-based RAG.

Post angles:

- "RAG retrieves chunks. I want a system that remembers claims, decisions, evidence, and uncertainty."
- "The first commit is documentation, because a knowledge system should remember why it exists."
- "The design loop is ingest -> understand -> connect -> retrieve -> reason -> verify -> update."

Artifacts to include:

- README link.
- Architecture overview link.
- Simple architecture diagram.

## Stage 1: Local Knowledge MVP

Repository state:

- Markdown ingestion exists.
- Source records can be created.
- Basic keyword retrieval works.
- Basic vector retrieval is planned or implemented.

Core message:

> The first working version focuses on source preservation and retrieval discipline before fancy orchestration.

Post angles:

- "The first ingestion target is Markdown because structure matters."
- "Every answer should trace back to source records."
- "Hybrid retrieval starts with boring reliability: keyword plus semantic search."

Artifacts to include:

- CLI demo.
- Example source record.
- Before/after parsed document sample.

## Stage 2: Claim-Level Memory

Repository state:

- Claims can be extracted from sources.
- Claims include evidence links and confidence/status metadata.
- Concepts and decisions can be stored separately.

Core message:

> The durable unit of knowledge is not always a chunk. Often it is a claim.

Post angles:

- "A chunk says where text is. A claim says what the system believes and why."
- "Claim records make contradiction detection possible."
- "Decision memory preserves rationale, not just conclusions."

Artifacts to include:

- Claim JSON example.
- Decision record example.
- Source-to-claim trace.

## Stage 3: Verification Loop

Repository state:

- Answers are checked against retrieved evidence.
- Unsupported claims are flagged.
- Stale or superseded knowledge is surfaced.

Core message:

> Retrieval is only half the problem. The answer needs to be audited.

Post angles:

- "The verifier agent asks: which sentence is supported by which evidence?"
- "A good knowledge system should say when it is unsure."
- "Contradictions are not errors to hide; they are knowledge to represent."

Artifacts to include:

- Verification report.
- Example unsupported answer.
- Conflict handling example.

## Stage 4: Knowledge Graph

Repository state:

- Entities and relationships are stored.
- Retrieval planner can traverse relationships.
- Claims, concepts, decisions, and sources are linked.

Core message:

> Similarity search finds related text. Graph structure helps recover meaning and dependency.

Post angles:

- "The graph makes 'why' and 'what depends on this' queryable."
- "A decision can supersede another decision."
- "Contradiction should be an edge, not a hidden surprise."

Artifacts to include:

- Graph schema.
- Example traversal.
- Visual relationship diagram.

## Stage 5: Durable Memory and Agent Orchestration

Repository state:

- Project memory is updated after useful interactions.
- Planner, retriever, reasoner, verifier, and updater agents run as a coordinated workflow.
- Agent traces are stored for evaluation.

Core message:

> The system becomes useful when it can learn from work without turning every chat into permanent memory.

Post angles:

- "Durable memory should be curated, not dumped."
- "The update agent stores decisions, corrections, constraints, and open questions."
- "Agent traces make the system inspectable."

Artifacts to include:

- End-to-end run trace.
- Memory update example.
- Evaluation checklist.

