<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DSpinner } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';

const { isAuthenticated, user, isLoading, idTokenClaims } = useAuth0();
</script>

<template>
  <OneColumn h1="My Profile">
    <div v-if="isLoading" class="flex w-full flex-col items-center gap-2">
      <DSpinner />
    </div>
    <div v-else-if="isAuthenticated" class="grid gap-2">
      <img :src="user?.picture" :alt="user?.name" class="mt-6 size-24 rounded-full" />
      <h2 class="mt-2 text-2xl">{{ user?.name }}</h2>
      <h3 class="text-lg text-white/60">{{ user?.email }}</h3>
      <pre class="hljs mt-6 max-w-lg overflow-auto p-3 text-xs"><code>{{ user }}</code></pre>
    </div>
  </OneColumn>
</template>
