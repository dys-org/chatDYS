<script setup lang="ts">
import { DButton } from 'deez-components';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';
import MarkdownIt from 'markdown-it';
import { ref } from 'vue';

import { type Message } from '@/stores/chat';

const props = withDefaults(
  defineProps<{
    message: Message;
    disableCopy?: boolean;
  }>(),
  { disableCopy: false },
);

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

const isCopying = ref(false);

async function handleCopy(content: string) {
  if (isCopying.value) return;
  try {
    await navigator.clipboard.writeText(content);
    isCopying.value = true;
    setTimeout(() => {
      isCopying.value = false;
    }, 1500);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
</script>

<template>
  <div
    :class="[
      'mx-auto flex gap-4 border-b border-gray-700 px-4 py-6 sm:px-6',
      props.message.role === 'assistant' && 'bg-white/5',
    ]"
  >
    <div class="mx-auto flex w-full max-w-[72ch] gap-x-4">
      <div class="basis-24">
        <span class="text-xs font-semibold uppercase">{{ props.message.role }}</span>
      </div>
      <div
        class="chat-message mx-auto w-full max-w-[60ch] leading-7"
        v-html="md.render(props.message.content)"
      />
      <div class="min-w-[28px]">
        <DButton
          v-if="props.message.role === 'assistant'"
          class="-mt-1 p-1 dark:bg-transparent dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
          :disabled="props.disableCopy"
          @click="handleCopy(props.message.content)"
        >
          <span class="sr-only">{{ isCopying ? 'Copied' : 'Copy' }}</span>
          <span
            v-if="isCopying"
            class="i-majesticons-clipboard-check-line size-5 text-green-400"
            aria-hidden="true"
          ></span>
          <span v-else class="i-majesticons-clipboard-line size-5" aria-hidden="true"></span>
        </DButton>
      </div>
    </div>
  </div>
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
