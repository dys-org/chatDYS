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
      // meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      // meta: { requiresAuth: false },
      beforeEnter: authGuard,
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      // meta: { requiresAuth: true },
      beforeEnter: authGuard,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      // meta: { requiresAuth: true },
      beforeEnter: authGuard,
    },
    {
      path: '/vision',
      name: 'vision',
      component: () => import('../views/VisionView.vue'),
      // meta: { requiresAuth: true },
      beforeEnter: authGuard,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFoundView.vue'),
      // meta: { requiresAuth: false },
    },
  ],
});

export default router;
