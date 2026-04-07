# 작업하기 쉬운 구조 가이드

## 1) 문서 구조 (재편)

- `docs/plan/implementation-plan.md` : 팀 목표/요구사항 기준선
- `docs/plan/plan-vs-current.md` : 플랜 대비 구현 갭
- `docs/status/current-status.md` : 현재 진행상황 스냅샷
- `docs/work/work-guide.md` : 작업 규칙/우선순위

## 2) 개발 구조 (권장)

아래 구조로 점진 전환합니다.

```text
src/
  app/           # 앱 셸/라우팅/전역 설정
  features/
    transactions/
    calendar/
    dashboard/
    charts/
    settings/
  shared/
    ui/
    lib/
    api/
```

현재는 **일부 기능(거래/대시보드)부터 `features/*`로 이동**했고,
나머지 화면을 기능 단위로 점진 이동하는 전략을 사용합니다.

## 3) 일일 작업 루틴

1. `docs/plan/plan-vs-current.md`에서 오늘 작업 항목 선택
2. 기능 브랜치 생성 (`feat/...`, `fix/...`)
3. 구현 후 `npm run build` 확인
4. `docs/status/current-status.md` 체크박스 갱신
5. PR 작성 시 변경 이유 + 다음 작업 연결

## 4) 작업 단위 분리 규칙

- 한 PR에는 하나의 사용자 가치(예: 로그인 도입)만 포함
- 문서 PR과 기능 PR을 가능한 분리
- 목업 데이터 제거 작업은 API 연동 PR에서 같이 처리

