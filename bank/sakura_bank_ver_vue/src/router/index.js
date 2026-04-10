import { createRouter, createWebHistory } from 'vue-router';
import SpringWalletLayout from '@/layouts/SpringWalletLayout.vue';
import { useAuthStore } from '@/stores/auth';
import IntroView from '@/Intro/pages/IntroView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/intro' },

    /**
     * [설정] 독립 경로 (인트로 및 인증)
     */
    {
      path: '/intro',
      name: 'intro',
      component: IntroView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/login/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/login/SignUpView.vue'),
    },
    {
      path: '/login-loading',
      name: 'login-loading',
      component: () => import('@/loading/views/LoginLoadingView.vue'),
    },

    /**
     * [메인 서비스] 레이아웃 중첩 경로
     */
    {
      path: '/',
      component: SpringWalletLayout,
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/features/dashboard/views/DashboardView.vue'),
        },
        /**
         * [수정] 부적 제작소 (Amulet) 경로 추가
         * 김밥님이 새로 만드신 src/amulet 폴더 구조를 연결했습니다.
         */
        {
          path: 'amulet',
          name: 'amulet',
          component: () => import('@/amulet/features/pages/AmuletCustom.vue'),
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/views/CalendarView.vue'),
        },
        {
          path: 'map',
          name: 'map',
          component: () => import('@/map/views/MapView.vue'),
        },
        {
          path: 'newsletter',
          name: 'newsletter',
          component: () => import('@/views/NewsletterView.vue'),
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/features/transactions/views/TransactionListView.vue'),
        },
        {
          path: 'transactions/new',
          name: 'transaction-new',
          component: () => import('@/features/transactions/views/TransactionFormView.vue'),
        },
        {
          path: 'transactions/:id/edit',
          name: 'transaction-edit',
          component: () => import('@/features/transactions/views/TransactionFormView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/StatisticsView.vue'),
        },
        {
          path: 'receipt', // 수정: 자식 경로이므로 '/' 제거하여 상대 경로로 설정
          name: 'receipt',
          component: () => import('@/views/ReceiptView.vue'),
        },
      ],
    },
    // 잘못된 주소 접근 시 인트로로 리다이렉트
    { path: '/:pathMatch(.*)*', redirect: { name: 'intro' } },
  ],
});

/**
 * 네비게이션 가드
 */
router.beforeEach((to) => {
  const auth = useAuthStore();

  const isPublicPage = to.name === 'login' || to.name === 'signup' || to.name === 'intro';

  const isAuthPage = to.name === 'login' || to.name === 'signup';

  // 비로그인 사용자가 공개되지 않은 페이지에 접근 시 로그인으로 강제 이동
  if (!auth.isAuthenticated && !isPublicPage) {
    return { name: 'login' };
  }

  // 로그인 상태에서 로그인/회원가입 접근 시 대시보드로 이동
  if (auth.isAuthenticated && isAuthPage) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
