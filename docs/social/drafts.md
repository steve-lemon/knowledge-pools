# Social Drafts

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

## Stage 1 Placeholder: Local Knowledge MVP

Status: planned

Use after Markdown ingestion and source records exist.

```text
Draft after implementation.
```
