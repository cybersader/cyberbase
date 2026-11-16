---
permalink:
aliases: [Aperture, Tailscale Aperture]
tags: [ai, ai-gateway, tailscale, self-hosting, privacy]
publish: false
date created: Monday, November 16th 2026, 9:30 am
date modified: Monday, November 16th 2026, 9:30 am
title: Tailscale Aperture - AI Gateway
---

> [!summary] An AI gateway that only your tailnet can reach, run by Tailscale
> Aperture (generally available August 2026) gives a team shared model access with per-person identity, spending caps, and request logging. The catch: it's a **Tailscale-hosted** service, and unlike normal Tailscale traffic, **it processes your prompt and response content**.

## How it's positioned

```
Typical self-hosted setup:
 clients ──tailnet──▶ your own proxy / gateway ──▶ model providers

With Aperture:
 clients ──tailnet──▶ Tailscale-hosted Aperture (sees prompts) ──▶ model providers
```

## Key facts

- **Hosted, tailnet-only.** Only devices on your tailnet can reach it. A self-hosted option isn't confirmed.
- **Content visibility.** Tailscale's privacy policy names Aperture as the exception to "Tailscale can't see your traffic". Zero-retention settings stop storage, not processing.
- **Protocols:** Anthropic Messages, OpenAI Chat and Responses, Gemini, Bedrock. It doesn't translate between them.
- **Upstreams:** provider APIs, OpenRouter, or private endpoints on your tailnet.
- **Verified clients** include Claude Code and Codex.
- **Features:**
  - identity from your tailnet login
  - per-user usage tracking and dollar quotas
  - full request/response capture
  - deny-by-default model and connector grants, plus policy hooks
  - MCP connectors that inject credentials, so users never hold the key
  - Aperture Chat, a browser chat and agent interface
- **Subscription passthrough** forwards each client's own login. It doesn't pool accounts.
- **Usage display** shows cost estimates, not remaining subscription allowance.
- **Personal plan** covers up to 6 people.

## When it fits

| Situation | Fit |
|---|---|
| Team needs per-person AI access, audit logs, and dollar caps without running infrastructure | **Good** |
| Dollar caps on pay-per-use APIs | **Good** |
| Credential brokering for MCP tools | Promising |
| Replacing a self-hosted proxy that pools accounts or translates protocols | **No** |
| Strict "no third party sees prompts" policy | **No.** Hosted processing breaks it |
| Another chat UI when you already have one | Low value |

> [!warning] Threat-model takeaway
> Aperture moves gateway trust from your own hardware to Tailscale. That's a reasonable trade for many teams; Tailscale is already in the network path for coordination. But it's a different trust level from the WireGuard data plane, where Tailscale can't read your traffic. Decide which prompts are allowed through it before you turn it on.

## Sources

- [What is Aperture](https://tailscale.com/docs/aperture/what-is-aperture)
- [GA announcement](https://tailscale.com/blog/aperture-ga)
- [How Aperture works](https://tailscale.com/docs/aperture/how-aperture-works)
- [Supported providers and clients](https://tailscale.com/docs/aperture/reference/supported-providers-clients)
- [Passthrough mode](https://tailscale.com/docs/aperture/how-to/use-passthrough-mode)
- [Privacy and data retention](https://tailscale.com/docs/aperture/privacy-and-data-retention)
- [Tailscale privacy policy](https://tailscale.com/privacy-policy)

Related: [[Jev - Fast Decision Model for Agents]] · [[Awesome AI]]
