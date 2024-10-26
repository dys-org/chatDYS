<script setup lang="ts">
import { DButton, DSpinner } from 'deez-components';

import ApiKeyModal from '@/components/ApiKeyModal.vue';
import OneColumn from '@/layouts/OneColumn.vue';
import { useUserStore } from '@/stores/user';

const isDev = import.meta.env.DEV;

const userStore = useUserStore();
</script>

<template>
  <OneColumn>
    <h1 class="mb-6 mt-12 text-4xl font-semibold">My Profile</h1>
    <div v-if="userStore.data === undefined" class="flex w-full flex-col items-center gap-2">
      <DSpinner />
    </div>
    <div v-else class="grid gap-4 pb-32">
      <img
        :src="userStore.data.avatar_url ?? ''"
        :alt="userStore.data.name ?? ''"
        class="mt-6 size-24 rounded-full"
      />
      <h2 class="mt-2 text-3xl">{{ userStore.data.name }}</h2>
      <h3 class="text-lg text-white/60">{{ userStore.data.email }}</h3>
      <div class="mt-6">
        <ApiKeyModal>
          <DButton>Change API Key</DButton>
        </ApiKeyModal>
      </div>
      <dl v-if="isDev">
        <dt class="mt-6">User Object</dt>
        <dd class="mt-1">
          <pre
            class="max-w-lg overflow-auto bg-gray-950 p-3 text-xs"
          ><code>{{ userStore.data }}</code></pre>
        </dd>
      </dl>
    </div>
  </OneColumn>
</template>
