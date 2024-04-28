import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';

import http from '@/utils/http';

const router = useRouter();

// TODO get from Hono Client
export interface User {
  id: number;
  sub: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const returnUrl = ref<string>();

  // const isLoggedIn = computed(() => !!user.value?.token !== undefined);

  async function fetchCurrentUser() {
    user.value = await http.get(`/api/users/current`);
  }

  async function createNewUser(userInfo: { email: string; name: string }) {
    for (const [key, val] of Object.entries(userInfo)) {
      if (val === '') {
        console.error(`${key} given to createNewUser is empty`);
        return;
      }
    }
    await http.post(`/api/users`, userInfo);
  }

  async function login(username: string, password: string) {
    const user = await http.post(`/api/authenticate`, { username, password });
    user.value = user;
    // store user details and jwt in local storage to keep user logged in between page refreshes
    // localStorage.setItem('currentUser', JSON.stringify(user));

    // redirect to previous url or default to home page
    router.push(returnUrl.value || '/');
  }

  async function logout() {
    user.value = null;
    // localStorage.removeItem('currentUser');
    await http.get(`/api/logout`);
    router.push('/login');
  }

  return {
    user,
    fetchCurrentUser,
    createNewUser,
    login,
    logout,
  };
});
