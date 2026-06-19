# Social Stage Plan

This plan maps project progress to possible publishable updates.

Use it as a reference only. Do not generate new social content from these stages unless the user explicitly asks for it.

## Stage 0: Foundation

Repository state:

- Documentation structure created.
- Vision, architecture, agent roles, knowledge model, RAG limitations, roadmap, and decision log added.
- Problem recognition and solution approach prepared as the first public narrative.

Core message:

> Basic RAG is useful, but long-running knowledge work needs memory, evidence, conflict handling, temporal reasoning, and verification.

Post angles:

- "RAG retrieves chunks. Long-running work needs claims, decisions, evidence, and uncertainty."
- "The problem is not just retrieval. It is maintaining knowledge over time."
- "A knowledge system should preserve why something was decided, not only where it was mentioned."
- "The first design loop is ingest -> understand -> connect -> retrieve -> reason -> verify -> update."

Artifacts to include:

- README link.
- Architecture overview link.
- Problem and approach narrative.
- Simple architecture diagram.

## Stage 1: Ingest Architecture Baseline

Repository state:

- Ingest architecture is clarified.
- Source storage, source versions, manifests, access units, preview artifacts, content-minimal indexing, and ID policy are documented.
- The boundary between `ingest` and `understand` is explicit.

Core message:

> Ingest is not just upload or chunking. It is the source-grounded entry point that preserves evidence before the system tries to understand it.

Post angles:

- "Ingest should preserve evidence before interpretation."
- "The index should help find the source. It should not become the source."
- "A source-grounded agent memory starts with manifests, access units, previews, and deterministic IDs."
- "The first boundary: ingest prepares evidence; understand extracts knowledge candidates."

Artifacts to include:

- Ingest/understand boundary.
- Media concept proof examples.
- Index ID policy.
- Preview artifact policy.

## Stage 2: Understand Architecture Baseline

Repository state:

- Source/document understanding is separated from user-question understanding.
- The Understanding Agent spec is defined.
- Media understand concept proofs are documented.
- Understand outputs are candidate-level artifacts with evidence refs.
- Quality gates are defined before handoff to connect.

Core message:

> Understand is not answer generation. It turns source units into evidence-grounded knowledge candidates.

Post angles:

- "Do not jump from chunks to memory. Create candidates first."
- "Understand should produce claims, decisions, concepts, procedures, questions, and constraints as candidates."
- "Every candidate needs evidence refs."
- "Model-assisted extraction is useful, but the output must still be schema-validated and source-grounded."

Artifacts to include:

- Understanding Agent spec.
- Media understand concept proofs.
- Understand readiness review.
- Minimal knowledge candidate JSON example.
- Ingest-to-understand handoff.

## Stage 3: Connect Architecture Baseline

Repository state:

- The boundary between `understand` and `connect` is explicit.
- `UnderstandToConnectHandoff`, `ConnectionArtifact`, and `RelationshipProposal` are documented.
- Media connect concept proofs are documented.
- Candidate/proposal terminology is clarified.
- Tool permissions are reviewed before implementation.

Core message:

> Connect is not graph storage. It turns isolated candidates into evidence-grounded relationship proposals.

Post angles:

- "Do not jump from candidates to graph edges. Create relationship proposals first."
- "Connect should be graph-aware, not graph-mutating."
- "Contradiction should first be a proposal that can be verified."
- "Tool permissions matter: connect must not receive durable mutation tools."

Artifacts to include:

- Connect baseline.
- Understand-to-connect handoff.
- Media connect concept proofs.
- Connect readiness review.
- Minimal relationship proposal JSON example.

## Stage 4: Verification Loop

Repository state:

- Answers and relationship proposals are checked against retrieved evidence.
- Unsupported claims are flagged.
- Stale or superseded knowledge is surfaced.

Core message:

> Retrieval is only half the problem. The answer and proposed relationships need to be audited.

Post angles:

- "The verifier agent asks: which sentence is supported by which evidence?"
- "A good knowledge system should say when it is unsure."
- "Contradictions are not errors to hide; they are knowledge to represent."

Artifacts to include:

- Verification report.
- Example unsupported answer.
- Conflict handling example.

## Stage 5: Knowledge Graph

Repository state:

- Verified entities and relationships are stored.
- Retrieval planner can traverse relationships.
- Claims, concepts, decisions, and sources are linked.

Core message:

> Similarity search finds related text. Graph structure helps recover meaning and dependency.

Post angles:

- "The graph makes 'why' and 'what depends on this' queryable."
- "A decision can supersede another decision."
- "Contradiction should be an edge only after it survives verification."

Artifacts to include:

- Graph schema.
- Example traversal.
- Visual relationship diagram.

## Stage 6: Durable Memory and Agent Orchestration

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
