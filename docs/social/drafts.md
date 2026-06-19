# Social Drafts

This file stores existing draft material.

New stage-specific drafts should be added only when explicitly requested.

## Stage 0: Foundation

Status: draft

Related commit: `48ee95b`

Related docs:

- `README.md`
- `docs/vision.md`
- `docs/architecture/overview.md`
- `docs/architecture/agents.md`
- `docs/architecture/knowledge-model.md`
- `docs/social/stage-0-problem-approach.md`

### Problem and Approach Post

```text
RAG is useful, but I do not think chunk retrieval is enough for long-running knowledge work.

The hard questions are not only:

"Which paragraph is similar to my question?"

They are:

- Why did we make this decision?
- Which source supports this claim?
- Is this still true?
- What changed since the last version?
- Which assumptions conflict?
- What should the agent remember next time?

So I am starting Knowledge Pools as an agent-oriented knowledge repository.

The goal is to preserve and connect:

- sources
- claims
- decisions
- concepts
- procedures
- open questions
- evidence links

The loop I am designing around:

ingest -> understand -> connect -> retrieve -> reason -> verify -> update

First step: define the problem clearly before building the machinery.
```

### Korean Problem and Approach Post

```text
RAG는 유용하지만, 장기적인 지식 작업에는 chunk 검색만으로 부족하다고 봅니다.

진짜 어려운 질문은 단순히 "내 질문과 비슷한 문단이 어디 있지?"가 아닙니다.

오히려 이런 질문에 가깝습니다.

- 왜 이 결정을 했는가?
- 어떤 근거가 이 주장을 뒷받침하는가?
- 이 지식은 아직 유효한가?
- 이전 버전 이후 무엇이 바뀌었는가?
- 서로 충돌하는 가정은 무엇인가?
- 다음 작업을 위해 에이전트가 무엇을 기억해야 하는가?

그래서 Knowledge Pools를 에이전트 기반 지식 저장소로 설계하려고 합니다.

목표는 chunk만 저장하는 것이 아니라 다음을 보존하고 연결하는 것입니다.

- source
- claim
- decision
- concept
- procedure
- open question
- evidence link

핵심 루프는 다음과 같습니다.

ingest -> understand -> connect -> retrieve -> reason -> verify -> update

첫 단계는 구현보다 먼저, 문제와 접근법을 정확히 정의하는 것입니다.
```

### Short Post

```text
Starting a new project: Knowledge Pools.

The idea is to build an agent-oriented knowledge repository that goes beyond basic RAG.

Most RAG systems retrieve chunks. Useful, but limited.

For long-running work, I want the system to preserve:

- claims
- decisions
- evidence
- contradictions
- freshness
- open questions

The first commit is mostly documentation because the system should remember not only what it does, but why it exists.
```

### Technical Post

```text
I am starting Knowledge Pools as a build-in-public experiment around agent memory and retrieval.

The core loop I am designing around:

ingest -> understand -> connect -> retrieve -> reason -> verify -> update

The bet:

The durable unit of knowledge is not always a document chunk.

Often it is a claim, decision, procedure, concept, or unresolved question, connected back to source evidence.

The initial repository now has:

- vision
- architecture overview
- agent roles
- knowledge model
- RAG limitation notes
- roadmap
- decision log

Next step: local Markdown ingestion and source-preserving retrieval.
```

### Korean Post

```text
새 프로젝트를 시작합니다: Knowledge Pools.

목표는 단순한 벡터 DB + RAG가 아니라, 에이전트가 장기적으로 사용할 수 있는 지식 저장소를 만드는 것입니다.

일반적인 RAG는 chunk를 잘 찾지만, 다음 문제에 약합니다.

- 왜 그런 결정을 했는지
- 어떤 근거가 있는지
- 오래된 지식인지 최신 지식인지
- 서로 충돌하는 내용은 무엇인지
- 다음에 다시 써먹을 수 있는 지식은 무엇인지

그래서 첫 커밋은 코드가 아니라 문서 중심으로 시작했습니다.

지식 시스템이라면, 시스템 자신도 "왜 이렇게 설계됐는지" 기억해야 하니까요.
```

## Stage 1: Ingest Architecture Baseline

Status: draft

Related commits:

- `9021829` Add media concept proofs
- `72dfd8b` Define preview artifacts for media ingest
- `b37580c` Define index identifier policy
- `2527471` Clarify ingest and understand boundary
- `91a7fb4` Add stage transition boundary guidelines

Related docs:

- `docs/architecture/ingest-taxonomy-graph.md`
- `docs/architecture/media-ingest-strategies.md`
- `docs/architecture/media-concept-proofs.md`
- `docs/architecture/index-content-policy.md`
- `docs/architecture/index-id-policy.md`
- `docs/architecture/ingest-understand-boundary.md`
- `docs/operations/stage-transition-guidelines.md`
- `docs/social/stage-1-ingest-baseline.md`

