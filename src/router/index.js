import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import HomeView from '../views/HomeView.vue';
import BarangView from '../views/BarangView.vue';
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
        path: 'barang',
        name: 'barang',
        component: BarangView,
        meta: { requiresAuth: true }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: AnalyticsView,
        meta: { requiresAuth: true }
      },
      {
        path: 'sso-profile',
        name: 'sso-profile',
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
    // Role-Based Access Control
    if (to.name === 'barang' && isAuth) {
      // Mahasiswa is restricted from admin/SARPRAS/POS tools according to Permission Matrix
      if (authStore.user?.role === 'MAHASISWA') {
        console.warn('Access denied: role MAHASISWA cannot access administrative modules');
        next({ name: 'home' });
        return;
      }
    }
    next();
  }
});

export default router;
