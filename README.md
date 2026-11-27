# Travis McCormack — Customer Research & Insights Leadership
Release 0.2 of a dedicated executive portfolio for travis-mccormack-insights.com. The separate Customer Intelligence Lab remains at https://searchmont-analytics.github.io/customer-intelligence-lab/. This site links to its executive guided tour, technical pathway and each module; it does not copy the research application or modify the lab repository.

## Structure
- `public/index.html`: executive introduction, six leadership examples (including community investment and enterprise change), three hiring-panel entry paths, enterprise experience, research vision, flagship lab, third-party appraisal, role-alignment accordions, 90-day roadmap.
- `public/briefing.html`: concise, print-styled executive briefing (browser Print → Save as PDF).
- `public/styles.css`: responsive editorial design, native HTML controls, accessible focus, print and reduced-motion styles.
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
Before publishing, confirm career statements and preferred language. The site intentionally avoids claiming prior professional customer research management, corporate people-management or procurement qualifications that have not been established. No video placeholder: integrate the approved film only after production in the lab's separate video workstream. Additional career details and an approved local portrait are optional future enhancements. No external image is hotlinked; the existing portfolio portrait was not retrievable for verification. The six leadership examples, enterprise deliverable counts and the methodological review are based on the public career summaries and linked Statistics Canada study; they are not independent verification of employment claims. Keep the new site focused on research leadership; the existing portfolio domains remain intact.

## Test
`node tests/check.mjs`
For optional browser tests:
```sh
npm install --no-save --no-package-lock playwright@1.56.1
npx playwright install chromium
node tests/browser.mjs
```
Automated checks do not replace manual visual, factual and assistive-technology review.
