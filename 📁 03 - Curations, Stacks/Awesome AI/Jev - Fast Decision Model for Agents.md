---
permalink:
aliases: [Jev, TypeSafe Jev, jev-1.13]
tags: [ai, agents, llm-routing, claude-code, hooks]
publish: false
date created: Monday, November 16th 2026, 9:30 am
date modified: Monday, November 16th 2026, 9:30 am
title: Jev - Fast Decision Model for Agents
---

> [!summary] Jev is a reflex, not a brain
> Jev (by TypeSafe) is a hosted model that doesn't chat or write. You give it some text (the "state") and one or more multiple-choice, scoring, or yes/no questions. In roughly a third of a second it returns calibrated probabilities for each answer. It belongs **inside software** (hooks, routers, triage scripts), not in a chat interface.

## Mental model

```
 ┌──────────────────────────────────────────────┐
 │  INTERFACES     chat apps, IDEs, phones      │  ← Jev doesn't live here
 ├──────────────────────────────────────────────┤
 │  BRAINS         frontier LLMs                │  slow, thoughtful, expensive
 │  (System 2)     think, write, explain        │
 ├──────────────────────────────────────────────┤
 │  REFLEXES       Jev                          │  ← lives here
 │  (System 1)     "which one?" "yes or no?"    │  fast, nearly free
 ├──────────────────────────────────────────────┤
 │  RULES          deterministic policy,        │  always wins
 │                 permission gates             │
 └──────────────────────────────────────────────┘
```

## First principles

1. **Choices, not prose.** If the task ends in "pick one" or "yes/no", Jev fits. If it ends in text or code, use an LLM.
2. **It lives in code.** You call it from a hook or script. Users see better defaults, not Jev.
3. **It suggests; rules decide.** Jev can be confidently wrong and is not explainable. Use it to route, add a confirmation, or flag. Never let it be what makes a security control pass.
4. **Cheap enough for every step.** The vendor reports about $0.0004 per decision, so calling it on every prompt or tool call is affordable in a way frontier LLMs aren't.

## Access

- API: `api.typesafe.ai/v1/systemone`, authenticated with an API key from `console.typesafe.ai`. Official Python and JS SDKs.
- Also listed on OpenRouter as `typesafe/jev-1.13`, but TypeSafe's docs only document the direct route. Going direct also means one fewer company sees your data.
- **Not** a drop-in model for Claude Code or other agent CLIs. TypeSafe ships a Claude Code plugin, but it only teaches agents to *write* Jev code.

## Where it fits in agent harnesses

| Job | Question Jev answers |
|---|---|
| Model / effort routing | "Small edit, research, or hard design?" |
| Skill or tool selection | "Which of these skills applies?" |
| Context and memory filtering | "Which notes matter for this prompt?" |
| Pre-tool risk check | "Does this command look destructive?" (adds a confirmation; never grants) |
| Compaction / completion | "Is this task done?" "Ready to compact?" |
| Error triage | "Quota limit, cooldown, or transient failure?" |

## Prior art (as of Nov 2026)

Experimental and mostly opt-in; often run in **shadow mode**, where Jev only logs what it would have decided.

| Project | What Jev does there |
|---|---|
| [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/docs/HOOKS.md) | Opt-in hooks for skill triggering, model/effort routing, context pruning, completion, memory extraction |
| [hermes-jev-skills](https://github.com/kerpopule/hermes-jev-skills) | Model routing, skill selection, memory filtering, prompt-injection screening |
| [BorisLeMeec/jev](https://github.com/BorisLeMeec/jev) | PreToolUse hook that narrows large file reads |
| [compact-adviser](https://github.com/kunchenguid/compact-adviser) | Decides when to compact |
| [jeffort](https://github.com/vntrungld/jeffort) | Picks reasoning effort per prompt |
| [opencode-jev-plugin](https://github.com/fsodanogm2dev/opencode-jev-plugin) | Reasoning budget, skill pruning, Bash risk check |
| [jev-claude-code-case-study](https://github.com/gsaini/jev-claude-code-case-study) | Bash guard returning deny / ask / no-opinion (never allow) |

### Lessons reported

- **Reduces errors without eliminating them.** TypeSafe's skill-suggestion cookbook cut wrong skill loads from 15.7% to 7.9%, but its suggestions introduced some new errors.
- **Latency adds up.** One file-read hook saved 41% of tokens but added about 1.25 s per read.
- **Prompt cache.** Switching model or effort mid-session can invalidate the prompt cache and eat the savings.
- **Fail-open bugs.** At least one plugin claims to fail closed when Jev errors, but its code lets actions through. If Jev is in a safety path, test the failure mode.

> [!tip] The careful pattern
> Keep deterministic policy in charge, ask Jev only about ambiguous cases, start in shadow mode, measure its picks against your own labeled decisions, and count prompt-cache costs. Nobody has published a complete version of this yet.

## Security and privacy

- Everything you send leaves your machine for TypeSafe. Never send secrets or sensitive content in the state.
- TypeSafe says it doesn't train on customer data. Zero retention is only offered on enterprise plans, and request logging isn't documented.
- Independent benchmarks are thin; most performance numbers are vendor-reported.

## Sources

- [TypeSafe docs: Introduction](https://docs.typesafe.ai/introduction)
- [Quick start](https://docs.typesafe.ai/introduction/quickstart.md)
- [Jev with coding agents](https://docs.typesafe.ai/introduction/coding-agents.md)
- [Confidence routing pattern](https://docs.typesafe.ai/patterns/confidence-routing.md)
- [Skill-suggestion cookbook](https://docs.typesafe.ai/cookbooks/skill_suggestion.md)
- [Legal / data use](https://docs.typesafe.ai/legal.md)
- [Jev (AI model) - Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))

Related: [[Tailscale Aperture - AI Gateway]] · [[Awesome AI]]
