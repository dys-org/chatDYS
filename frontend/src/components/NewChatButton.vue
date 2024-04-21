<script setup lang="ts">
import { useRouter } from 'vue-router';
import { DButton } from 'deez-components';

import { useChatStore } from '@/stores/chat';

const router = useRouter();
const chatStore = useChatStore();

async function handleNewChat() {
  chatStore.$reset();
  await router.push({ name: 'chat' });
}
</script>

<template>
  <DButton class="w-full justify-between" variant="primary" @click="handleNewChat">
    New Chat
    <span class="i-lucide-pen-square size-4"></span>
  </DButton>
</template>
