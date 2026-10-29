import fs from "node:fs";

// 연도 기반 수치의 빌드 시점 값 — HTML 기본값(검색엔진·스크립트 미실행 대비).
// 방문 시점의 올해로는 src/js/main.js가 다시 계산하므로, 해가 바뀌어도 재배포할 필요 없음.
// 업력 = 올해 − 창업 연도(site.json foundedYear). 2026년 기준 25년.
const site = JSON.parse(fs.readFileSync(new URL("./site.json", import.meta.url), "utf8"));

// 빌드 서버(GitHub Actions)는 UTC라 한국 시간 기준 연도로 계산
const current = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric" }).format(new Date()));

export default {
  current,
  inBusiness: current - site.foundedYear,
};
