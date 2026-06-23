import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import HomeView from '../views/HomeView.vue';
import ProfileView from '../views/ProfileView.vue';
import AnalyticsView from '../views/AnalyticsView.vue';

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true }
      },
      {
        path: 'analytics',
        component: AnalyticsView,
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            redirect: '/analytics/overview'
          },
          {
            path: 'overview',
            name: 'analytics-overview',
            component: () => import('../views/analytics/OverviewView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'proposals',
            name: 'analytics-proposals',
            component: () => import('../views/analytics/ProposalsView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'pkm',
            name: 'analytics-pkm',
            component: () => import('../views/analytics/PkmView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'pmw',
            name: 'analytics-pmw',
            component: () => import('../views/analytics/PmwView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'beasiswa',
            name: 'analytics-beasiswa',
            component: () => import('../views/analytics/BeasiswaView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'prestasi',
            name: 'analytics-prestasi',
            component: () => import('../views/analytics/PrestasiView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'recap',
            name: 'analytics-recap',
            component: () => import('../views/analytics/RecapView.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'venues',
            name: 'analytics-venues',
            component: () => import('../views/analytics/VenuesView.vue'),
            meta: { requiresAuth: true }
          }
        ]
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('../views/CallbackView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Restore user session if access token exists but user has not been fetched in this session (e.g. reload)
  if (authStore.accessToken && !authStore.hasFetchedUser) {
    try {
      await authStore.fetchCurrentUser();
    } catch (error) {
      console.error('Failed to restore session:', error);
      authStore.clearAuth();
    }
  }
  
  const isAuth = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isAuth) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
