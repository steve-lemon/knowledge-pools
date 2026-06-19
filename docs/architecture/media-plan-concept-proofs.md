# Media Plan Concept Proofs

This document proves how the `plan` stage can work across different media types.

Ingest makes media addressable.

Understand makes media meaningful.

Connect makes media relational.

Plan decides what evidence is needed for a user or workflow request before retrieval starts.

## Core Rule

Media-specific planning must still produce the same shared planning contract.

```text
user request + task context
  -> Retrieval Planner
  -> RetrievalPlan
  -> PlanToRetrieveHandoff
```

The output is not evidence.

The output is a retrieval strategy that tells `retrieve` where to search, what evidence to gather, and what constraints to preserve.

## Shared Planning Dimensions

All media types should map to the same v1 planning dimensions when possible:

| Planning dimension | Meaning |
| --- | --- |
| `task_intent` | What the user wants to accomplish |
| `answer_shape` | Expected output form, such as explanation, list, audit, comparison, or summary |
| `required_evidence_types` | Evidence needed before reasoning |
| `freshness_scope` | `latest`, `stable`, `historical`, or `any` |
| `conflict_search_required` | Whether opposing or superseded evidence must be searched |
| `retrieval_steps` | Ordered search actions that retrieve should execute |
| `retrieval_budget` | Limits for search breadth, evidence refs, or media-heavy fetches |
| `blocked_modes` | Retrieval paths that are too expensive, unsupported, or unsafe for this request |

Media-specific details should live in retrieval step filters, source/access-unit hints, evidence types, and budgets.

## Media Planning Matrix

| Media | Strong planning targets | Risky planning targets |
| --- | --- | --- |
| Markdown/text | section lookup, keyword search, wiki link traversal, decision recall, source audit | treating summaries as source evidence |
| Image | OCR span lookup, region lookup, thumbnail/standard rendition selection, visual review requests | broad visual inference without requesting exact region evidence |
| WAV/audio | transcript span lookup, timestamp retrieval, speaker-turn search, bounded clip fetch | speaker identity, music meaning, full lyric-like extraction |
| MP4/video | subtitle lookup, transcript search, keyframe/storyboard lookup, scene/time range retrieval | gesture-only intent, excessive full-video retrieval |
| PDF | page/section lookup, table/figure search, citation lookup, page thumbnail selection | table interpretation without page evidence, citation meaning without surrounding text |

## Proof 1: Markdown/Text

### User Request

```text
Why did we decide that OpenSearch should not store full source text?
```

### Expected Task Understanding

```json
{
  "intent": "decision_recall",
  "answer_shape": "short_explanation_with_evidence",
  "freshness_scope": "stable",
  "requires_conflict_search": true
}
```

### Required Evidence Types

- `decision_candidate`;
- `claim_candidate`;
- `architecture_doc`;
- `decision_record`;
- exact Markdown section refs.

### Expected RetrievalPlan

```json
{
  "plan_type": "decision_recall",
  "required_evidence_types": [
    "decision_candidate",
    "architecture_doc",
    "decision_record"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "OpenSearch full source text retrieval projections",
      "target_indexes": ["knowledge_candidate", "source", "decision"]
    },
    {
      "mode": "record_search",
      "record_kinds": ["decision", "claim"],
      "filters": {
        "topic": "opensearch"
      }
    },
    {
      "mode": "graph_query",
      "relation_types": ["supports", "supersedes", "contradicts"],
      "optional": true
    }
  ],
  "constraints": {
    "max_evidence_refs": 8,
    "prefer_current": true
  }
}
```

### Validation

Plan is valid when:

- it asks for exact Markdown section refs;
- it requests decision/claim evidence, not only keyword hits;
- it requests conflict search because the user asks "why did we decide";
- it does not fetch the Markdown body itself.

## Proof 2: Image

### User Request

```text
Find the diagram that shows the ingest to connect pipeline and explain what evidence should be inspected.
```

### Expected Task Understanding

```json
{
  "intent": "source_audit",
  "answer_shape": "evidence_inspection_plan",
  "freshness_scope": "any",
  "requires_conflict_search": false
}
```

### Required Evidence Types

- `image_region`;
- `ocr_span`;
- `preview_thumbnail`;
- `standard_rendition`;
- visual review refs when region meaning is inferred.

### Expected RetrievalPlan

```json
{
  "plan_type": "source_audit",
  "required_evidence_types": [
    "image_region",
    "ocr_span",
    "standard_rendition"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "ingest understand connect pipeline",
      "target_indexes": ["access_unit", "knowledge_candidate"]
    },
    {
      "mode": "source_lookup",
      "media_types": ["image/png", "image/jpeg"],
      "required_access_unit_kinds": ["ocr_span", "image_region"]
    },
    {
      "mode": "preview_lookup",
      "preview_kinds": ["thumbnail", "standard_rendition"]
    }
  ],
  "constraints": {
    "max_evidence_refs": 6,
    "require_region_refs": true,
    "requires_visual_review_for_inference": true
  }
}
```

### Validation

Plan is valid when:

- it requests OCR and region refs separately;
- it asks for a standard rendition for inspection;
- it treats diagram interpretation as reviewable when layout or arrows matter;
- it does not rely on thumbnail evidence for final grounding.

