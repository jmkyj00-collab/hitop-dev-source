import fs from "node:fs";

// 연도 기반 수치 — 빌드할 때 계산한다 (매년 1월 1일 자동 재배포: .github/workflows/publish.yml)
// 업력 = 올해 − 창업 연도(site.json foundedYear). 2026년 기준 25년.
const site = JSON.parse(fs.readFileSync(new URL("./site.json", import.meta.url), "utf8"));

// 빌드 서버(GitHub Actions)는 UTC라 한국 시간 기준 연도로 계산 — 1월 1일 0시(KST) 재배포 시 바로 바뀌도록
const current = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric" }).format(new Date()));

export default {
  current,
  inBusiness: current - site.foundedYear,
};
