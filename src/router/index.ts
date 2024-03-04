import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@auth0/auth0-vue';

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
      path: '/chat/:id?',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/system-presets',
      name: 'systemPresets',
      component: () => import('../views/SystemPresetsView.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/sandbox',
      name: 'sandbox',
      component: () => import('../views/SandboxView.vue'),
      beforeEnter: authGuard,
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

export default router;
