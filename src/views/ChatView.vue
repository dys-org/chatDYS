<script setup lang="ts">
import { nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { DButton, DSpinner } from 'deez-components';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';
import MarkdownIt from 'markdown-it';

import ChatSidebar from '@/components/ChatSidebar.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';

import IconClipboardCheck from '~icons/majesticons/clipboard-check-line';
import IconClipboard from '~icons/majesticons/clipboard-line';

const route = useRoute();

const chatStore = useChatStore();
const toastStore = useToastStore();

const md: MarkdownIt = new MarkdownIt({
  highlight: (code, language) => {
    if (language && hljs.getLanguage(language)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(code, { language, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (err) {
        console.warn('Error highlighting code block.', err);
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre>';
  },
});

const copiedIndex = ref<number | null>(null);

async function handleSend() {
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  await chatStore.sendPrompt().catch((err) => {
    console.error(err);
    toastStore.add({
      variant: 'error',
      title: 'Failed to send prompt',
      description: err.message,
    });
  });
}
async function handleCopy(content: string, idx: number) {
  try {
    await navigator.clipboard.writeText(content);
    copiedIndex.value = idx;
    setTimeout(() => {
      copiedIndex.value = null;
    }, 1500);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
async function scrollToBottom() {
  await nextTick();
  let container = document.querySelector('#chatArea');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

async function fetchConversation(paramsId: string | string[]) {
  const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
  chatStore.$reset();
  await chatStore.fetchConversation(parseInt(id));
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
    fetchConversation(route.params.id);
    return;
  }
});

onBeforeRouteUpdate((to, from) => {
  // fetch the chat if there is an id in the route params
  if (to.params.id) {
    fetchConversation(to.params.id);
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
        <div
          v-for="(message, i) in chatStore.messages"
          :key="i"
          :class="[
            'mx-auto flex gap-4 border-b border-gray-700 px-4 py-6 sm:px-6',
            message.role === 'assistant' && 'bg-white/5',
          ]"
        >
          <div class="mx-auto flex w-full max-w-[72ch] gap-x-4">
            <div class="basis-24">
              <span class="text-xs font-semibold uppercase">{{ message.role }}</span>
            </div>
            <div
              class="chat-message mx-auto w-full max-w-[60ch] leading-7"
              v-html="md.render(message.content)"
            />
            <div>
              <DButton
                v-if="message.role === 'assistant'"
                class="-mt-1 p-1 hover:text-white dark:bg-transparent dark:text-white/60 dark:hover:bg-white/5"
                @click="handleCopy(message.content, i)"
              >
                <span class="sr-only">{{ copiedIndex === i ? 'Copied' : 'Copy' }}</span>
                <IconClipboardCheck
                  v-if="copiedIndex === i"
                  class="size-5 text-green-400"
                  aria-hidden="true"
                />
                <IconClipboard v-else class="size-5" aria-hidden="true" />
              </DButton>
            </div>
          </div>
        </div>
        <div v-if="chatStore.loading" class="mt-6 flex w-full flex-col items-center gap-2">
          <DSpinner />
          <div v-if="chatStore.tokenLength" class="text-xs">{{ chatStore.tokenLength }} tokens</div>
        </div>
        <!-- TODO make this a component -->
        <div
          v-if="chatStore.textStream"
          :class="['mx-auto flex gap-4 border-b border-gray-700 bg-white/5 px-4 py-6 sm:px-6']"
        >
          <div class="mx-auto flex w-full max-w-[72ch] gap-x-4">
            <div class="basis-24">
              <span class="text-xs font-semibold uppercase">Assistant</span>
            </div>
            <div
              class="chat-message mx-auto w-full max-w-[60ch] leading-7"
              v-html="md.render(chatStore.textStream)"
            />
            <div>
              <DButton
                class="-mt-1 p-1 hover:text-white dark:bg-transparent dark:text-white/60 dark:hover:bg-white/5"
                disabled
              >
                <IconClipboard class="size-5" aria-hidden="true" />
              </DButton>
            </div>
          </div>
        </div>
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
</template>

<style>
.chat-message {
  @apply text-sm leading-6;

  & ol {
    list-style: decimal;
    margin-left: 1rem;
  }

  & li {
    margin-bottom: 1rem;
  }

  & p {
    margin-bottom: 1rem;
  }

  & .hljs {
    @apply my-4 max-w-lg overflow-auto p-3 text-xs;
  }
}
</style>
