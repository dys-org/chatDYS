<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DSpinner } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';

const { isAuthenticated, user, isLoading } = useAuth0();
</script>

<template>
  <OneColumn h1="User Profile">
    <div v-if="isLoading" class="mt-6 flex w-full flex-col items-center gap-2">
      <DSpinner />
    </div>
    <div v-else-if="isAuthenticated">
      <img :src="user?.picture" :alt="user?.name" class="mt-12 h-36 w-36 rounded-full" />
      <dl class="mt-6 text-sm">
        <dt class="mb-1 font-semibold">Name</dt>
        <dd class="mb-6">{{ user?.name }}</dd>
        <dt class="mb-1 font-semibold">Email</dt>
        <dd class="mb-6">{{ user?.email }}</dd>
        <dt class="mb-1 font-semibold">User Object</dt>
        <dd class="mb-6">
          <pre class="hljs mb-6 max-w-lg overflow-auto p-3 text-xs"><code>{{ user }}</code></pre>
        </dd>
      </dl>
    </div>
  </OneColumn>
</template>
