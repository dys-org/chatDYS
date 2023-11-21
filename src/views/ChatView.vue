<script setup lang="ts">
import { ref } from 'vue';
import { DSpinner } from 'deez-components';
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';

import ChatSettings from '@/components/ChatSettings.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { useChatStore } from '@/stores/chat';

import 'prismjs/themes/prism-okaidia.css';

import IconClipboardCheck from '~icons/majesticons/clipboard-check-line';
import IconClipboard from '~icons/majesticons/clipboard-line';

const md = new MarkdownIt().use(prism, { defaultLanguageForUnknown: 'js' });

const chatStore = useChatStore();

const loading = ref(false);
const copiedIndex = ref<number | null>(null);

async function handleSend() {
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  loading.value = true;
  await chatStore.sendPrompt().catch(console.error);
  loading.value = false;
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
              <button
                v-if="message.role === 'assistant'"
                class="-mt-1 p-1 text-white/60 transition-colors hover:text-white"
                @click="handleCopy(message.content, i)"
              >
                <span class="sr-only">{{ copiedIndex === i ? 'Copied' : 'Copy' }}</span>
                <IconClipboardCheck
                  v-if="copiedIndex === i"
                  class="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
                <IconClipboard v-else class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="chatStore.loading" class="mt-6 flex w-full justify-center">
          <DSpinner />
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
      <ChatSettings />
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

  & pre {
    margin-top: 1rem;
    margin-bottom: 1rem;
    overflow: auto;
    @apply max-w-lg text-xs;
  }
}
</style>
