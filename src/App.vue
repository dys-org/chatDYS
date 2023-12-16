<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';

import AppHeader from './components/AppHeader.vue';

const route = useRoute();
</script>

<template>
  <div class="flex h-screen flex-1 flex-col overflow-hidden">
    <AppHeader v-if="route.meta.requiresAuth" />
    <RouterView />
  </div>
</template>
