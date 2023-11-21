<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppHeader />
    <RouterView />
  </div>
</template>
