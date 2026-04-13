# 🌸 MoneyBlosSum

**확실한 돈 관리를 위한 벚꽃 테마 가계부 서비스**

> "당신의 소비가 꽃잎이 되어 날아가지 않도록, 자산이 만개하는 봄을 기록하세요."

> 진행상황 체크 문서: [`docs/status/current-status.md`](./docs/status/current-status.md)
> 플랜 대비 비교표: [`docs/plan/plan-vs-current.md`](./docs/plan/plan-vs-current.md)
> 작업 가이드: [`docs/work/work-guide.md`](./docs/work/work-guide.md)

## 1) 프로젝트 개요

- **프로젝트명:** MoneyBlosSum
- **주제:** 가계부 서비스 앱 (KB 스켈레톤 프로젝트)
- **기간:** **2026-04-07(화) ~ 2026-04-13(월)**
- **핵심 목표:**
  - 수입/지출 기록과 조회, 월별 요약을 통한 자산관리
  - Vue 3 + json-server 기반 실전 개발 경험
  - 감성 UI(벚꽃/봄 테마)와 사용성 결합

## 2) Mission

- 흩어지기 쉬운 소비 기록을 한 곳에 모으는 **벚꽃 테마 자산 관리 서비스**
- 사용자의 입력 습관 형성을 돕는 **놀이형 UX** (벚나무 성장, 부적 갤러리 등)
- 가계부 핵심 기능 + 팀별 확장 기능을 균형 있게 구현

## 3) 기술 스택

### 필수

- **Frontend:** Vite, Vue 3, Composition API, vue-router, axios, Pinia, Component 기반 구조, 이벤트 처리
- **Backend:** json-server (`../backend/BlosSum_Backend/db.json`)

### 선택

- Figma, draw.io
- Bootstrap 5, FontAwesome

## 4) 핵심 기능 (MVP)

### A. 거래 기록

- 수입/지출 입력: 날짜, 금액, 카테고리, 메모
- 고정 수입/지출 기록 지원 (`isFixed`, `recurringDay`)

### B. 거래 조회

- 기간, 타입(수입/지출), 카테고리 필터
- 정렬(오름차순/내림차순)

### C. 월별 요약

- 월별 수입/지출/잔액(순이익) 집계
- 차트/그래프 시각화

### D. 데이터 저장

- json-server 기반 CRUD

## 5) 페이지 구성

- **메인(Dashboard)**: 월 요약 + 최근 거래
- **캘린더(Calendar)**:
  - 상단 요약 카드(수입/지출/잔액)
  - 날짜 클릭 시 일별 거래 내역
  - 빠른 추가(수입/지출 입력 모달)
  - 검색/필터
- **차트 요약(Charts)**: 월별/카테고리별 소비 시각화
- **거래 등록/수정(Form)**
- **설정(Settings)**

## 6) 확장 아이디어

- 벚나무 성장/낙화 애니메이션 (소비 패턴 반영)
- 부적 생성/해금 시스템
- AI 소식지(지원정책/생활비 정보)
- 위치 기반 소비 패턴 시각화
- 영수증 OCR 자동 입력

## 7) 데이터 모델 (json-server)

```json
{
  "records": [
    {
      "id": 1,
      "type": "expense",
      "date": "2026-04-07",
      "categoryId": 1,
      "title": "점심 식사 (김치찌개)",
      "amount": 10000,
      "paymentMethod": "card",
      "memo": "동료들과 식사",
      "isFixed": false
    }
  ],
  "categories": [
    { "id": 1, "name": "식비", "type": "expense", "color": "#FF6384" },
    { "id": 14, "name": "월급", "type": "income", "color": "#4CAF50" }
  ],
  "userSettings": {
    "name": "admin",
    "monthlyBudget": 3000000,
    "currency": "KRW"
  }
}
```

### 월 요약 계산 예시

- 해당 월 `records`만 필터링
- `type === 'income'` 합계
- `type === 'expense'` 합계
- `balance = income - expense`

## 8) 아키텍처

```text
User → Vue3 (router → page → axios) ↔ json-server (../backend/BlosSum_Backend/db.json)
                  ↕
              reusable components
```

## 9) json-server 실행

```bash
cd ../backend/BlosSum_Backend
npm install
npm run dev
```

기본 CRUD:

- `GET /records`
- `GET /records/:id`
- `POST /records`
- `PUT/PATCH /records/:id`
- `DELETE /records/:id`

## 10) 프로젝트 일정(요약)

- **1일차(2026-04-07):** 기획/벤치마킹, UI/데이터 구조 설계, 프로젝트 골격
- **2~4일차(2026-04-08~10):** 기능 구현 및 통합
- **5일차(2026-04-13):** 마무리, 문서화, 발표 준비

## 11) 제출 체크리스트

- 기획 문서 (doc/pdf)
- 화면 설계 문서 (ppt/figma/draw.io)
- 소스 코드
- 발표 자료 (PDF, 10MB 이하)
