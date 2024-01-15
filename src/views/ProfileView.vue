<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { DSpinner } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';
import { useUserStore } from '@/stores/user';

const { isAuthenticated, user, isLoading } = useAuth0();

const userStore = useUserStore();

onBeforeMount(() => {
  if (userStore.user !== null) return;
  userStore.fetchCurrentUser();
});
</script>

<template>
  <OneColumn h1="My Profile">
    <div v-if="isLoading" class="flex w-full flex-col items-center gap-2">
      <DSpinner />
    </div>
    <div v-else-if="isAuthenticated" class="grid gap-4 pb-32">
      <img :src="user?.picture" :alt="user?.name" class="mt-6 size-24 rounded-full" />
      <h2 class="mt-2 text-3xl">{{ user?.name }}</h2>
      <h3 class="text-lg text-white/60">{{ user?.email }}</h3>
      <dl>
        <dt class="mt-6">Auth0 User</dt>
        <dd class="mt-1">
          <pre class="max-w-lg overflow-auto bg-gray-950 p-3 text-xs"><code>{{ user }}</code></pre>
        </dd>
        <dt class="mt-6">ChatDYS User</dt>
        <dd class="mt-1">
          <pre
            class="max-w-lg overflow-auto bg-gray-950 p-3 text-xs"
          ><code>{{ userStore.user }}</code></pre>
        </dd>
      </dl>
    </div>
  </OneColumn>
</template>
