<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { DLink } from 'deez-components';

import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

onBeforeMount(() => {
  // fetch the conversations if they are not already loaded
  if (userStore.conversations === null) {
    userStore.fetchConversations();
  }
});
</script>

<template>
  <nav class="px-4 py-3">
    <h2 class="mb-2 text-sm font-bold text-white/60">Conversations</h2>
    <ul class="flex grow flex-col gap-1">
      <li v-for="chat in userStore.conversations" :key="chat.id" class="-mx-2">
        <DLink
          class="flex rounded px-2 py-1.5 text-sm dark:bg-transparent dark:hover:bg-white/5"
          :to="{ name: 'chat', params: { id: chat.id } }"
          :title="chat.title"
          active-class="text-white font-bold dark:bg-white/5"
        >
          <span class="max-w-52 truncate">{{ chat.title }}</span>
        </DLink>
      </li>
    </ul>
  </nav>
</template>
