<script setup lang="ts">
import { DToastList } from 'deez-components';
import { RouterView } from 'vue-router';

import { useToastStore } from '@/stores/toast';

import AppHeader from './components/AppHeader.vue';

const toastStore = useToastStore();
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <AppHeader />
    <RouterView />
    <DToastList :notifications="toastStore.notifications" @dismiss="toastStore.remove" />
  </div>
</template>
