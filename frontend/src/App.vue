<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { DToastList } from 'deez-components';

import { useToastStore } from '@/stores/toast';
import { useUserStore } from '@/stores/user';

import AppHeader from './components/AppHeader.vue';
import PageLoader from './components/PageLoader.vue';
import { HTTPError } from './utils/exceptions';

const { isAuthenticated, user, isLoading, logout } = useAuth0();

const toastStore = useToastStore();
const userStore = useUserStore();

const showLoader = computed(() => isLoading.value);

watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    // check database for user
    if (!user.value) return;
    try {
      await userStore.fetchCurrentUser();
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      // if user not found, create new user
      if (err instanceof HTTPError && err.status === 404) {
        userStore.createNewUser({
          name: user.value.name ?? '',
          email: user.value.email ?? '',
        });
      }
    }
  }
  if (!newVal) {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }
});
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <PageLoader :show="showLoader" />
    <AppHeader />
    <RouterView />
    <DToastList :notifications="toastStore.notifications" @dismiss="toastStore.remove" />
  </div>
</template>