### Korean Ingest Baseline Post

```text
Knowledge Pools의 ingest 단계 설계를 정리했습니다.

이번 단계에서 가장 중요했던 결론:

ingest는 단순 파일 업로드나 chunking이 아닙니다.

원본 source를 보존하고,
큰 문서를 access unit으로 나누고,
media별 preview artifact를 만들고,
OpenSearch에는 원문이 아니라 locator와 metadata만 저장하고,
다음 단계인 understand로 넘길 handoff를 명확히 하는 단계입니다.

경계는 이렇게 잡았습니다.

ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence

좋은 RAG/agent memory는 검색 이전에,
source와 evidence를 잃지 않는 ingest에서 시작된다고 봅니다.
```

### Longer Korean Ingest Baseline Post

```text
Knowledge Pools의 첫 번째 핵심 단계인 ingest 설계를 정리했습니다.

여기서 중요한 결론은 하나였습니다.

ingest는 단순히 파일을 업로드하고 chunk로 나누는 단계가 아닙니다.

장기적으로 신뢰할 수 있는 지식 시스템을 만들려면 ingest는 다음을 보장해야 합니다.

- 원본 source 보존
- source version과 content hash
- 큰 문서를 다시 찾아갈 수 있는 access unit
- 이미지, PDF, 오디오, 동영상, Markdown별 media strategy
- thumbnail, summary, waveform, poster frame 같은 preview artifact
- OpenSearch에는 원문이 아니라 locator와 metadata만 저장
- deterministic index ID
- understand 단계와의 명확한 경계

이번에 정리한 경계는 이렇게 잡았습니다.

ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence

즉 ingest는 "이해"하는 단계가 아니라,
나중에 정확히 이해할 수 있도록 source를 잃지 않고 준비하는 단계입니다.

RAG가 단순 chunk retrieval을 넘어가려면,
가장 먼저 source와 evidence를 다루는 입구부터 단단해야 한다고 봅니다.
```

### English Ingest Baseline Post

```text
I finished the ingest architecture baseline for Knowledge Pools.

The main lesson:

ingest is not just file upload or chunking.

For a durable agent-oriented knowledge repository, ingest has to preserve source evidence before the system tries to understand it.

The current boundary:

ingest = preserve, normalize, segment, locate, classify, propose
understand = interpret, extract knowledge units, align evidence

Ingest now covers:

- source object storage
- source versions and content hashes
- manifests and access units
- media-specific strategies for Markdown, images, WAV, MP4, and PDF
- preview artifacts like thumbnails, summaries, waveform previews, and poster frames
- content-minimal OpenSearch projections
- deterministic index IDs
- explicit handoff to the understand stage

The index should help find the source.
It should not become the source.

This feels like the first important boundary: before building smarter agents, make sure the system never loses the evidence.
```

## Stage 2: Understand Architecture Baseline

Status: draft

Related commits:

- `b81ec4c` Clarify source and task understanding
- `1a11b2e` Define understanding agent spec
- `44773f2` Add media understand concept proofs
- `754a00c` Define ingest to understand handoff
- `25a5587` Define agent superclass contract
- `4a9bf84` Add understand readiness review

Related docs:

- `docs/architecture/understand-baseline.md`
- `docs/architecture/understand-vs-task-understanding.md`
- `docs/agents/understanding-agent.md`
- `docs/architecture/media-understand-concept-proofs.md`
- `docs/architecture/ingest-understand-handoff.md`
- `docs/architecture/agent-superclass-contract.md`
- `docs/architecture/understand-readiness-review.md`
- `docs/social/stage-2-understand-baseline.md`

### Korean Understand Baseline Post

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

### Longer Korean Understand Baseline Post

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

### English Understand Baseline Post

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

The system can say:

"this passage appears to express a claim"

But it should not say:

"this is now permanent truth"

To move beyond basic RAG, I think we need this middle layer between chunks and durable knowledge.
```

## Stage 3: Connect Architecture Baseline

Status: draft

Related commits:

- `5f86666` Define connect stage baseline
- `1612140` Clarify connect stage purpose
- `fca1052` Add media connect concept proofs
- `36a92f9` Clarify candidate and proposal terminology
- `e9a80a3` Add connect readiness review

Related docs:

- `docs/architecture/connect-baseline.md`
- `docs/architecture/understand-connect-boundary.md`
- `docs/architecture/understand-connect-handoff.md`
- `docs/architecture/media-connect-concept-proofs.md`
- `docs/architecture/connect-readiness-review.md`
- `docs/agents/connection-agent.md`
- `docs/architecture/terminology.md`
- `docs/social/stage-3-connect-baseline.md`

### Korean Connect Baseline Post

```text
Knowledge Pools의 connect 단계 설계를 정리했습니다.

이번 결론:

connect는 graph 저장 단계가 아닙니다.
관계를 확정하는 단계도 아닙니다.

