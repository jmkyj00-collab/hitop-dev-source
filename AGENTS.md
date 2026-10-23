# AGENTS.md

## Development repository workflow (current)

- This is `jmkyj00-collab/hitop-dev-source`, seeded from `homepage-autoslide` at `d6d6c55`.
- All six pages, including products and delivery, are now Eleventy templates in `src/`. Earlier legacy-page notes below are historical; root legacy HTML files are not present.
- Build with `npm run build`. Preserve the `/dev-hitop/` URL prefix.
- Push source changes to this repository, never to the deployment repository directly.
- `.github/workflows/publish.yml` builds and publishes only `_site/` output to `jmkyj00-collab/dev-hitop` on main pushes. Pull requests build without publishing.
- `DEPLOY_SSH_KEY` is a GitHub Actions secret; never write private keys into source files.
- This repository does not deploy to Sites.
- Every page template renders twice (ko at `/…`, en at `/en/…`) via `pagination` over `src/_data/locales.json`. Write Korean in templates/data and output it with `| t`; English comes from `src/i18n/en/*.json` keyed by the exact Korean string. Use `| lurl` for internal links. The build lists untranslated strings as `[i18n]` warnings — keep that list empty.
- `scripts/sync-deployment.mjs` allowlists published paths. Adding a new page requires adding its path (ko and `en/`) to `PAGE` there, or the deploy fails.

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Working Rules

**요청이 모호하면 반드시 먼저 질문한다.**
작업을 시작하기 전, 요청의 범위·의도·세부 사항 중 불확실한 부분이 하나라도 있으면 임의로 가정하지 않고 사용자에게 직접 질문해 요구사항을 구체화한다. 추측으로 작업을 진행하다 결과물을 통째로 수정하는 상황을 방지하기 위함이다.

- 질문은 핵심만 짚어 간결하게 한다.
- 한 번에 여러 불확실한 항목을 묶어서 물어본다.
- 요구사항이 명확해진 뒤에 작업을 시작한다.

## Project Overview

This is a Korean-language corporate website renewal project for **주식회사 하이탑 (HITOP)**, a B2B supplier of bridge expansion joints (교량이음장치), non-slip stair nosings (논슬립), and wood deck products (목재덱). The site targets public procurement clients and highlights certifications such as 조달청, 벤처기업, and G-PASS.

The project is being rebuilt with **Eleventy + Tailwind CSS v4** while keeping the old static HTML pages as reference material. Treat the old root HTML files as legacy/reference pages unless the user explicitly asks to edit them.

## Source of Truth

- Use `src/` as the primary source for the renewed website.
- Do not edit `_site/` directly. It is generated output and is ignored by git.
- Use root-level legacy HTML files (`index.html`, `about.html`, `products-*.html`, `delivery.html`) only as reference for content, structure, and product data unless the task clearly targets the legacy page.
- Shared company data and navigation live in `src/_data/site.json`.
- Shared layout and chrome live in `src/_includes/layouts/` and `src/_includes/partials/`.

## File Structure

| File / Directory | Purpose |
| --- | --- |
| `src/index.njk` | Renewed landing page source |
| `src/about.njk` | Renewed company introduction source |
| `src/_data/site.json` | Company metadata, contact info, certifications, navigation |
| `src/_includes/layouts/base.njk` | Global document shell |
| `src/_includes/layouts/page.njk` | Common subpage hero layout |
| `src/_includes/partials/nav.njk` | Shared navigation |
| `src/_includes/partials/footer.njk` | Shared footer |
| `src/css/main.css` | Tailwind v4 entrypoint, theme tokens, reusable components/utilities |
| `src/js/main.js` | Shared interactions for renewed pages |
| `images/` | Shared image assets copied through Eleventy passthrough |
| `_site/` | Generated site output; do not edit by hand |
| `hompage_ref/` | Internal reference materials; ignored by git |

## Development Commands

- `npm run dev` starts Eleventy serve and Tailwind watch in parallel.
- `npm run build` cleans `_site/`, builds Tailwind CSS, and runs Eleventy.
- `npm run build:css` compiles `src/css/main.css` to `_site/css/style.css`.
- `npm run build:11ty` runs Eleventy only.

Run `npm run build` after changes to `src/`, Tailwind classes, shared data, or templates. For documentation-only changes, a build is not necessary.

## CSS Architecture

- The renewed site uses Tailwind CSS v4 with `@theme`, `@utility`, `@layer`, and `@source` in `src/css/main.css`.
- The current renewal palette uses deep burgundy as the primary color (`--color-primary: #7f0013`).
- Prefer existing utilities and components such as `container-hi`, `section`, `btn-primary`, `btn-light`, `btn-outline`, `eyebrow`, `badge`, and `cert-chip`.
- When using a semantic class in templates, confirm it is defined in `src/css/main.css` or add it there.
- Keep shared styles in `src/css/main.css`; keep one-off page composition mostly in the relevant `.njk` template with Tailwind classes.
- The old `style.css` belongs to the legacy root HTML design and uses a different token system. Do not mix its classes into renewed `src/` pages.

## JavaScript / Interaction Patterns

- Shared renewed-site interactions live in `src/js/main.js`.
- Navigation uses `data-navbar`, `data-nav-toggle`, and `data-mobile-nav`.
- Homepage hero snap/slide behavior uses `data-hero` and `data-next-section`.
- Scroll animation hooks use `data-sa` and optional `data-sa-delay`.
- Keep interactions defensive: scripts should no-op when a page does not contain the expected elements.

## Image Conventions

- Product images should be browser-friendly `.jpg` or `.png`.
- Original `.jpx` files were JPEG 2000 and are not suitable for direct browser use.
- Product card thumbnails use the `_full.png` variant.
- Detail/gallery images use `_img##.jpg` or `_img##.png`.
- Brand logo: `images/brand/logo.png`.
- Main renewed hero image: `images/hero/hero-main.png`.
- `images/필요없는_이미지_파일/` is an archive/reference area; do not use assets from it unless explicitly requested.

## Content / Copy Guidelines

- Write Korean copy in a formal corporate tone suitable for public procurement and B2B customers.
- Preserve accurate product names: 교량이음장치, 논슬립, 목재덱.
- Preserve certification and procurement terms exactly when possible: 조달청, 나라장터, 벤처기업, G-PASS.
- Keep English brand terms consistent: `HITOP`, `HITOP Co., Ltd.`

## Quality Checks

- After source changes, run `npm run build` and fix template/CSS errors before finishing.
- Verify renewed pages through `_site/` or the Eleventy dev server, not by opening `.njk` files directly.
- Check mobile navigation, desktop dropdowns, image paths, and Korean text rendering after layout changes.
- Be careful with the dirty worktree. Do not revert user changes or large image conversion changes unless explicitly asked.

## Utility Scripts

- `extract-images.ps1` extracts and renames images from source materials.
- `extract_images.py` is the Python equivalent.
- `optimize_images.py` and `rename_images.py` are image maintenance utilities; inspect them before running.
