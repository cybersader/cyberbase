# cybersader.com cutover sheet

Instance notes for moving this vault's site from Obsidian Publish to the Cyberbaser site. Kept in `.cyberbaser/`, which is not published. General method: https://cybersader.github.io/cyberbaser/development/moving-off-obsidian-publish/

Prepared 2026-11-17 at the owner's request. Planning only: no DNS, Pages, Publish or live change has been made. The switch itself needs a separate owner yes.

## Old URL mapping

The old URL list comes from three live Publish sources, read once: its `sitemap.xml` (1,417 URLs), its file index (1,417 notes, 1,212 attachments) and the six `permalink:` values. Publish serves every path as a single-page app and resolves notes case-insensitively, so any capitalization or `+`/`%20` spelling of a note path works today.

Mapped against the vault at `0cc579a` and a full Quartz build of it with the current renderer:

| Result | Notes | What happens after the switch |
|---|---|---|
| On the new site | **920** | Old URL redirects to the note's new URL |
| Deliberately not public any more | **497** | Old URL shows "This note was published on the old site but is no longer public" (HTTP 404) |
| Unresolved | **0** | |

The 497 are excluded by the vault's July publish boundary (`publish.yml` allowlist; legacy `publish: true` flags are ignored). By top folder: UNSTRUCTURED 107, INBOX/DROPZONE 79, 98 ARCHIVE 72, Daily Notes 41, 01 Projects 37, 12 Content Creation 29, VAULT SANDBOX TESTING 28, 20 Home DIY 16, 50 Cybersade 14, 23 Wellness/Fitness 9, 09 Personal 8, Templates 7, and smaller folders. `README.md` (Publish's home page) is also outside the boundary.

Permalinks: `my-tech-stack`, `corporate-obsidian` and `obsidian-in-browser` survive (Quartz turns `permalink:` into a redirect page). `ylc2024`, `easy-schematic-workflow` and `homeec25` belong to excluded notes and would break.

Machine checks, run against a GitHub-Pages-like static server (case-sensitive, extensionless `.html`, `404.html`) with the redirect layer below added to the build:

- All 1,840 static redirect files (the `+` form and the space form of each of the 920 URLs) resolve to a real note page.
- All 3,680 case, trailing-slash and percent-encoded variants are covered by the not-found fallback map.
- All 497 retired notes return 404 with the retired notice.
- Heading deep links: 4,610 of 4,706 Publish headings (98%) map to the exact Quartz heading id. The other 96, mostly emoji or punctuation-heavy headings, land at the top of the right page.
- Browser-checked: canonical, heading-fragment, lowercase, trailing-slash, lowercase-plus-heading, permalink, `/README` and retired-note URLs all behave as described.

Attachments were served from `publish-01.obsidian.md`, not from `cybersader.com`, so they are not cybersader.com URLs. Embeds in the new site use its own asset copies. Old direct links to Publish asset URLs will stop working once Publish is cancelled, whatever this plan does.

No inbound-link inventory exists, so real-world usage of any URL is unknown. The domain already has Google Search Console verification; its Pages report would show which old URLs actually get traffic.

### Redirect layer (to build before the switch)

GitHub Pages is static and case-sensitive, so the layer has three parts, all generated at build time with no vault frontmatter edits:

1. A redirect file at each old canonical URL, in both `+` and space form: an instant meta refresh plus a canonical link, and a small script that keeps the `#fragment` and converts Publish heading fragments to Quartz heading ids.
2. A `legacy-urls.json` map from normalized old paths (case, `+`/`%20`, trailing slash, `.md`) to new URLs, with `null` for retired notes.
3. The site's `404.html` looks the requested path up in that map: it forwards known URLs, shows the retired notice for retired ones and leaves real 404s alone.

The input is a snapshot of the Publish URL list stored in the vault (old URL to source path). Each build resolves source paths to current URLs, so a later rename shows up as an unresolved row instead of a silent break. The snapshot must be captured before Publish is cancelled, because its index disappears with it.

## Work before the switch

- [x] **Owner decisions (2026-11-17):** `publish.yml` unchanged for the cutover (the 497 stay off; personal material moves to a private vault and topical folders get reviewed afterwards); the three broken short links are accepted; Cloudflare records DNS only.
- [ ] **PR #14:** the Publish URL snapshot `.cyberbaser/publish-legacy-urls.json`. Must merge before PR #17.
- [x] **Cyberbaser renderer:** redirect layer, settings file support. Cyberbaser holds no Cyberbase values; this vault's `.cyberbaser/site.yml` supplies title, address, source repository, PostHog and the snapshot.
- [x] **Switch configuration, draft PR #17 (merge only at the switch):** `.cyberbaser/site.yml` with `baseUrl: cybersader.com`, the workflow pointing the renderer at it, renderer and ofm-check pins, rebased continuity check.
- [x] **Exact rehearsal** from public sources: see PR #17.

