import { createRouter, createWebHistory } from 'vue-router';

// import { authGuard } from '@auth0/auth0-vue';
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
      // beforeEnter: authGuard,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      // beforeEnter: authGuard,
      meta: { requiresAuth: true },
    },
    {
      path: '/system-presets',
      name: 'systemPresets',
      component: () => import('../views/SystemPresetsView.vue'),
      // beforeEnter: authGuard,
      meta: { requiresAuth: true },
    },
    {
      path: '/sandbox',
      name: 'sandbox',
      component: () => import('../views/SandboxView.vue'),
      // beforeEnter: authGuard,
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

// router.beforeEach(async (to) => {
//   const auth = useAuthStore();
//   if (to.meta.requiresAtuh && !auth.user) {
//     auth.returnUrl = to.fullPath;
//     return '/login';
//   }
// });

export default router;
