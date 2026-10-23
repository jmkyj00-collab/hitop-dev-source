# HITOP 개발 소스

주식회사 하이탑 홈페이지의 Eleventy + Tailwind CSS v4 개발 저장소입니다.

- 개발: https://github.com/jmkyj00-collab/hitop-dev-source
- 배포 파일: https://github.com/jmkyj00-collab/dev-hitop
- 테스트 홈페이지: https://jmkyj00-collab.github.io/dev-hitop/

## 개발 및 빌드

Node.js 22와 npm을 사용합니다.

```sh
npm ci
npm run dev
```

개발 서버가 출력하는 주소에서 확인합니다. 홈페이지는 `/dev-hitop/` 경로를 기준으로 합니다.

```sh
npm run build
```

수정은 `src/`와 `images/`에서 진행합니다. `_site/`는 자동 생성 결과이므로 직접 수정하거나 소스 저장소에 커밋하지 않습니다.

| 경로 | 역할 |
| --- | --- |
| `src/*.njk` | 홈, 회사소개, 제품별 상세, 납품실적, 고객지원(공지사항·온라인문의) 페이지 — 국문·영문 공용 |
| `src/_data/` | 회사 정보와 제품 데이터, 공지사항(`notices.json`) |
| `src/i18n/en/*.json` | 영문 번역 사전 (국문 문구 → 영문) |
| `src/_includes/` | 공통 레이아웃·메뉴·푸터 |
| `src/css/main.css` | Tailwind 테마 및 공통 스타일 |
| `src/js/main.js` | 공통 인터랙션 |
| `images/` | 웹사이트 이미지 |

## 국문·영문 페이지

페이지마다 템플릿은 하나이며, 국문(`/about/`)과 영문(`/en/about/`) 두 벌로 생성됩니다. 상단 KOR/ENG는 같은 페이지의 다른 언어로 이동합니다.

- 템플릿과 데이터에는 국문을 그대로 쓰고 `{{ "문구" | t }}`로 출력합니다. 영문 페이지에서는 `src/i18n/en/*.json`에서 같은 국문 문구를 찾아 영문으로 바꿉니다.
- 내부 링크는 `| url` 대신 `| lurl`을 씁니다. 영문 페이지에서는 `/en`이 자동으로 붙습니다.
- **국문 문구를 고치거나 추가하면 영문 사전의 키(국문)도 함께 맞춰야 합니다.** 번역이 빠진 문구는 영문 페이지에 국문으로 표시되고, 빌드 끝에 `[i18n] 영문 번역이 없는 문구` 경고로 나열됩니다.
- 한글이 없는 값(모델명, 숫자, 물품식별번호)은 번역 없이 그대로 출력됩니다.

## 공지사항 등록

`src/_data/notices.json` 배열에 항목을 추가하면 공지사항 페이지에 최신순으로 표시됩니다. 영문 필드를 생략하면 영문 페이지에도 국문이 표시됩니다.

```json
[
  { "date": "2026-10-24", "title": "제목", "body": ["첫 문단", "둘째 문단"], "titleEn": "Title", "bodyEn": ["Paragraph"] }
]
```

온라인문의는 서버 없이 방문자의 메일 프로그램으로 문의 메일(`site.contact.email` 수신)을 작성하는 방식입니다.

## 배포 방식

1. 작업 브랜치에서 수정하고 `npm run build`로 확인합니다.
2. 변경 내용을 이 저장소의 `main`에 반영합니다.
3. GitHub Actions의 **Build and publish**가 빌드한 `_site/` 내용만 `dev-hitop`의 `main`에 커밋합니다.
4. `dev-hitop`의 GitHub Pages가 반영된 정적 파일을 게시합니다.

Pull request에서는 빌드만 검증하며 배포하지 않습니다. Actions의 **Run workflow**로 수동 재배포도 가능합니다. 변경된 산출물이 없으면 배포 커밋을 만들지 않습니다. 소스 커밋 SHA는 배포 커밋 메시지에 기록됩니다.

### 최초 1회 설정

자동 배포는 활성화되어 있습니다. `main`에 push하면 빌드 성공 후 `dev-hitop`으로 배포합니다. 전용 배포 키와 Actions 비밀값 `DEPLOY_SSH_KEY`, 변수 `DEPLOY_ENABLED=true`가 설정되어 있습니다. 자동 배포를 일시 중지하려면 `DEPLOY_ENABLED`를 `false`로 바꾸면 됩니다. 빌드 검증은 계속 실행됩니다.

`dev-hitop`의 Settings → Deploy keys에 쓰기 허용된 전용 SSH 공개키를 등록하고, 이 저장소 Settings → Secrets and variables → Actions에 대응하는 비공개키를 `DEPLOY_SSH_KEY`로 등록합니다. 이 키는 배포 저장소에만 접근합니다. 비공개키는 소스 파일이나 README에 넣지 않습니다.

`dev-hitop`의 Settings → Pages에서 **Deploy from a branch**, **main**, **/(root)**를 선택합니다. 일반 `GITHUB_TOKEN`은 다른 저장소 쓰기 권한이 없으므로 전용 배포 키가 필요합니다.

배포는 기존 파일 중 이전 배포 manifest에 기록된 파일만 정리하며, 첫 배포에서는 기존 HTML·CSS·JS·이미지 경로를 관리 대상으로 가져옵니다. README, `.github`, CNAME 등 배포 외 파일은 유지합니다.

## 기준 버전

기존 `homepage-autoslide` 브랜치의 `d6d6c55d8135434eab72918051ad259ed0cc75fc`를 기준으로 시작했습니다. GitHub Pages용 `/dev-hitop/` 경로를 유지합니다. Sites 호스팅과는 별도로 관리합니다.