The 404 fallback hashes paths with the browser's Web Crypto, which needs HTTPS: while the certificate is being issued, plain-HTTP visitors still get the static redirect pages but not the variant fallback.

## The switch

**Exact build:** the `publish-site.yml` run triggered by merging vault PR #17 (after PR #14), renderer `0d0b8fa4a6cdee9f76db3e17d7d8b6362ad05730`. Record its run ID and vault commit here. Before it, deployed: renderer `efb6b72d4a0fcc503dd97b0339c972021b21a995`.

**Current DNS (Cloudflare zone, nameservers `ingrid`/`howard.ns.cloudflare.com`):** `cybersader.com` and `www` both proxied; public answers are Cloudflare anycast `104.21.19.146`, `172.67.186.127`, `2606:4700:3033::6815:1392`, `2606:4700:3030::ac43:ba7f`. The underlying records are hidden by the proxy (Obsidian's documented setup is a proxied CNAME to `publish-main.obsidian.md`). `www` currently returns 404 from Publish. Leave every MX and TXT record (mail and site verifications) untouched.

1. **Days before:** in Cloudflare, export the zone (DNS → Records → Export) and keep the file; it is the DNS rollback. Lower the TTL of the `@` and `www` records to Auto/300. In GitHub (account Settings → Pages → Verified domains) verify `cybersader.com`: add the `_github-pages-challenge-cybersader` TXT record it shows. This stops anyone else claiming the domain on Pages.
2. **Deploy:** merge vault PR #17. The build is addressed to `cybersader.com`; until step 4 it is still served at `cybersader.github.io/cyberbase/`, where pages work but the variant fallback does not, so do steps 2 to 4 in one sitting.
3. **DNS:** replace the `@` record(s) with, all **DNS only** (grey cloud):
   - `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA @` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www` → `CNAME cybersader.github.io` (replacing its current record)
4. **Pages custom domain:** `gh api -X PUT repos/cybersader/cyberbase/pages -f cname=cybersader.com` (or Settings → Pages → Custom domain). With an Actions-deployed site no `CNAME` file is needed. `cybersader.github.io/cyberbase/…` then redirects to `cybersader.com/…`.
5. **HTTPS:** wait until Settings → Pages shows the certificate issued (usually minutes, up to about an hour; HTTPS may show a certificate warning until then, so pick a quiet time), then `gh api -X PUT repos/cybersader/cyberbase/pages -F https_enforced=true`.
6. **Live checks:**
   - `curl -sI https://cybersader.com/` shows `server: GitHub.com` and a valid certificate; `http://` and `www` redirect to `https://cybersader.com/`.
   - The mapping script's sample: 20 old URLs, including `/README`, a heading link, a lowercase variant, `my-tech-stack` and one retired note, behave as in the table above.
   - The URL-continuity report for the deployed build is green.
   - A note page shows the source row, Copy Markdown and dates, and PostHog receives a page view.

Recommendation: keep the records DNS only. Proxying through Cloudflare is possible later (SSL mode Full (strict)) but complicates GitHub's certificate renewal and adds nothing the site needs now.

## Rollback values

- **DNS:** re-import the exported zone file (restoring the proxied `@` and `www` records). Publish keeps serving as long as its subscription and custom-domain setting are still in place, which is why cancellation comes last.
- **Site:** remove the custom domain (Settings → Pages, or `gh api -X PUT repos/cybersader/cyberbase/pages -F cname=null`); the site returns to `cybersader.github.io/cyberbase/`. Re-run `publish-site.yml` at the previous vault commit to restore the previous build.
- **Source:** `git revert` the vault cutover commits (workflow env, renderer pin, snapshot); the previous renderer pin is `efb6b72d4a0fcc503dd97b0339c972021b21a995`. No note content changes in the cutover itself.

## Cancel Obsidian Publish (last)

Only after the owner accepts the live site, and after a quiet period (suggested two weeks) with Search Console showing no unexpected 404 growth:

1. Confirm the URL snapshot is committed in the vault (the Publish index is gone after cancellation).
2. In Obsidian: Publish → site options → remove the custom domain `cybersader.com`.
3. Account settings → Publish → cancel the subscription. The `publish-01.obsidian.md` site and its asset URLs go away at the end of the billing period.

Cancellation is irreversible for the old asset URLs and needs its own owner yes.
