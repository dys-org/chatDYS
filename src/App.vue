<script setup lang="ts">
import { DToastList } from 'deez-components';
import { RouterView, useRoute } from 'vue-router';

import { useToastStore } from '@/stores/toast';

import AppHeader from './components/AppHeader.vue';

const toastStore = useToastStore();
const route = useRoute();
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <AppHeader />
    <RouterView />
    <DToastList
      v-if="route.meta.requiresAuth"
      :notifications="toastStore.notifications"
      @dismiss="toastStore.remove"
    />
  </div>
</template>
