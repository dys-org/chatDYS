<script setup lang="ts">
import { nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
import { DSpinner } from 'deez-components';
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';

import ChatSettings from '@/components/ChatSettings.vue';
import UserMessageInput from '@/components/UserMessageInput.vue';
import TwoColumn from '@/layouts/TwoColumn.vue';
import { useChatStore } from '@/stores/chat';

// import { useTokenizeStore } from '@/stores/tokenize';
import 'prismjs/themes/prism-okaidia.css';

import IconClipboardCheck from '~icons/majesticons/clipboard-check-line';
import IconClipboard from '~icons/majesticons/clipboard-line';

const md = new MarkdownIt().use(prism, { defaultLanguageForUnknown: 'js' });

const chatStore = useChatStore();
// const tokenizeStore = useTokenizeStore();

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
async function scrollToBottom() {
  await nextTick();
  let container = document.querySelector('#chatArea');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

watch(
  () => chatStore.textStream,
  (newValue, oldValue) => {
    scrollToBottom();
  },
);

chatStore.$subscribe((mutation, state) => {
  // persist the whole state to the local storage whenever it changes
  localStorage.setItem('chat', JSON.stringify(state));
});

onBeforeMount(() => {
  // load the persisted state from the local storage
  const persistedState = localStorage.getItem('chat');
  if (persistedState) {
    chatStore.$patch(JSON.parse(persistedState));
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
              <button
                v-if="message.role === 'assistant'"
                class="-mt-1 p-1 text-white/60 transition-colors hover:text-white"
                @click="handleCopy(message.content, i)"
              >
                <span class="sr-only">{{ copiedIndex === i ? 'Copied' : 'Copy' }}</span>
                <IconClipboardCheck
                  v-if="copiedIndex === i"
                  class="size-5 text-green-400"
                  aria-hidden="true"
                />
                <IconClipboard v-else class="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="chatStore.loading" class="mt-6 flex w-full flex-col items-center gap-2">
          <DSpinner />
          <!-- <div v-if="tokenizeStore.tokenLength" class="text-xs">
            {{ tokenizeStore.tokenLength }} tokens
          </div> -->
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
              <button
                class="-mt-1 p-1 text-white/60 transition-colors hover:text-white disabled:pointer-events-none disabled:text-white/30"
                disabled
              >
                <IconClipboard class="size-5" aria-hidden="true" />
              </button>
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