understand가 만든 knowledge candidate를 기존 record/candidate/source와 비교해서
다음 관계를 "제안"합니다.

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

출력은 durable graph edge가 아니라 RelationshipProposal입니다.

즉 graph-aware이지만 graph-mutating은 아닙니다.

RAG가 chunk 검색을 넘어가려면,
후보 지식 사이의 관계를 바로 확정하지 말고
검증 가능한 proposal로 먼저 다뤄야 한다고 봅니다.
```

### Longer Korean Connect Baseline Post

```text
Knowledge Pools의 connect 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

connect는 graph 저장 단계가 아닙니다.
그리고 관계를 "확정"하는 단계도 아닙니다.

understand가 source unit에서 claim, decision, concept 같은 지식 후보를 만든다면,
connect는 그 후보가 기존 지식과 어떤 관계일 수 있는지 제안합니다.

예를 들면:

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

중요한 점은 이 출력이 durable graph edge가 아니라
RelationshipProposal이라는 것입니다.

즉 "이 후보는 저 기록을 support하는 것 같다"라고 말할 수는 있지만,
"이 관계는 확정됐다"라고 말하지는 않습니다.

이번 경계는 이렇게 잡았습니다.

understand = interpret, extract knowledge units, align evidence
connect = relate candidates to existing records and graph context
verify = check whether proposed relationships and claims are supported

좋은 agent memory는 graph를 자동으로 오염시키지 않고,
먼저 evidence-grounded relationship proposal을 만든 뒤
verify와 curate를 거쳐야 한다고 봅니다.
```

### English Connect Baseline Post

```text
I finished the connect architecture baseline for Knowledge Pools.

The main lesson:

connect is not graph storage.
It is not relationship acceptance either.

If understand turns source units into knowledge candidates, connect proposes how those candidates may relate to existing knowledge:

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

The output is not a durable graph edge.
It is a RelationshipProposal.

To move beyond basic RAG, I think we need a proposal layer between extracted candidates and durable graph memory.
```

## Stage 5: Retrieve Architecture Baseline

Status: draft

Related commits:

- `8f9a18e` Define retrieve stage baseline
- `1a0996e` Clarify retrieve stage purpose
- `5a59ad9` Add media retrieve concept proofs
- `475c6aa` Add retrieve readiness review

Related docs:

- `docs/architecture/retrieve-baseline.md`
- `docs/architecture/retrieve-reason-handoff.md`
- `docs/architecture/media-retrieve-concept-proofs.md`
- `docs/architecture/retrieve-readiness-review.md`
- `docs/agents/retrieval-agent.md`
- `docs/social/stage-5-retrieve-baseline.md`

### Korean Retrieve Baseline Post

```text
Knowledge Pools의 retrieve 단계 설계를 정리했습니다.

이번 결론:

retrieve는 단순 검색이 아닙니다.
답변 생성도 아닙니다.

search hit는 아직 evidence가 아닙니다.

retrieve는 검색 후보를 source/version/access unit까지 resolve하고,
필요한 부분만 bounded fetch해서,
EvidenceBundle로 패키징하는 단계입니다.

Markdown이면 section,
image면 region,
audio면 transcript span,
video면 scene/frame range,
PDF면 page/block처럼
미디어마다 evidence locator가 달라집니다.

좋은 RAG/agent memory는 "가까운 chunk"가 아니라
"감사 가능한 evidence bundle"을 넘겨야 한다고 봅니다.
```

## Stage 6: Reason Architecture Baseline

Status: draft

Related commits:

- `ad948f4` Define reason stage baseline
- `11296ac` Clarify reason stage purpose
- `8ec7645` Add media reason concept proofs
- `d99ddc1` Add reason readiness review

Related docs:

- `docs/architecture/reason-baseline.md`
- `docs/architecture/reason-verify-handoff.md`
- `docs/architecture/media-reason-concept-proofs.md`
- `docs/architecture/reason-readiness-review.md`
- `docs/agents/reasoning-agent.md`
- `docs/social/stage-6-reason-baseline.md`

### Korean Reason Baseline Post

```text
Knowledge Pools의 reason 단계 설계를 정리했습니다.

이번 결론:

reason은 verification이 아닙니다.
답변이 유창하다고 해서 truth가 되는 것도 아닙니다.

reason은 EvidenceBundle을 바탕으로
DraftAnswer 또는 ProposedAction을 만드는 단계입니다.

모든 factual claim은 evidence ref를 가져야 하고,
근거가 부족하면 assumption 또는 unknown으로 표시해야 합니다.

retrieve
-> evidence bundle
-> reason
-> cited draft
-> verify

즉 reason의 출력은 최종 답이 아니라
verify가 감사할 수 있는 draft입니다.

좋은 agent memory는 "그럴듯한 답변"보다
"검증 가능한 초안"을 먼저 만들어야 한다고 봅니다.
```
