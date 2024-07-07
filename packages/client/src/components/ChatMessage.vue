<script setup lang="ts">
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs';
import { DAvatar, DButton } from 'deez-components';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';
import MarkdownIt from 'markdown-it';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { computed, ref } from 'vue';

import { useUserStore } from '@/stores/user';

const props = withDefaults(
  defineProps<{
    message: ChatCompletionMessageParam | MessageParam;
    disableCopy?: boolean;
  }>(),
  { disableCopy: false },
);

const userStore = useUserStore();

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

const textContent = computed(() => {
  if (typeof props.message.content === 'string') return props.message.content;
  if (Array.isArray(props.message.content)) {
    for (const part of props.message.content) {
      if (part.type === 'text') return part.text;
    }
  }
  return '';
});

const imgContent = computed(() => {
  if (Array.isArray(props.message.content)) {
    for (const part of props.message.content) {
      if (part.type === 'image_url') return part.image_url.url;
    }
  }
  return undefined;
});
</script>

<template>
  <div
    :class="[
      'mx-auto flex gap-4 border-b border-gray-700 px-4 py-6 sm:px-6',
      props.message.role === 'assistant' && 'bg-white/5',
    ]"
  >
    <div class="mx-auto flex w-full max-w-[72ch] gap-x-6 md:gap-x-8">
      <DAvatar
        v-if="userStore.data && props.message.role === 'user'"
        alt="User Avatar"
        :image="userStore.data.avatar_url ?? ''"
        class="size-8"
      />

      <div
        v-else-if="props.message.role === 'assistant'"
        class="grid size-8 place-items-center rounded-full p-1 ring-1 ring-gray-600"
      >
        <span class="i-majesticons-robot-line -mt-0.5 size-full" title="assistant"> </span>
      </div>
      <span v-else class="text-xs font-semibold uppercase">{{ props.message.role }}</span>
      <div class="w-full max-w-[60ch] flex-1">
        <img
          v-if="imgContent"
          :src="imgContent"
          alt="Uploaded Image"
          class="mb-2 block max-h-80 w-auto rounded-lg"
        />
        <div class="chat-message text-sm leading-7" v-html="md.render(textContent)" />
      </div>
      <div class="min-w-[28px]">
        <DButton
          v-if="props.message.role === 'assistant'"
          class="-mt-1 p-1 dark:bg-transparent dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
          :disabled="props.disableCopy"
          @click="handleCopy(props.message.content ?? '')"
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
