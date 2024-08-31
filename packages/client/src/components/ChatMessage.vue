<script setup lang="ts">
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs';
import { DAvatar, DButton } from 'deez-components';
import hljsDefineVue from 'highlightjs-vue';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/es/highlight.min.js';
import MarkdownIt from 'markdown-it';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { computed, ref } from 'vue';

import { sleep } from '@/lib';
import { useUserStore } from '@/stores/user';

const props = withDefaults(
  defineProps<{
    message: ChatCompletionMessageParam | MessageParam;
    disableCopy?: boolean;
  }>(),
  { disableCopy: false },
);

const userStore = useUserStore();

hljsDefineVue(hljs);

const md: MarkdownIt = new MarkdownIt({
  highlight: (code, language) => {
    const wrapStart =
      '<pre class="hljs relative">' +
      '<div class="code-container">' +
      `<button type="button" class="copy-button absolute right-0 top-1 rounded px-2.5 py-1.5 leading-none text-white opacity-60 transition-opacity hover:opacity-100 dark:bg-[#011627] disabled:pointer-events-none" aria-label="Copy Code" title="Copy Code" ${props.disableCopy ? 'disabled' : ''}>` +
      '<span class="i-majesticons-clipboard-line size-4" aria-hidden="true"></span>' +
      '</button><code>';
    const wrapEnd = '</code></div></pre>';

    if (language && hljs.getLanguage(language)) {
      try {
        return wrapStart + hljs.highlight(code, { language, ignoreIllegals: true }).value + wrapEnd;
      } catch (err) {
        console.warn('Error highlighting code block.', err);
      }
    }
    return wrapStart + md.utils.escapeHtml(code) + wrapEnd;
  },
});

const isCopying = ref(false);

async function handleCopy(content: string) {
  if (isCopying.value) return;
  try {
    await navigator.clipboard.writeText(content);
    isCopying.value = true;
    await sleep(1500);
  } catch (err) {
    console.error('Failed to copy: ', err);
  } finally {
    isCopying.value = false;
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

async function onCodeCopyClick(button: Element) {
  const container = button.closest('.code-container')?.querySelector('code');
  try {
    await navigator.clipboard.writeText(container?.textContent ?? '');
    const icon = button.querySelector('span');
    icon?.classList.replace('i-majesticons-clipboard-line', 'i-majesticons-clipboard-check-line');
    icon?.classList.add('text-green-400');
    await sleep(1500);
    icon?.classList.replace('i-majesticons-clipboard-check-line', 'i-majesticons-clipboard-line');
    icon?.classList.remove('text-green-400');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

function attachHandlers(el: HTMLElement) {
  el.querySelectorAll('.copy-button').forEach((button) => {
    const handler = () => onCodeCopyClick(button);
    button.addEventListener('click', handler);
    // Store the handler on the button element
    (button as any)._copyHandler = handler;
  });
}

function removeHandlers(el: HTMLElement) {
  el.querySelectorAll('.copy-button').forEach((button) => {
    if ((button as any)._copyHandler) {
      button.removeEventListener('click', (button as any)._copyHandler);
      delete (button as any)._copyHandler;
    }
  });
}

// Custom directive to attach click handlers
const vAttachCopyHandlers = {
  mounted: (el: HTMLElement) => {
    attachHandlers(el);
  },
  updated: (el: HTMLElement) => {
    removeHandlers(el);
    attachHandlers(el);
  },
  unmounted: (el: HTMLElement) => {
    removeHandlers(el);
  },
};
</script>

<template>
  <div
    :class="[
      'mx-auto flex gap-4 border-b border-gray-700 px-4 py-6 sm:px-6',
      props.message.role === 'assistant' && 'bg-white/5',
    ]"
  >
    <div class="mx-auto flex w-full max-w-[72ch] gap-x-6 md:gap-x-7">
      <DAvatar
        v-if="userStore.data && props.message.role === 'user'"
        alt="User Avatar"
        :image="userStore.data.avatar_url ?? ''"
        class="size-8"
      />

      <div
        v-else-if="props.message.role === 'assistant'"
        class="grid size-8 flex-shrink-0 place-items-center rounded-full p-1 ring-1 ring-gray-600"
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
        <div
          v-attach-copy-handlers
          class="chat-message text-sm leading-7"
          aria-live="polite"
          v-html="md.render(textContent)"
        />

        <!-- COPY FULL MESSAGE -->
        <DButton
          v-if="props.message.role === 'assistant' && typeof props.message.content === 'string'"
          class="-mt-1 p-1 dark:bg-transparent dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
          :disabled="props.disableCopy"
          title="Copy Entire Message"
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
    @apply my-4 max-w-[70vw] text-xs;
  }
  & .code-container {
    @apply w-full overflow-auto p-3;
  }
}
</style>
