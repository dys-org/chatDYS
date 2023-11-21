<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { DButton, DSpinner, DTextarea } from 'deez-components';
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';

import 'prismjs/themes/prism-okaidia.css';

const md = new MarkdownIt().use(prism, { defaultLanguageForUnknown: 'js' });

import ChatSettings from '@/components/ChatSettings.vue';
import { useChatStore } from '@/stores/chat';

import IconClipboardCheck from '~icons/majesticons/clipboard-check-line';
import IconClipboard from '~icons/majesticons/clipboard-line';
import IconClose from '~icons/majesticons/close';
import IconSend from '~icons/majesticons/send';
import IconCog from '~icons/majesticons/settings-cog';

const chatStore = useChatStore();

const sidebarOpen = ref(false);
const loading = ref(false);
const isCopied = ref(false);

async function handleSend() {
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  loading.value = true;
  await chatStore.sendPrompt().catch(console.error);
  loading.value = false;
}

async function handleCopy(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
</script>

<template>
  <div class="flex w-full items-start">
    <!-- CHAT -->
    <main class="relative min-h-[calc(100vh-56px)] flex-1">
      <h1 class="my-4 px-4 text-xl font-semibold sm:px-6">
        Chat
        <DButton class="ml-3 lg:hidden" @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <IconCog class="h-4 w-4" aria-hidden="true" />
        </DButton>
      </h1>
      <div class="pb-32">
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
                @click="handleCopy(message.content)"
              >
                <span class="sr-only">Copy</span>
                <IconClipboardCheck
                  v-if="isCopied"
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
    </main>

    <!-- SETTINGS -->
    <aside
      class="sticky top-0 z-10 hidden min-h-screen w-72 shrink-0 border-l border-gray-700 bg-gray-950/20 lg:block"
    >
      <ChatSettings />
    </aside>

    <!-- INPUT -->
    <div class="fixed bottom-0 flex w-full justify-center lg:pr-72">
      <div class="w-full bg-gradient-to-t from-gray-800 from-60% px-4 py-6">
        <div class="mx-auto w-full max-w-[72ch] overflow-y-scroll">
          <DTextarea
            id="userMessage"
            v-model="chatStore.userMessage"
            label="User Message"
            class="absolute inset-0 max-h-52 resize-none pr-10"
            @keydown.enter.exact.prevent="handleSend"
          >
            <template #before>
              <div
                class="invisible max-h-52 min-h-[36px] overflow-y-hidden whitespace-pre-wrap px-3 py-1.5 pr-10 sm:text-sm sm:leading-6"
              >
                {{ chatStore.userMessage }}
              </div>
            </template>
            <template #after>
              <DButton
                class="absolute bottom-1 right-1 p-1 dark:bg-transparent hover:dark:bg-primary-500"
                @click="handleSend()"
              >
                <span class="sr-only">Send</span>
                <IconSend class="h-5 w-5" />
              </DButton>
            </template>
          </DTextarea>
        </div>
      </div>
    </div>
  </div>

  <TransitionRoot as="template" :show="sidebarOpen">
    <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/80" />
      </TransitionChild>

      <div class="fixed inset-0 flex justify-end overflow-auto">
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel class="relative ml-16 flex w-full max-w-[20rem] flex-1 bg-gray-800">
            <TransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute right-full top-0 flex w-16 justify-center pt-5">
                <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                  <span class="sr-only">Close sidebar</span>
                  <IconClose class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>

            <ChatSettings class="overflow-auto" />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
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
