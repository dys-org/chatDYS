<script setup lang="ts">
import { nextTick, onBeforeMount, onMounted, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { DSpinner } from 'deez-components';

import ApiKeyModal from '@/components/ApiKeyModal.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import ChatSidebar from '@/components/ChatSidebar.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { useChatStore } from '@/stores/chat';
import { useConversationStore } from '@/stores/conversation';
import { useToastStore } from '@/stores/toast';
import { STORAGE_APIKEY_OPENAI } from '@/utils/constants';

const route = useRoute();

const chatStore = useChatStore();
const toastStore = useToastStore();
const conversationStore = useConversationStore();

const openaiApiKeyStorage = useStorage(STORAGE_APIKEY_OPENAI, '');

async function handleSend() {
  if (!openaiApiKeyStorage.value) {
    chatStore.isApiKeyModalOpen = true;
    return;
  }
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  try {
    await chatStore.sendPrompt();
    if (route.params.id) conversationStore.updateMessages(route.params.id);
  } catch (err: any) {
    console.error(err);
    toastStore.add({
      variant: 'error',
      title: 'Failed to send prompt',
      description: err.message,
    });
  }
}
async function scrollToBottom() {
  await nextTick();
  let container = document.querySelector('#chatArea');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
async function fetchChat(paramsId: string | string[]) {
  const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
  chatStore.$reset();
  await chatStore.fetchChat(parseInt(id));
}

watch(
  () => chatStore.textStream,
  () => scrollToBottom(),
);

watch(
  () => chatStore.messages,
  () => scrollToBottom(),
);

onBeforeMount(() => {
  // fetch the chat if there is an id in the route params
  if (route.params.id) {
    fetchChat(route.params.id);
    return;
  }
});

onBeforeRouteUpdate((to) => {
  // fetch the chat if there is an id in the route params
  if (to.params.id) {
    fetchChat(to.params.id);
  }
});

onMounted(() => {
  const input: HTMLElement | null = document.querySelector('#userMessage');
  if (input) input.focus();
});
</script>

<template>
  <TwoColumn h1="Chat">
    <!-- CHAT -->
    <template #main>
      <div class="flex-1 pb-32">
        <ChatMessage v-for="(message, i) in chatStore.messages" :key="i" :message="message" />
        <div v-if="chatStore.loading" class="mt-6 flex w-full flex-col items-center gap-2">
          <DSpinner />
          <div v-if="chatStore.tokenLength" class="text-xs">{{ chatStore.tokenLength }} tokens</div>
        </div>
        <!-- STREAM -->
        <ChatMessage
          v-if="chatStore.textStream"
          :message="{ role: 'assistant', content: chatStore.textStream }"
          disable-copy
        />
      </div>
      <!-- INPUT -->
      <div class="absolute bottom-0 flex w-full justify-center">
        <div class="w-full bg-gradient-to-t from-gray-800 from-60% px-4 pb-8 pt-6">
          <UserMessageInput v-model="chatStore.userMessage" @send="handleSend" />
        </div>
      </div>
    </template>

    <!-- SETTINGS -->
    <template #side>
      <ChatSidebar />
    </template>
  </TwoColumn>

  <!-- MODAL -->
  <ApiKeyModal />
</template>
