import { createRouter, createWebHistory } from 'vue-router';
import SpringWalletLayout from '@/layouts/SpringWalletLayout.vue';
import { useAuthStore } from '@/stores/auth';
import IntroView from '@/Intro/pages/IntroView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**
     * [수정 1] 리다이렉트 설정 추가
     * 사용자가 브라우저 주소창에 그냥 주소( / )만 치고 들어올 경우,
     * 가장 먼저 인트로 페이지를 보여주기 위해 /intro로 강제 이동시킵니다.
     */
    { path: '/', redirect: '/intro' },

    /**
     * [수정 2] 인트로 경로 독립
     * 인트로를 '/'가 아닌 '/intro'라는 고유 경로로 설정하여
     * 메인 서비스 경로들과 충돌하지 않게 분리했습니다.
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
      path: '/',
      component: SpringWalletLayout,
      children: [
        /**
         * [수정 3] 자식 경로 체계 최적화
         * /main 같은 복잡한 부모 경로를 없애고 다시 '/' 아래에 두었습니다.
         * 대신 각 자식들의 path 앞에 '/'를 제거하여(예: 'dashboard')
         * 주소가 '/dashboard', '/calendar'처럼 깔끔하게 나오도록 수정했습니다.
         */
        { path: '', redirect: { name: 'dashboard' } },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () =>
            import('@/features/dashboard/views/DashboardView.vue'),
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/views/CalendarView.vue'),
        },
        {
          path: 'charms',
          name: 'charms',
          component: () => import('@/views/CharmsView.vue'),
        },
        {
          path: 'map',
          name: 'map',
          component: () => import('@/views/MapView.vue'),
        },
        {
          path: 'newsletter',
          name: 'newsletter',
          component: () => import('@/views/NewsletterView.vue'),
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () =>
            import('@/features/transactions/views/TransactionListView.vue'),
        },
        {
          path: 'transactions/new',
          name: 'transaction-new',
          component: () =>
            import('@/features/transactions/views/TransactionFormView.vue'),
        },
        {
          path: 'transactions/:id/edit',
          name: 'transaction-edit',
          component: () =>
            import('@/features/transactions/views/TransactionFormView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
        {
          /**
           * [수정 4] 절대 경로 버그 수정
           * 기존 '/statistics'에서 '/'를 제거했습니다.
           * 자식 경로에 '/'가 있으면 레이아웃이 깨질 수 있기 때문입니다.
           */
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/StatisticsView.vue'),
        },
        {
          path: '/receipt',
          name: 'receipt',
          component: () => import('@/views/ReceiptView.vue'),
        },
      ],
    },
    // [수정 5] 잘못된 주소 접근 시 로그인 대신 인트로로 리다이렉트하여 서비스 첫인상 강조
    { path: '/:pathMatch(.*)*', redirect: { name: 'intro' } },
  ],
});

/**
 * [수정 6] 네비게이션 가드(문지기) 로직 고도화
 */
router.beforeEach((to) => {
  const auth = useAuthStore();

  /**
   * 로그인 없이도 볼 수 있는 '공개 페이지' 명단에 'intro'를 추가했습니다.
   * 이게 없으면 인트로를 보러 가다가 로그인 페이지로 튕겨버립니다.
   */
  const isPublicPage =
    to.name === 'login' || to.name === 'signup' || to.name === 'intro';
  const isAuthPage = to.name === 'login' || to.name === 'signup';

  // 비로그인 사용자가 공개되지 않은 페이지(대시보드 등)에 접근 시 로그인으로 리다이렉트
  if (!auth.isAuthenticated && !isPublicPage) {
    return { name: 'login' };
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근 시 대시보드로 리다이렉트
  if (auth.isAuthenticated && isAuthPage) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
