# Stage 9: Curation Architecture Baseline

This is the tenth public-facing narrative for Knowledge Pools.

Use this document after the `curation` architecture has been clarified but before claiming that evaluation, regression scoring, or automated improvement loops are complete.

## Core Thesis

Curation is the durable memory gate.

For an agent-oriented knowledge repository, curation is the stage where update candidates become governed durable knowledge, lifecycle state, or auditable non-acceptance decisions.

The system should not store something permanently just because an agent proposed it.

The key question is:

```text
Should this proposed change become part of durable knowledge, and under what lifecycle state?
```

## What Changed

The project now has a clearer curation baseline:

- `curation` consumes `UpdateToCurationHandoff`;
- `CurationDecision` is the primary artifact;
- accepted candidates may create durable records;
- weak candidates may be deferred, rejected, or marked `needs_more_evidence`;
- supersession, retraction, quarantine, and tombstone paths are explicit lifecycle decisions;
- Markdown-first curation is the first implementation target;
- media-specific curation concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- curation tool access is reviewed through the curation readiness checklist;
- candidate emission, verification checks, retrieval, source reads, direct index projection writes, and provider-specific memory writes are forbidden.

The important boundary is:

```text
update = propose reusable memory changes
curation = decide what becomes durable
evaluate = measure what happened later
```

## Why This Matters

Basic RAG usually has no durable memory governance.

Naive agent memory often stores too much.

But durable memory should be governed, not accumulated automatically.

Curation provides the decision layer.

It can say:

- accept this candidate;
- edit and accept it;
- defer it;
- reject it;
- ask for more evidence;
- supersede an older record;
- retract a bad record;
- quarantine something suspicious;
- tombstone something that should no longer be active.

The result is not just storage.

It is a durable decision trail.

## Design Moves

### 1. Curation Produces Decisions

Curation emits:

- `CurationDecision`;
- durable records when accepted;
- lifecycle updates when explicitly approved;
- curation quality report;
- `CurationToEvaluateHandoff`;
- trace events.

Every durable write needs a decision.

### 2. No Durable Record Is A Valid Result

Curation may reject, defer, or require more evidence.

That is not failure.

It is memory hygiene.

### 3. Supersession Beats Silent Overwrite

If knowledge changes, the old record should not be silently edited.

Preferred:

```text
new_record --supersedes--> old_record
old_record.status = superseded
```

If the old record was wrong:

```text
corrective_record --retracts--> bad_record
bad_record.status = retracted
```

### 4. Markdown-First Curation Comes First

The first implementation target is Markdown/text:

```text
UpdateCandidate
-> CurationDecision
-> durable Claim/Decision/Procedure/Question
-> CurationToEvaluateHandoff
```

Image, PDF, audio, and video curation should expand only after their verification and review paths are stable.

### 5. Media Curation Is Stricter Than Media Update

Update may propose review-worthy media candidates.

Curation decides whether they deserve durable memory.

Default behavior:

- Markdown: accept concise verified candidates when reusable;
- image: defer or require review unless human/OCR evidence is resolved;
- WAV/audio: needs more evidence or review unless transcript confidence is stable;
- MP4/video: defer or require review unless scene/subtitle/transcript basis is stable;
- PDF: accept only verified text access-unit candidates.

### 6. Tool Permissions Matter

Required curation ports:

- `artifact.read`;
- `schema.validate`;
- `curation.decide`;
- `memory.write`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `memory.update_status`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `review.request`;
- `rollback.create_event`;
- `delete.create_tombstone`.

Forbidden ports:

- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.search`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.read`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- provider-specific memory writes.

## First Public Message

The tenth share should not claim that evaluation is complete.

It should say:

> I finished the curation architecture baseline. The important lesson is that durable memory needs governance, not automatic accumulation.

## Suggested Korean Summary

