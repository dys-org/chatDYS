<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { DToastList } from 'deez-components';

import usePolling from '@/composables/usePolling';
import { useToastStore } from '@/stores/toast';
import { useUserStore } from '@/stores/user';

import AppHeader from './components/AppHeader.vue';

const toastStore = useToastStore();
const userStore = useUserStore();

const { startPolling } = usePolling(userStore.fetchCurrentUser, 60000);

onMounted(() => {
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
