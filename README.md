# Travis McCormack — Customer Research & Insights Leadership
Release 0.7 of a dedicated executive portfolio for travis-mccormack-insights.com. The separate Customer Intelligence Lab remains at https://searchmont-analytics.github.io/customer-intelligence-lab/. This site links to its executive guided tour, technical pathway and each module; it does not copy the research application or modify the lab repository.

## Structure
- `public/index.html`: executive introduction, six leadership examples (including community investment and enterprise change), three hiring-panel entry paths, career impact evidence and independently reported skatepark case study, enterprise experience, research vision, flagship lab, third-party appraisal, role-alignment accordions, 90-day roadmap.
- `public/evidence.html`: evidence library distinguishing external correspondence and public reporting, personal professional accounts, and independent research demonstrations.
- `public/briefing.html`: concise, print-styled executive briefing (browser Print → Save as PDF).
- `public/styles-v07.css`: (active stylesheet; `public/styles.css` retained for older cached pages)  responsive editorial design, native HTML controls, accessible focus, print and reduced-motion styles.
- `public/favicon.svg`: original typographic mark. No external assets, scripts, tracking or dependencies.
- `tests/check.mjs`: static content and link checks.
- `tests/browser.mjs`: real Chromium layout and interaction checks, when Playwright is installed.

## Review locally
Open public/index.html in a browser or run `python -m http.server 8000 --directory public` from the repo root. No build is necessary.

## Cloudflare Pages deployment
The domain is already purchased through Cloudflare, but purchasing a domain does not automatically deploy the website. In Cloudflare's dashboard, go to **Workers & Pages → Create application → Pages → Connect to Git** (or Import existing Git repository). Authorize GitHub and select `searchmont-analytics/customer-insights-site`.
- Production branch: `main`
- Framework preset: None
- Root directory: leave blank (repository root)
- Build command: `exit 0` (no build required)
- Build output directory: `public`
Save and deploy. Open the assigned pages.dev URL and inspect it. Then, within this Pages project, choose **Custom domains → Set up a domain**, enter `travis-mccormack-insights.com` and follow the prompts. Verify that the zone is active and the custom domain serves HTTPS; Cloudflare can create the needed DNS record for a Cloudflare-managed apex zone. Optionally add www only if desired. Do not change DNS records belonging to the other portfolio sites.
Official documentation: https://developers.cloudflare.com/pages/get-started/git-integration/ ; https://developers.cloudflare.com/pages/framework-guides/deploy-anything/ ; https://developers.cloudflare.com/pages/configuration/custom-domains/.
Cloudflare project setup, DNS and TLS were not performed by the GitHub integration. No claim that the site is live until these are verified.

## Content and governance
Career evidence is based on the author's public portfolios, plus confirmed Voice Network Analyst dates (2007–2009). QA dates (2009–2011) are inferred and labelled. Sources: https://data-analytics-travis-mccormack.com/ and https://travis-mccormack-analytics.com/. Third-party appraisal cites Statistics Canada, Rotermann and Gilmour, August 9, 2022, based on 2018 data. The appraisal is not a current market estimate. The lab's fixed baseline scenario is synthetic or illustrative; no real customer records, private CV or employer-owned source code are included.
Before publishing, confirm career statements and preferred language. The site intentionally avoids claiming prior professional customer research management, corporate people-management or procurement qualifications that have not been established. No video placeholder: integrate the approved film only after production in the lab's separate video workstream. The homepage uses the author's preferred full-length studio portrait, stored as `public/assets/travis-full-portrait.avif` (560×700; resized without cropping or appearance changes, CSS object-fit contain). The earlier crop is retained in repository history/assets but is not displayed. The personal leadership philosophy is proposed first-person copy for the author's review. Three supplied leadership visuals are included as small, resized AVIF files for the initial web layout. The board meeting and emergency scene are AI-generated illustrations, and the community image is labelled illustrative. These do not verify events or professional claims. Higher-resolution originals may replace the web derivatives during a subsequent visual review. No external image is hotlinked. Do not present generated or unverified historical event images as documentary photographs. The six leadership examples, enterprise deliverable counts and the methodological review are based on the public career summaries and linked Statistics Canada study; they are not independent verification of employment claims. Keep the new site focused on research leadership; the existing portfolio domains remain intact.

## Test
`node tests/check.mjs`
For optional browser tests:
```sh
npm install --no-save --no-package-lock playwright@1.56.1
npx playwright install chromium
node tests/browser.mjs
```
Automated checks do not replace manual visual, factual and assistive-technology review.

## Alternative: GitHub Pages with the custom domain
Use **one** production host for the apex custom domain. GitHub's branch-based Pages workflow can build the repository root successfully while placing the actual site under `/public/` instead of at the homepage. The deployment log from the initial branch-based build confirms this layout. To publish only the intended site, without duplicating HTML or exposing repository support files:

