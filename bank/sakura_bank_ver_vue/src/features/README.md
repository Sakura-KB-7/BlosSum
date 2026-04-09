# Feature Folder Migration Guide

거래/대시보드/공용 UI는 이미 기능/공유 구조로 1차 이동 완료했습니다.
남은 화면은 기능 단위 구조로 점진 전환합니다.

## 제안 매핑

- `views/Transaction*`, `stores/budget.ts`, `stores/categories.ts`
  → `features/transactions/`
- `views/CalendarView.vue`
  → `features/calendar/`
- `views/DashboardView.vue`, `components/CategoryPie.vue`
  → `features/dashboard/`
- `views/SettingsView.vue`, `stores/profile.ts`
  → `features/settings/`
- `views/CharmsView.vue`, `map/views/MapView.vue`, `views/NewsletterView.vue`
  → `features/experiments/`

## 전환 원칙

1. 라우트 경로는 유지하고 내부 import만 단계적으로 교체
2. 기능별 `components`, `store`, `api`, `types`를 함께 이동
3. 대규모 이동은 PR을 기능별로 쪼개서 진행