## Proof 3: WAV/Audio

### User Request

```text
Which meeting audio mentions the OpenSearch indexing decision?
```

### Expected Task Understanding

```json
{
  "intent": "source_lookup",
  "answer_shape": "timestamped_source_list",
  "freshness_scope": "stable",
  "requires_conflict_search": false
}
```

### Required Evidence Types

- `transcript_span`;
- `time_range`;
- `source_record`;
- optional low-bitrate clip ref for review.

### Expected RetrievalPlan

```json
{
  "plan_type": "source_lookup",
  "required_evidence_types": [
    "transcript_span",
    "time_range",
    "source_record"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "OpenSearch indexing decision retrieval projections",
      "target_indexes": ["access_unit", "knowledge_candidate"],
      "filters": {
        "media_hint": "wav"
      }
    },
    {
      "mode": "source_lookup",
      "required_access_unit_kinds": ["transcript_span"],
      "include_time_ranges": true
    }
  ],
  "constraints": {
    "max_evidence_refs": 5,
    "do_not_fetch_full_audio": true,
    "allow_bounded_clip_refs": true
  }
}
```

### Validation

Plan is valid when:

- it asks for transcript spans with timestamps;
- it does not request full audio fetch by default;
- it preserves source/time-range refs for later evidence retrieval;
- it avoids speaker identity unless the request explicitly needs it and evidence exists.

## Proof 4: MP4/Video

### User Request

```text
Find the video segment that demonstrates the upload workflow.
```

### Expected Task Understanding

```json
{
  "intent": "source_lookup",
  "answer_shape": "timestamped_segment_list",
  "freshness_scope": "any",
  "requires_conflict_search": false
}
```

### Required Evidence Types

- `subtitle_span`;
- `transcript_span`;
- `keyframe`;
- `scene_segment`;
- optional low-bitrate proxy ref.

### Expected RetrievalPlan

```json
{
  "plan_type": "source_lookup",
  "required_evidence_types": [
    "subtitle_span",
    "scene_segment",
    "keyframe"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "upload workflow demo",
      "target_indexes": ["access_unit", "knowledge_candidate"],
      "filters": {
        "media_hint": "mp4"
      }
    },
    {
      "mode": "source_lookup",
      "required_access_unit_kinds": ["subtitle_span", "scene_segment", "keyframe"],
      "include_time_ranges": true
    },
    {
      "mode": "preview_lookup",
      "preview_kinds": ["poster_frame", "storyboard", "low_bitrate_proxy"]
    }
  ],
  "constraints": {
    "max_evidence_refs": 8,
    "do_not_fetch_full_video": true,
    "prefer_subtitles_over_visual_only_inference": true
  }
}
```

### Validation

Plan is valid when:

- it requests time-bounded segment refs;
- it prefers subtitles/transcripts when available;
- it includes keyframes or storyboard refs for inspection;
- it avoids full-video retrieval unless explicitly requested.

## Proof 5: PDF

### User Request

```text
Which PDF section defines the retention policy, and are there conflicting statements?
```

### Expected Task Understanding

```json
{
  "intent": "conflict_check",
  "answer_shape": "section_summary_with_conflicts",
  "freshness_scope": "latest",
  "requires_conflict_search": true
}
```

### Required Evidence Types

- `pdf_page`;
- `pdf_section`;
- `table_region`;
- `citation_ref`;
- `policy_claim_candidate`;
- current source version refs.

### Expected RetrievalPlan

```json
{
  "plan_type": "conflict_check",
  "required_evidence_types": [
    "pdf_section",
    "pdf_page",
    "policy_claim_candidate",
    "citation_ref"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "retention policy delete archive purge",
      "target_indexes": ["access_unit", "knowledge_candidate", "source"],
      "filters": {
        "media_hint": "pdf",
        "is_current": true
      }
    },
    {
      "mode": "record_search",
      "record_kinds": ["claim", "decision", "constraint"],
      "filters": {
        "topic": "retention policy"
      }
    },
    {
      "mode": "graph_query",
      "relation_types": ["contradicts", "supersedes"],
      "required": true
    }
  ],
  "constraints": {
    "max_evidence_refs": 10,
    "require_page_refs": true,
    "prefer_current": true
  }
}
```

### Validation

Plan is valid when:

- it requests page/section refs, not only PDF title hits;
- it asks for current source versions;
- it requires conflict and supersession search;
- it preserves table/citation needs when policy text depends on them.

## Cross-Media Validation Checklist

A media-aware `RetrievalPlan` is valid only if:

- it states the task intent;
- it states the answer shape;
- it states the freshness scope;
- it lists required evidence types;
- it includes media-specific access-unit needs;
- it includes retrieval budget or bounded fetch rules for heavy media;
- it preserves exact evidence refs that `retrieve` must fetch later;
- it marks conflict search explicitly;
- it avoids treating previews, summaries, thumbnails, or transcripts as source truth without pointing back to source units.

## Design Rule

Plan is media-aware, but not media-consuming.

It chooses evidence requirements and retrieval paths.

Retrieve fetches evidence.
