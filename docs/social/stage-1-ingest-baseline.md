# Stage 1: Ingest Architecture Baseline

This is the second public-facing narrative for Knowledge Pools.

Use this document after the ingest architecture has been clarified but before claiming a complete working MVP.

## Core Thesis

Ingest is not just file upload.

For an agent-oriented knowledge repository, ingest is the stage where source material becomes traceable, versioned, media-aware, and ready for later understanding.

## What Changed

The project now has a clearer ingest baseline:

- original sources stay in filesystem-compatible object storage;
- large files are accessed through manifests and access units;
- media types get different strategies;
- previews are stored as derived artifacts, not index content;
- OpenSearch-compatible documents stay content-minimal;
- deterministic IDs use source hashes and media hints;
- ingest and understand have an explicit boundary.

The important boundary is:

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
```

## Why This Matters

Basic RAG often starts by chunking documents and putting embeddings into a database.

That can work for simple retrieval, but it weakens the system when it needs to answer:

- Where did this answer come from?
- Which exact source unit supports it?
- What changed when the source was updated?
- Is this summary evidence or just a preview?
- Did the system parse the source, or did it actually understand it?

The ingest stage needs to preserve those distinctions from the beginning.

## Design Moves

### 1. Source Store Is Ground Truth

Original text, PDFs, images, audio, JSON, and other files are stored as source objects.

The index points back to them. It does not replace them.

### 2. Access Units Make Large Sources Usable

Large or structured sources are broken into retrievable units:

- Markdown sections;
- PDF pages and blocks;
- image regions;
- audio time segments;
- video scenes and keyframes;
- transcript spans;
- JSON paths.

These units let later stages fetch exact evidence without loading an entire source into context.

### 3. Preview Artifacts Help Navigation

Preview data is useful, but it should not become the source of truth.

Examples:

- image thumbnails;
- standard-size image renditions;
- document summaries;
- page thumbnails;
- waveform previews.
- poster frames and storyboards.

The index stores preview refs and metadata, not preview bytes or long generated text.

### 4. Index Documents Are Retrieval Maps

OpenSearch is treated as a retrieval map.

It should store:

- source refs;
- access-unit locators;
- taxonomy metadata;
- preview refs;
- IDs and hashes;
- small labels and descriptors.

It should not store full source content as retrievable index content.

### 5. IDs Need a Policy

The recommended index ID shape is:

```text
kp:{repository_id}:{index_document_type}:{media_hint}:{source_hash_prefix}:{scope}
```

Example:

```text
kp:repo_main:access_unit:pdf:sha256_ab12cd34ef90:page_001_block_003
```

The media hint helps humans and routing, but the authoritative type is still `media_type`.

### 6. Ingest Must Not Pretend To Understand

Ingest may emit shallow candidates from visible structure.

It should not create durable knowledge records.

The next stage, `understand`, is where claims, decisions, concepts, procedures, and questions become explicit knowledge candidates.

## First Public Message

The second share should not claim the system is fully implemented.

It should say:

> I finished the first architecture boundary: ingest. The important lesson is that ingest is not just chunking. It is source preservation, access design, preview generation, ID policy, and a clear handoff to understanding.

## Suggested Korean Summary

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

## Suggested Short Korean Post

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

## Suggested English Post

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

## Open Question

What should belong in ingest, and what should be delayed until understand?

This boundary seems small, but it determines whether the system can remain source-grounded as it grows.
