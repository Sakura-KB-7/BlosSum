# 플랜 대비 현재 구현 비교표 (Plan vs Current)

기준일: 2026-04-07

## 요약
- 핵심 CRUD 및 라우팅 골격은 구현 완료.
- 캘린더/확장 기능은 UI 중심으로 선구현, 실데이터 연계는 보강 필요.
- 로그인/전용 로딩/모달 입력은 미구현.

## 비교표

| 플랜 항목 | 현재 상태 | 근거 파일 | 다음 작업 |
|---|---|---|---|
| 거래 등록/수정/삭제 | 완료 | `features/transactions/views/*`, `features/transactions/stores/budget.ts` | 유효성/에러 UX 보강 |
| 거래 조회 필터 | 완료 | `features/transactions/views/TransactionListView.vue` | 정렬 옵션 추가 |
| 월별 요약 계산 | 부분완료 | `features/transactions/stores/budget.ts` (`monthlyTotals`) | 대시보드/차트 페이지에서 공통 사용 |
| 캘린더 일별 내역 | 부분완료 | `CalendarView.vue` | 목업(`expenses-data`) → API 데이터 전환 |
| 차트 요약 페이지 | 부분완료 | `features/dashboard/views/DashboardView.vue`, `features/dashboard/components/CategoryPie.vue` | 전용 차트 라우트/페이지 분리 |
| 로그인 페이지 | 미구현 | (없음) | `/login` 뷰 + 라우트 추가 |
| 로딩 페이지 | 미구현 | (없음) | 앱 초기 로딩/스켈레톤 구성 |
| 모달 입력 방식 | 미구현 | (없음) | 캘린더 내 거래 추가 모달 구현 |
| 벚꽃 테마/감성 UI | 완료 | `CherryBlossomBackground.vue`, 레이아웃/뷰 스타일 | 성능 최적화 (애니메이션) |
| 확장 기능(부적/소식지/지도) | 부분완료 | `CharmsView.vue`, `NewsletterView.vue`, `MapView.vue` | 실데이터/API 연동 |

## 추천 실행 순서 (우선순위)

1. 로그인 + 라우트 가드
2. 캘린더 실데이터 전환
3. 입력 모달 구현
4. 차트 페이지 독립 및 월 요약 통합
5. 확장 기능 1개를 서비스 레벨로 완성

