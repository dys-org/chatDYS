import { createRouter, createWebHistory } from 'vue-router';

import { fetchCurrentUser } from '@/composables/queries';
import { useUserStore } from '@/stores/user';

import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/chat/:id?',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/system-presets',
      name: 'systemPresets',
      component: () => import('../views/SystemPresetsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sandbox',
      name: 'sandbox',
      component: () => import('../views/SandboxView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('../views/CallbackView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  // scrollBehavior(to, from, savedPosition) {
  //   if (savedPosition) return savedPosition;
  //   else return { top: 0 };
  // },
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    try {
      // if not logged in, try to fetch the current user
      // if that triggers an error, redirect to login
      // just checking for userStore.data causes another redirect to login page after redirect from Github
      if (userStore.data == null) await fetchCurrentUser();
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
      return '/login';
    }
  }
});

export default router;
