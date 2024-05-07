<script setup lang="ts">
import { DToastList } from 'deez-components';
import { onBeforeMount } from 'vue';
import { RouterView } from 'vue-router';

import usePolling from '@/composables/usePolling';
import { useToastStore } from '@/stores/toast';
import { useUserStore } from '@/stores/user';

import AppHeader from './components/AppHeader.vue';

const toastStore = useToastStore();
const userStore = useUserStore();

function getCurrentUser() {
  return userStore.fetchCurrentUser().catch(console.error);
}

const { startPolling } = usePolling(getCurrentUser, 1000 * 60 * 60);

onBeforeMount(() => {
  startPolling();
});
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <!-- <PageLoader :show="showLoader" /> -->
    <AppHeader />
    <RouterView />
    <DToastList :notifications="toastStore.notifications" @dismiss="toastStore.remove" />
  </div>
</template>
