---
permalink:
aliases: [AI Software Factory, Solo Dev DevSecOps with Agents]
tags: [devops, devsecops, ci-cd, ai-coding, obsidian-plugins, supply-chain]
publish: false
date created: Monday, November 16th 2026, 10:00 am
date modified: Monday, November 16th 2026, 10:00 am
title: Software Factory for AI-Written Code
---

> [!summary] Gates beat prose
> When agents write most of your code, trust comes from **deterministic gates**: types, linters, required tests, pinned dependencies. Instructions and human review matter less. A common failure for solo devs is having tests that **aren't required** to pass before a merge or release.

## Thesis: "All Code Is Slop (Except Mine)"

From Lauren Tan's talk at [AI Engineer 2026](https://ai.engineer/code/2026/talks/lauren-tan), sources of trust in agent-written code, strongest first:

1. Codebase design and static analysis
2. Verification
3. Prose instructions and human review (weakest)

Practical rules:
- **Correct the same mistake twice? Make it a check.** Add a lint rule, type, or test, not another paragraph in `AGENTS.md` / `CLAUDE.md`.
- **Agents copy existing patterns.** Cleaning up the codebase improves everything generated afterward.

## First principles

1. Optimize the whole lifecycle, not just CI.
2. Define success before generating code, with acceptance examples the owner approves.
3. Make unsafe choices hard: types, linters, executable invariants.
4. Constrain agents: no release secrets or publish rights while they're generating code.
5. Keep changes small enough to review.
6. **Verify the verifier:** a test must fail when the behavior breaks.
7. Every dependency is a security decision: pin it, keep it updated, scope its tokens.
8. Release traceable artifacts with provenance or attestation.
9. Budget time for maintenance.

## Common gaps (solo dev checklist)

- [ ] CI checks **required** on the default branch (branch protection or rulesets)
- [ ] No permanently red workflows. A failing check nobody reads trains you to ignore all of them.
- [ ] Automated dependency updates (Dependabot / Renovate)
- [ ] GitHub Actions **pinned by SHA**; explicit least-privilege `permissions:`
- [ ] Extra review for any `pull_request_target` workflow
- [ ] Every local lint/test command also runs in CI
- [ ] Reproducible toolchains: no `version: latest`, one lockfile per package manager
- [ ] Split very large modules; agents struggle with files over ~5k lines
- [ ] `SECURITY.md`, `LICENSE`, and optionally `CODEOWNERS`
- [ ] **Self-hosted runners only for private repos.** Public-repo PRs on a self-hosted runner let strangers run code on your machine.

## Obsidian plugin quality bar

- **Lint:** [`eslint-plugin-obsidianmd`](https://github.com/obsidianmd/eslint-plugin) recommended config with typed linting. Run `eslint .` over the whole repo so the manifest and license checks run too.
- **TypeScript:** `strict` plus `noUncheckedIndexedAccess`.
- **Release:** the git tag matches the `manifest.json` version. The official [GitHub Actions release guide](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions) adds `actions/attest` for `main.js`, `manifest.json` and `styles.css`.
- **Exemplar:** Obsidian Tasks' [verify workflow](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/.github/workflows/verify.yml) runs strict scanner-lint plus a nightly verify.
- Follow the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).

## Runner placement

- **Public repos and light jobs:** GitHub-hosted runners, free for public repos.
- **Heavy private builds:** self-hosted, ephemeral, rootless containers with a resource cap. Don't over-commit RAM on a machine you also do agent work on.
- **Move runners off the workstation** once swap pressure becomes chronic. A small always-on box (N100-class, 16 GB) is a good target. Never give runners the NAS's Docker socket.

## Sources

- [DoD DevSecOps: State of](https://dodcio.defense.gov/Portals/0/Documents/Library/DevSecOpsStateOf.pdf)
- [Thoughtworks: Where does the rigor go?](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/where-does-the-rigor-go)
- [Google code review guide](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
- [OpenSSF Scorecard](https://scorecard.dev/) · [OpenSSF Best Practices](https://www.bestpractices.dev/en/criteria/0)
- [SLSA levels](https://slsa.dev/spec/v1.1/levels)

Related: [[Claude-AI coding tools governance challenges]] · [[📁 21 - Development]]
