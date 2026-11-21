---
permalink:
aliases: [Memorilla, snap-stanford/memorilla]
tags: [ai, agents, agent-memory, rag, research-watch]
publish: false
date created: Monday, November 16th 2026, 10:00 am
date modified: Monday, November 16th 2026, 10:00 am
title: Memorilla - Latent Agent Memory
---

> [!info] Status: WATCH (be aware of; not ready to use)
> Stanford SNAP research that compresses a document collection into a few **learned latent tokens**, which a local Qwen model reads to answer questions. It's an interesting alternative to plain RAG for "why/how" synthesis. It isn't a drop-in memory layer: it needs an 80 GB GPU, the models are tied to Qwen, and exact details can get lost.

## What it is

- Not a knowledge graph or memory database. It's a **learned retrieval and compression method**.
- **Pipeline:** a frozen Qwen3-Embedding-4B encodes documents. A trained cross-attention module reads those embeddings, conditioned on the question, and emits about 16 latent vectors. A frozen Qwen3-8B decodes the answer from them.
- **Training** moves from reconstruction to QA and multitask supervision. A separate agent experiment uses reinforcement learning.
- **Also released:** the PersonalizationV4 benchmark.

```text
docs ──▶ Qwen3-Embedding ──▶ [learned memory reader] ──▶ ~16 latent tokens ──▶ Qwen3-8B ──▶ answer
                                    ▲
                                 question
```

## Maturity (checked Nov 16, 2026)

- About 1.2k stars, actively committed, Apache-2.0 code
- arXiv preprint [2610.21375](https://arxiv.org/html/2610.21375v3), no peer-reviewed venue yet
- Python `MemoryVLLM` exposes `write()` / `answer()`, plus training and eval CLIs and checkpoints
- No MCP server or hosted API
- **Hardware:** inference needs Linux/CUDA and one 80 GB GPU; full training used 4× H100
- The latent tokens only work with the decoder they were trained for. You can't paste them into a Claude or GPT prompt.

## Limits

- **No memory across sessions.** The agent evaluation covers individual TextWorld episodes.
- **Exact details can drop out.** NarrativeQA results suggest better thematic synthesis than retrieval alone, but names and specifics can be lost.
- **Hard to inspect.** You can't read latent memory the way you can read a retrieved passage.

## Compared with other agent-memory approaches

| Approach | What it is | Trade-off |
|---|---|---|
| **Memorilla** | Learned latent compression | Tied to its decoder, heavy GPU needs, hard to inspect |
| [Mem0](https://github.com/mem0ai/mem0) | Extracted conversational memories + retrieval | Easy to integrate; adds derived state |
| [Letta](https://github.com/letta-ai/letta) / [MemGPT](https://arxiv.org/abs/2310.08560) | Stateful agent runtime that manages its own context | Commits you to a whole runtime |
| [Zep / Graphiti](https://github.com/getzep/graphiti) | Temporal entity/fact graph | Explicit relationships and history; graph and LLM overhead |
| Markdown RAG | Retrieval over your own files | Inspectable, works with any model; weakest automatic synthesis |

## Possible use case: narrative recall

It might help connect recurring themes, motivations and callbacks across a series of video or story transcripts. This is speculative. Nothing shows it keeps a story consistent across many sources, so keep source citations, chronology and human-written story notes as the source of truth.

**Worth trying when:** plain Markdown RAG measurably fails at cross-source recall, an affordable large GPU is available, and you can run it as a sidecar that preserves citations. Compare thematic recall, entity accuracy, chronology and cost on public transcripts.

## Sources

- [Repository / README](https://github.com/snap-stanford/memorilla)
- [Paper (arXiv 2610.21375)](https://arxiv.org/html/2610.21375v3)
- [Training docs](https://github.com/snap-stanford/memorilla/blob/main/docs/training.md) · [Evaluation docs](https://github.com/snap-stanford/memorilla/blob/main/docs/evaluation.md)
- [Community report on porting to other hardware (unverified)](https://www.reddit.com/r/LocalLLaMA/comments/1xtfle1/training_memorilla_on_strix_halo_for_gemma4/)

Related: [[Jev - Fast Decision Model for Agents]] · [[Awesome AI]]