1. In repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. In **Actions → Publish portfolio to GitHub Pages**, select **Run workflow** on main. This workflow uploads only `public/`, making `public/index.html` the site homepage.
3. Automatic publishing is now enabled on pushes to `main` affecting `public/**` or the publishing workflow. No repository variable is necessary. Manual dispatch remains available.
4. Confirm the site at the Pages URL and then configure the custom domain in repository Pages settings and the corresponding DNS in Cloudflare, using the official guidance. If Cloudflare Pages already serves the apex domain, do not point it at a second host.

Official documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site and https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site. The author confirmed via screenshots that GitHub Actions is selected, DNS check succeeded and Enforce HTTPS is enabled. Account settings and DNS were configured by the author. Deployment success and live homepage must still be verified for the latest commit.

## Custom-domain DNS for GitHub Pages (Cloudflare)
First verify the domain in GitHub account settings if possible, and configure the repository's Pages custom domain as `travis-mccormack-insights.com`. Use the GitHub Actions publishing source. In Cloudflare DNS create four A records with name `@`, targets `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`, plus CNAME `www` → `searchmont-analytics.github.io`. Use DNS only (grey cloud), TTL Auto for all five. Do not add a wildcard or point to a repository path. If GitHub supplies a domain verification TXT record, use its exact token. After DNS validates, enable Enforce HTTPS in Pages settings. These records apply to GitHub Pages hosting, not Cloudflare Pages hosting. Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site .

## Career impact and independent press evidence (0.5)
- https://www.sootoday.com/local-news/the-problem-with-our-new-skate-park-25-photos-124248 — Carol Martin, SooToday, June 28, 2009: presidency, phase-one opening, reported $75,000 Ontario Trillium Foundation contribution and demand.
- https://www.sootoday.com/local-news/the-skate-park-isnt-big-enough-for-the-community-that-we-have-11-photos-322287 — Kenneth Armstrong, SooToday, June 21, 2016: presidency, early wooden park, 2009 first phase, continued demand and expansion advocacy. Attendance increase was an observation, not a counted measure.
- The $400,000 total is attributed to the author's existing professional portfolio; neither article independently verifies that total or phase-two completion. Link to original photo galleries rather than copying news imagery without permission. Other career metrics are attributed to the author's public professional accounts, and the independent LiDAR project is linked with its methodological limitations.

## Evidence library and deployment reliability (0.6)
The evidence library includes a paraphrased summary of February 2016 OPP correspondence supplied by the author. It recognizes the responding teams, not an individual award. The original private email, contact details, names of other responders, and incident particulars are deliberately excluded from the repository. The emergency-services portfolio (https://travis-mccormack-emergency-service.com/) is linked as a separate author-maintained source; individual incidents and images were not retrieved or republished. No unsupported facts or photographs from that site have been added.

Release 0.5's static and Chromium QA checks passed, and Pages uploaded its artifact successfully, but the final deployment could not discover the artifact immediately afterward (run 45935595650). The publishing workflow now has distinct build and deploy jobs. The latter depends on successful build completion and checks that the artifact is visible through the Actions API before publishing, with bounded retries. This mitigates a likely artifact-visibility race; it does not guarantee GitHub service availability. If an artifact expires or a run produces duplicate artifacts, dispatch a fresh workflow run rather than repeatedly uploading to the same run. DNS and repository Pages settings remain unchanged. See https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages .

## Release 0.7 — Career impact layout and photography
The author's screenshots showed newer Career Impact markup with base typography but missing section-specific styling. The repository contained the section CSS and release 0.6 deployed successfully; the live domain could not be retrieved from the development environment, so the exact browser-side cause was not independently confirmed. All three HTML pages now reference a new stylesheet path `public/styles-v07.css` to avoid reuse of the old cached response. Future CSS changes should update the active stylesheet and version its URL when deploying incompatible changes. The legacy `styles.css` remains for older cached HTML. Added computed-style and layout-position assertions at desktop and phone widths, focused impact screenshots and image decoding checks.

Reorganized the skatepark feature, milestone cards, recognition panel, source links and 2×2 supporting achievement cards (stacked on phones). Full-length portrait unchanged. Two author-supplied fire-service photos (IMG_1994.JPG, 20200917_184750.jpg) were resized to AVIF derivatives; no specific date, person or event is inferred. The board-meeting image remains labelled AI-generated; earlier illustrative fire-service scenes are no longer displayed. Public project graphics are copied byte-for-byte from the author's `searchmont-analytics/travis-site` assets (framework, lesson coverage, synthetic FireSmart demonstration). No private property-level data or proprietary records are introduced. The two source repositories are unchanged. `data-analytics-site-tm` contains earlier illustrations and a water atlas, but those were not duplicated in this release.
