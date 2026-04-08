import { createRouter, createWebHistory } from 'vue-router';
import SpringWalletLayout from '@/layouts/SpringWalletLayout.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          path: '/statistics',
          name: 'Statistics',
          component: () => import('@/views/StatisticsView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
  ],
});
