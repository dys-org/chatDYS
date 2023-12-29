<script setup lang="ts">
import { watch } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

import AppHeader from './components/AppHeader.vue';
import PageLoader from './components/PageLoader.vue';
import http from './utils/http';
const { isAuthenticated, user, isLoading } = useAuth0();

async function createNewUser() {
  await http.post(`/api/users/${user.value?.sub}`, {
    sub: user.value?.sub,
    name: user.value?.name,
    email: user.value?.email,
  });
}

watch(
  () => !isLoading.value && isAuthenticated.value,
  async (newValue) => {
    if (newValue) {
      // check database for user
      if (!user.value) return;
      try {
        await http.get(`api/users/${user.value.sub}`);
      } catch (err: any) {
        console.error(err.message);
        // if user not found, create new user
        if (err.status === 404) {
          createNewUser();
        }
      }
    }
  },
);
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <PageLoader :show="isLoading" />
    <AppHeader />
    <RouterView />
  </div>
</template>
