import fs from "node:fs";
import path from "node:path";

// ── 다국어(ko/en) ──
// 국문 문구를 그대로 키로 쓰는 번역 사전: src/i18n/en/*.json 을 모두 합쳐 사용한다.
// 국문 문구를 고치면 영문 사전의 키도 함께 고쳐야 하며, 빠진 번역은 빌드 끝에 경고로 출력된다.
const I18N_DIR = "src/i18n";
const HANGUL = /[가-힣]/;
// 언어와 무관한 정적 자산 경로 — 영문 페이지에서도 /en 접두사를 붙이지 않는다
const ASSET_PATH = /^\/(images|css|js)\//;

function loadDictionary(lang) {
  const dir = path.join(I18N_DIR, lang);
  const dict = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const entries = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const [ko, text] of Object.entries(entries)) {
      if (ko in dict && dict[ko] !== text) {
        console.warn(`[i18n] ${file}: "${ko}" 번역이 다른 파일과 다릅니다.`);
      }
      dict[ko] = text;
    }
  }
  return dict;
}

const langOf = (page) => (page && page.url && page.url.startsWith("/en/") ? "en" : "ko");

export default function (eleventyConfig) {
  // 이미지·정적 자산은 그대로 _site로 복사 (Tailwind가 만드는 css는 별도 파이프라인)
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  // 템플릿/데이터가 바뀌면 브라우저 리로드
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget(`${I18N_DIR}/`);

  let dictionaries = {};
  const missing = new Set();
  eleventyConfig.on("eleventy.before", () => {
    dictionaries = { en: loadDictionary("en") };
    missing.clear();
  });
  eleventyConfig.on("eleventy.after", () => {
    if (missing.size) {
      console.warn(`[i18n] 영문 번역이 없는 문구 ${missing.size}건:\n  - ${[...missing].join("\n  - ")}`);
    }
  });

  // 현재 페이지 언어 ("ko" | "en")
  eleventyConfig.addFilter("pageLang", function (page) {
    return langOf(page || this.page);
  });

  // 국문 문구 → 현재 페이지 언어. 한글이 없는 값(모델명·숫자)은 그대로 둔다.
  eleventyConfig.addFilter("t", function (text, lang) {
    const target = lang || langOf(this.page);
    if (target === "ko" || typeof text !== "string" || !HANGUL.test(text)) return text;
    const translated = dictionaries[target]?.[text];
    if (translated === undefined) {
      missing.add(text);
      return text;
    }
    return translated;
  });

  // 언어를 유지하는 내부 링크: 영문 페이지에서는 /en 을 붙인 뒤 pathPrefix 적용
  eleventyConfig.addFilter("lurl", function (href) {
    const url = eleventyConfig.getFilter("url");
    if (typeof href !== "string" || !href.startsWith("/")) return href;
    if (ASSET_PATH.test(href)) return url.call(this, href);
    return url.call(this, langOf(this.page) === "en" ? `/en${href}` : href);
  });

  // 특허번호 "(제10-2375750호)" / "(No. 10-2375750)"가 하이픈에서 줄바꿈되지 않게 묶는다 (출력은 | safe)
  eleventyConfig.addFilter("keepPatentNo", (text) =>
    String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\((?:제|No\. )\d{2}-\d{7}호?\)/g, (m) => `<span class="nowrap">${m}</span>`)
  );

  // 언어 전환 링크: 같은 페이지의 다른 언어 주소
  eleventyConfig.addFilter("altLangUrl", function (pageUrl, target) {
    const base = pageUrl.startsWith("/en/") ? pageUrl.slice(3) : pageUrl;
    return target === "en" ? `/en${base}` : base;
  });

  return {
    // 커스텀 도메인(zerok.site) 루트에서 서비스하므로 경로 접두사 없이 루트 기준
    pathPrefix: "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // .njk를 기본 템플릿 엔진으로
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"],
  };
}
