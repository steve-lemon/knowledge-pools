# Stage 0: Problem Recognition and Approach

This is the first public-facing narrative for Knowledge Pools.

Use this document when introducing why the project exists before showing implementation details.

## Core Thesis

Basic RAG is useful, but it is not enough for long-running knowledge work.

Retrieving similar chunks can answer simple questions, but a durable knowledge system needs to remember context, evidence, decisions, contradictions, and change over time.

## Problem Recognition

Most current RAG systems are built around this flow:

```text
question -> vector search -> retrieved chunks -> generated answer
```

This works when the answer is close to a document passage. It becomes weaker when the system must support ongoing work.

Key problems:

- Context is fragmented into chunks.
- Similarity is treated as relevance.
- Old and new knowledge are mixed together.
- Conflicting sources are not represented explicitly.
- Decisions and rationale disappear after the conversation.
- Generated summaries can drift away from source evidence.
- User or project memory becomes either too shallow or too noisy.

The deeper issue is that many RAG systems treat knowledge as text to retrieve, not as a living structure to maintain.

## Why This Matters

In real projects, the most important questions are rarely just "which paragraph mentions this?"

They are closer to:

- Why did we make this decision?
- Which source supports this claim?
- Is this still true?
- What changed since the last version?
- Which assumptions conflict?
- What should the agent remember for future work?

A useful knowledge repository should help answer those questions without pretending uncertainty does not exist.

## Approach

Knowledge Pools approaches this as an agent-oriented knowledge repository.

Instead of only storing chunks, it stores and connects multiple knowledge units:

- sources
- claims
- decisions
- concepts
- procedures
- open questions
- evidence links

The system should follow this loop:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

## Design Moves

### 1. Preserve Sources

Original sources remain the ground truth. Summaries and claims should point back to evidence.

### 2. Extract Claims

Important statements are represented as claims with provenance, confidence, status, and validity over time.

### 3. Record Decisions

Long-term systems need to preserve not only what was chosen, but why it was chosen.

### 4. Use Hybrid Retrieval

Vector search is only one retrieval path. Keyword search, graph traversal, source lookup, and temporal filters are also needed.

### 5. Represent Conflict

Contradiction should become an explicit relationship, not an accidental failure mode.

### 6. Verify Answers

Generated answers should be checked against evidence before being treated as reliable.

### 7. Update Durable Memory Carefully

Not every chat message should become memory. The system should store reusable decisions, corrections, constraints, and open questions.

## First Public Message

The first share should not claim that the system is already complete.

It should say:

> I am starting from the belief that RAG needs a stronger memory and verification layer. The first step is defining the problem clearly and designing the knowledge units the system must preserve.

## Suggested Korean Summary

```text
RAG는 유용하지만, 장기적인 지식 작업에는 부족합니다.

질문과 비슷한 chunk를 찾는 것만으로는 다음 질문에 답하기 어렵습니다.

- 왜 이 결정을 했는가?
- 어떤 근거가 있는가?
- 이 지식은 아직 유효한가?
- 서로 충돌하는 내용은 무엇인가?
- 다음 작업을 위해 무엇을 기억해야 하는가?

Knowledge Pools는 이 문제를 단순 검색 문제가 아니라, 지식을 유지보수하는 문제로 봅니다.

그래서 chunk뿐 아니라 source, claim, decision, concept, procedure, open question을 저장하고 연결하는 에이전트 기반 지식 저장소로 설계합니다.

핵심 루프는 다음과 같습니다.

ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

