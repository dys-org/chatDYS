<script setup lang="ts">
import { DSpinner } from 'deez-components';
import { get as getIDB, set as setIDB } from 'idb-keyval';
import { nextTick, onBeforeMount, onMounted, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import ApiKeyModal from '@/components/ApiKeyModal.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import ChatSidebar from '@/components/ChatSidebar.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import { useCreateConversation, useUpdateConversation } from '@/composables/mutations';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { toastErrorHandler } from '@/lib';
import { IDB_CHAT } from '@/lib/constants';
import { useApiKeyStore } from '@/stores/apiKey';
import { useChatStore } from '@/stores/chat';

const route = useRoute();

const chatStore = useChatStore();
const apiKeyStore = useApiKeyStore();
const createConversation = useCreateConversation();
const updateConversation = useUpdateConversation();

async function handleSend() {
  const apiKey = chatStore.provider === 'openai' ? apiKeyStore.openAiKey : apiKeyStore.anthropicKey;
  if (!apiKey) {
    chatStore.isApiKeyModalOpen = true;
    return;
  }
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  try {
    await chatStore.sendPrompt();

    if (route.params.id) {
      const id = typeof route.params.id === 'string' ? route.params.id : route.params.id[0];
      updateConversation.mutate({
        id,
        data: {
          messages: JSON.stringify(chatStore.messages),
        },
      });
    } else {
      createConversation.mutate(chatStore.currentChat);
    }
  } catch (err) {
    toastErrorHandler(err, 'Failed to send prompt.');
  }
}

async function scrollToBottom() {
  const container = document.querySelector('#chatArea');
  await nextTick();
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

async function fetchChat(paramsId: string | string[]) {
  const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
  chatStore.$reset();
  await chatStore.fetchChat(id);
}

watch(
  () => chatStore.messages,
  () => scrollToBottom(),
  { deep: true },
);

chatStore.$subscribe((_, state) => {
  // persist the whole state to the indexedDB whenever it changes
  setIDB(IDB_CHAT, JSON.stringify(state)).catch(console.error);
});

onBeforeMount(async () => {
  if (!route.params.id) return;
  // use the persisted state if available and the id matches the route params
  const persistedState = await getIDB(IDB_CHAT);
  if (persistedState) {
    const state = JSON.parse(persistedState) as any;
    if (state.id !== route.params.id) return;
    chatStore.$patch(state);
    return;
  }
  // otherwise fetch the chat by id
  fetchChat(route.params.id);
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
          <!-- <div v-if="chatStore.tokenLength" class="text-xs">{{ chatStore.tokenLength }} tokens</div> -->
        </div>
      </div>
      <!-- INPUT -->
      <div class="absolute bottom-0 flex w-full justify-center">
        <div class="w-full bg-gradient-to-t from-gray-800 from-60% px-4 pb-8 pt-6">
          <UserMessageInput
            v-model="chatStore.userMessage"
            v-model:base64-img="chatStore.base64ImgUpload"
            @send="handleSend"
          />
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
