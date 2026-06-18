# Stage 2: Understand Architecture Baseline

This is the third public-facing narrative for Knowledge Pools.

Use this document after the `understand` architecture has been clarified but before claiming an end-to-end working knowledge graph.

## Core Thesis

Understand is not answer generation.

For an agent-oriented knowledge repository, understand is the stage where source access units become evidence-grounded knowledge candidates.

The system should not jump from chunk retrieval to durable memory.

It should first produce inspectable candidates:

- claims;
- decisions;
- concepts;
- procedures;
- questions;
- constraints;
- bounded summaries.

## What Changed

The project now has a clearer understand baseline:

- source/document understanding is separated from user-question understanding;
- the Understanding Agent spec is defined;
- media-specific understand concept proofs are documented;
- `IngestToUnderstandHandoff` defines the input contract from ingest;
- the shared agent superclass contract defines typed task, artifact, result, and handoff shapes;
- understand readiness checks define quality gates before moving to connect;
- outputs stay candidate-level until later stages verify and curate them.

The important boundary is:

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
connect = relate candidates to existing records and graph context
```

## Why This Matters

Basic RAG often treats the retrieved chunk as enough context for an answer.

That is useful, but it leaves important questions unresolved:

- Which exact claim did this source make?
- Is this a decision, a concept, a constraint, or just a summary?
- Which source unit supports the candidate?
- Was this candidate inferred from weak evidence?
- Does this need human review before becoming durable memory?
- Can another agent later connect, verify, or reject it?

Understand creates the structured middle layer needed to answer those questions.

## Design Moves

### 1. Candidate Output Only

Understand emits candidates, not durable truth.

It can say:

> this passage appears to express a claim

It should not say:

> this is now permanent knowledge

### 2. Evidence Refs Are Required

Every candidate must keep source evidence.

At minimum:

- source id;
- source version id;
- access unit refs;
- source manifest ref;
- taxonomy refs;
- extraction or generator metadata.

### 3. Deterministic First

V1 starts with structural extraction:

- headings;
- explicit decisions;
- open questions;
- ordered procedures;
- glossary-like definitions;
- requirement words such as `must`, `should`, and `cannot`.

Model-assisted extraction can come later, but the deterministic path must work first.

### 4. Media Still Uses One Candidate Contract

Markdown, image, audio, video, and PDF can produce different evidence locators.

But they should still map to the same candidate contract when possible.

Examples:

- Markdown heading -> `concept_candidate`
- OCR text -> `claim_candidate`
- transcript span -> `decision_candidate`
- PDF table cell -> `claim_candidate`
- video subtitle span -> `procedure_candidate`

### 5. Quality Gate Before Connect

Understand should hand off to `connect` only when:

- schemas validate;
- evidence refs resolve;
- unresolved ref count is zero;
- review-required candidates are marked;
- quality report exists;
- outputs remain candidate-level.

## First Public Message

The third share should not claim the system has complete reasoning or verification.

It should say:

> I finished the understand architecture baseline. The important lesson is that understanding should produce evidence-grounded candidates, not answers or durable memory.

## Suggested Korean Summary

```text
Knowledge Pools의 understand 단계 설계를 정리했습니다.

이번 단계에서 가장 중요한 결론은 이것입니다.

understand는 답변 생성이 아닙니다.
그리고 durable memory를 바로 쓰는 단계도 아닙니다.

ingest가 source를 보존하고,
access unit으로 나누고,
정확히 다시 찾아갈 수 있게 만든다면,

understand는 그 source unit 안에 어떤 지식 후보가 있는지 구조화합니다.

예를 들면:

- claim candidate
- decision candidate
- concept candidate
- procedure candidate
- question candidate
- constraint candidate
- bounded summary candidate

중요한 점은 모든 후보가 evidence ref를 가져야 한다는 것입니다.

즉 "이런 의미가 있어 보인다"라고 말할 수는 있지만,
"이것이 영구적인 진실이다"라고 말하지는 않습니다.

이번에 정리한 경계는 다음과 같습니다.

ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence
connect = relate candidates to existing records and graph context

좋은 agent memory는 chunk를 곧바로 지식으로 믿지 않고,
source-grounded candidate를 만든 뒤,
connect, verify, curate 단계를 거쳐야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 understand 단계 설계를 정리했습니다.

이번 결론:

understand는 답변 생성이 아닙니다.
durable memory를 바로 쓰는 단계도 아닙니다.

ingest가 source를 보존하고 찾아갈 수 있게 만든다면,
understand는 그 source unit에서 다음과 같은 지식 후보를 만듭니다.

- claim
- decision
- concept
- procedure
- question
- constraint
- bounded summary

단, 모든 후보는 evidence ref를 가져야 합니다.

즉 이 단계의 출력은 "진실"이 아니라,
나중에 connect, verify, curate 할 수 있는 source-grounded candidate입니다.

RAG가 chunk 검색을 넘어가려면,
chunk와 durable knowledge 사이에 이 중간층이 필요하다고 봅니다.
```

## Suggested English Post

```text
I finished the understand architecture baseline for Knowledge Pools.

The main lesson:

understand is not answer generation.
It is not durable memory writing either.

If ingest preserves and locates source material, understand turns those source units into evidence-grounded knowledge candidates:

- claim candidates
- decision candidates
- concept candidates
- procedure candidates
- question candidates
- constraint candidates
- bounded summary candidates

Every candidate must keep evidence refs.

So the system can say:

"this passage appears to express a claim"

But it should not say:

"this is now permanent truth"

The current boundary:

ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence
connect = relate candidates to existing records and graph context

To move beyond basic RAG, I think we need this middle layer between chunks and durable knowledge.
```

## Concrete Detail

A minimal candidate shape:

```json
{
  "candidate_id": "kc_claim_ab12cd34_section_003_001",
  "candidate_kind": "claim_candidate",
  "status": "candidate",
  "short_label": "OpenSearch stores retrieval projections",
  "evidence_refs": ["src_path_a91c72#section_003"],
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "taxonomy_version": "0.1.0",
  "confidence": 0.74,
  "requires_review": true
}
```

## Open Question

The useful feedback question:

> When turning source material into structured candidates, where should the line be between deterministic extraction, model-assisted interpretation, and human review?