```text
Knowledge Pools의 curation 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

curation은 durable memory gate입니다.

update가 UpdateCandidate를 만든다면,
curation은 그 후보를 실제 durable knowledge로 승격할지 결정합니다.

흐름은 이렇게 됩니다.

UpdateToCurationHandoff
-> Curation Agent
-> CurationDecision[]
-> durable record 또는 lifecycle update
-> CurationToEvaluateHandoff

중요한 점은
curation이 무조건 저장하는 단계가 아니라는 것입니다.

후보는 다음 중 하나가 될 수 있습니다.

- accept
- edit_and_accept
- defer
- reject
- needs_more_evidence
- supersede
- retract
- quarantine
- tombstone

즉 durable memory는 agent가 제안했다고 바로 만들어지는 것이 아니라,
CurationDecision을 통해 명시적으로 기록되어야 합니다.

Markdown-first MVP에서는 먼저
검증된 Markdown 기반 claim, decision, procedure, question만
durable record로 승격합니다.

image, audio, video, PDF는
각 미디어의 verification/review path가 안정화된 이후 확장합니다.

좋은 agent memory는 많이 저장하는 것이 아니라,
무엇을 왜 저장했는지,
무엇을 왜 거절했는지,
무엇이 현재 지식이고 무엇이 과거 지식인지
추적할 수 있어야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 curation 단계 설계를 정리했습니다.

이번 결론:

curation은 durable memory gate입니다.

update가 UpdateCandidate를 만들면,
curation은 그것을 durable memory로 승격할지 결정합니다.

출력은:

- CurationDecision
- durable record
- lifecycle update
- curation quality report
- CurationToEvaluateHandoff
- trace events

중요한 점:

저장하지 않는 것도 정상 결과입니다.

defer, reject, needs_more_evidence는 실패가 아니라
memory hygiene입니다.

좋은 agent memory는 모든 후보를 저장하는 것이 아니라,
무엇을 왜 저장했고,
무엇을 왜 거절했는지 남겨야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the curation architecture baseline for Knowledge Pools.

The main lesson:

curation is the durable memory gate.

Update proposes memory changes.
Curation decides what becomes durable.

UpdateToCurationHandoff
-> Curation Agent
-> CurationDecision[]
-> durable records or lifecycle updates
-> CurationToEvaluateHandoff

Curation does not have to accept every candidate.

Valid outcomes include:

- accept
- edit and accept
- defer
- reject
- needs more evidence
- supersede
- retract
- quarantine
- tombstone

This matters because naive agent memory stores too much.

Durable memory should be governed, not accumulated automatically.

For the Markdown-first MVP, only verified Markdown/text candidates become durable records.

Media-derived candidates stay conservative until their verification and review paths are stable.

No durable record is also a valid result.

Memory hygiene matters.
```

## Suggested Thread Outline

```text
1. I finished the curation architecture baseline for Knowledge Pools.

2. The key distinction:
   update proposes memory changes.
   curation decides what becomes durable.

3. The flow:
   UpdateCandidate
   -> CurationDecision
   -> durable record or lifecycle update
   -> CurationToEvaluateHandoff

4. Curation outcomes:
   accept, edit, defer, reject, needs_more_evidence, supersede, retract, quarantine, tombstone.

5. Every durable write requires a CurationDecision.

6. No durable record can be the right result.
   Defer/reject is memory hygiene.

7. Tool boundary:
   memory.write is allowed.
   candidate.emit, verification.check, retrieval, source reads, and direct index projection writes are forbidden.

8. Next step:
   evaluate should record whether curation decisions improved or harmed the system.
```

## Repository References

- `docs/architecture/curation-baseline.md`
- `docs/architecture/update-curation-handoff.md`
- `docs/architecture/media-curation-concept-proofs.md`
- `docs/architecture/curation-readiness-review.md`
- `docs/architecture/rollback-and-quarantine.md`
- `docs/architecture/content-deletion-lifecycle.md`
- `docs/agents/curation-agent.md`
- `docs/architecture/terminology.md`
