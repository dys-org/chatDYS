<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { DButton, DLink } from 'deez-components';

import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';

import IconPenSquare from '~icons/lucide/pen-square';

const userStore = useUserStore();
const chatStore = useChatStore();

const router = useRouter();

async function handleNewChat() {
  chatStore.$reset();
  await router.push({ name: 'chat' });
}

onBeforeMount(() => {
  // fetch the conversations if they are not already loaded
  if (userStore.conversations === null) {
    userStore.fetchConversations();
  }
});
</script>

<template>
  <nav>
    <ul class="flex grow flex-col gap-2 px-4 py-3">
      <li class="-mx-2">
        <DButton
          class="w-full justify-between px-2 dark:bg-transparent dark:hover:bg-white/5"
          @click="handleNewChat"
        >
          New Chat
          <IconPenSquare class="size-4" />
        </DButton>
      </li>
      <li v-for="chat in userStore.conversations" :key="chat.id" class="-mx-2">
        <DLink
          class="flex rounded px-2 py-1.5 text-sm dark:bg-transparent dark:hover:bg-white/5"
          :to="{ name: 'chat', params: { id: chat.id } }"
          :title="chat.title"
        >
          <span class="max-w-52 truncate">{{ chat.title }}</span>
        </DLink>
      </li>
    </ul>
  </nav>
</template>
