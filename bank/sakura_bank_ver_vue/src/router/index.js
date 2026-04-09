import { createRouter, createWebHistory } from 'vue-router';
import SpringWalletLayout from '@/layouts/SpringWalletLayout.vue';
import { useAuthStore } from '@/stores/auth';
import IntroView from '@/Intro/pages/IntroView.vue'; // 새로 만든 인트로 로드

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      name: 'intro',
      component: IntroView, // 첫 시작은 인트로 페이지
    },
    {
      path: '/',
      component: SpringWalletLayout,
      children: [
        { path: '', redirect: { name: 'login' } },
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
          path: '/statistics',
          name: 'Statistics',
          component: () => import('@/views/StatisticsView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const isAuthPage = to.name === 'login' || to.name === 'signup';

  if (!auth.isAuthenticated && !isAuthPage) {
    return { name: 'login' };
  }

  if (auth.isAuthenticated && isAuthPage) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
