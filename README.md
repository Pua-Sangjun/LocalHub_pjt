# LocalHub

공공데이터 기반 지역 정보 공유 커뮤니티 — **서울·경기** 권역

별도 회원가입 없이 지역 주민과 관광객이 정보를 자유롭게 공유·탐색할 수 있는 익명 커뮤니티 플랫폼입니다. 백엔드 서버 없이 브라우저에서 동작하는 정적 SPA로 구현되었습니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 선정 권역 | 서울·경기 |
| 핵심 문제 | 지역 주민·관광객이 공공데이터 기반 지역 정보(관광지·맛집·축제 등)를 가입 없이 자유롭게 공유·탐색할 채널 부재 |
| 타깃 사용자 | 선정 권역 방문 관광객 및 지역 주민 (익명 이용자) |
| 개발 기간 | 2026-07-14 ~ 2026-07-16 15:00 |

---

## 기술 스택

- **Frontend**: Vue.js 3 (Vite)
- **State/Storage**: 브라우저 `localStorage` (별도 백엔드 서버 없음)
- **Chatbot**: Netlify Functions + OpenAI API (서버 환경변수 `OPENAI_API_KEY`, 클라이언트 노출 방지)
- **배포**: Netlify
- **개발 도구**: VSCode + GitHub Copilot, OpenAI API Key
  - ⚠️ 보안 정책상 Claude Code, Codex, Cursor, Antigravity 등 기타 AI 코딩 도구 사용 금지

---

## 주요 기능

### 필수 기능

- **데이터 연동**: 제공 JSON 데이터를 프론트엔드에서 직접 로드·처리 (공공 API 직접 호출 없음)
- **익명 커뮤니티 게시판 (CRUD)**
  - 회원가입/로그인 없음, 별도 인증 체계 미적용
  - 게시글은 `localStorage`에 저장 (제목, 내용, 수정용 비밀번호)
  - 수정/삭제 시 저장된 비밀번호 일치 여부로만 권한 확인 (프론트엔드 로직, 평문 비교 — 교육 목적의 의도된 설계)
  - ⚠️ `localStorage` 특성상 게시글은 작성한 브라우저(기기)에만 저장되며 타 사용자와 공유되지 않음
- **AI 챗봇**
  - 제공 JSON 데이터 기반 자연어 지역 정보 질의응답 (관광지 추천, 축제 일정, 맛집 위치, 게시글 검색 등)
  - 대화 히스토리 유지, 모바일 대응, 플로팅 UI
- **배포**: Netlify 배포 및 URL 정상 동작 확인

### 선택 기능 (선정)

| 기능 | 내용 |
|---|---|
| 지도 시각화 | Leaflet.js/Kakao Maps 기반 관광지·맛집 지도 핀 시각화 |
| 커뮤니티 게시판 추가기능 | 조회수 표시, 게시글 검색, 좋아요 |

> 데이터 시각화 대시보드 / 날씨 정보 연동 / 소셜 공유 연동은 예비 후보로 보류

---

## 제약 사항 (RFP 근거)

- 제공 JSON 외 추가 데이터 수집 시 반드시 라이선스·공공누리 유형(1~4유형) 사전 확인 필요
- OpenAI API 키는 **사용량 제한이 걸린 키만 사용**, 결제 한도를 낮게 설정
- 개발 착수 이후 기능 요구사항 변경 없음
- 지정된 개발 환경(VSCode Copilot + OpenAI API) 외 AI 코딩 도구 사용 불가

---

## 폴더 구조

```
localhub/
├── public/
│   └── data/              # 제공 JSON 데이터
├── src/
│   ├── components/        # 게시판, 챗봇, 지도 등 UI 컴포넌트
│   ├── views/              # 페이지 단위 뷰
│   ├── router/              # Vue Router 설정
│   ├── stores/               # localStorage 연동 상태 관리
│   └── App.vue
├── .env                    # VITE_OPENAI_API_KEY 등 환경변수 (git 미포함)
├── vite.config.js
└── package.json
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env 파일 생성)
OPENAI_API_KEY=your_api_key_here
VITE_KAKAO_JAVASCRIPT_KEY=your_kakao_key_here

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

> ⚠️ `OPENAI_API_KEY`는 Netlify Functions 서버에서만 사용됩니다. `VITE_` 접두사 없이 설정하세요. Netlify 대시보드 → Site settings → Environment variables에도 동일 키를 등록해야 배포 환경에서 동작합니다.

---

## 팀 구성 및 담당

| 역할 | 담당자 | 주요 담당 영역 |
|---|---|---|
| FE1 | - | 데이터 연동 모듈, 지도 시각화, 배포 |
| FE2 | - | 게시판 CRUD, 게시판 추가기능 |
| FE3 | - | 챗봇 UI/API 연동, 소셜 공유 연동 |

---

## 일정 (WBS 요약)

| Day | 주요 작업 |
|---|---|
| Day 1 | 기획(RFP 확인, MVP 정의) + 설계(화면/컴포넌트/데이터 스키마, 챗봇 설계) |
| Day 2 | 개발 (데이터 연동, 게시판 CRUD, 챗봇, 지도, 추가기능, 통합) |
| Day 3 | 배포 + 테스트 + 문서화 + 발표 준비 |

전체 WBS 및 간트차트는 `LocalHub_WBS_간트차트.xlsx` 참고

---

## 라이선스 및 데이터 출처

- 제공 데이터: 공공데이터포털 기반 사전 가공 JSON (발주사 제공)
- 추가 수집 데이터 사용 시 출처·라이선스·수집일을 기능 명세서에 별도 기재
