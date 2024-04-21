<script setup lang="ts">
import { nextTick, onBeforeMount, onMounted, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { DSpinner } from 'deez-components';
import { get as getIDB, set as setIDB } from 'idb-keyval';

import ApiKeyModal from '@/components/ApiKeyModal.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import ChatSidebar from '@/components/ChatSidebar.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { useChatStore } from '@/stores/chat';
import { useConversationStore } from '@/stores/conversation';
import { toastErrorHandler } from '@/utils';
import { CHAT_STORAGE_KEY, STORAGE_APIKEY_OPENAI } from '@/utils/constants';

const route = useRoute();
const router = useRouter();

const chatStore = useChatStore();
const conversationStore = useConversationStore();

async function saveConversation() {
  try {
    const post = await conversationStore.createConversation();
    router.push({ name: 'chat', params: { id: post.meta.last_row_id } });
  } catch (err) {
    toastErrorHandler(err, 'There was a problem saving your conversation.');
  }
}
async function updateMessages() {
  try {
    await conversationStore.updateMessages(route.params.id);
  } catch (err) {
    toastErrorHandler(err, 'There was a problem updating your conversation.');
  }
}

async function handleSend() {
  const apiKey = await getIDB(STORAGE_APIKEY_OPENAI);
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
    if (route.params.id) await updateMessages();
    else await saveConversation();
  } catch (err) {
    toastErrorHandler(err, 'Failed to send prompt.');
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

chatStore.$subscribe((mutation, state) => {
  // persist the whole state to the indexedDB whenever it changes
  setIDB(CHAT_STORAGE_KEY, JSON.stringify(state)).catch(console.error);
});

onBeforeMount(async () => {
  if (!route.params.id) return;
  // use the persisted state if available and the id matches the route params
  const persistedState = await getIDB(CHAT_STORAGE_KEY);
  if (persistedState) {
    const state = JSON.parse(persistedState);
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
