<script setup lang="ts">
import { useRouter } from 'vue-router';
import { DButton } from 'deez-components';

import { useChatStore } from '@/stores/chat';

import IconPenSquare from '~icons/lucide/pen-square';

const router = useRouter();
const chatStore = useChatStore();

async function handleNewChat() {
  await chatStore.$reset();
  await router.push({ name: 'chat' });
}
</script>

<template>
  <DButton class="w-full justify-between" variant="primary" @click="handleNewChat">
    New Chat
    <IconPenSquare class="size-4" />
  </DButton>
</template>
