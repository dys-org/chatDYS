<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { DButton, DTextarea } from 'deez-components';

import AppHeader from '@/components/AppHeader.vue';
import ChatSettings from '@/components/ChatSettings.vue';
import { useChatStore } from '@/stores/chat';

import IconClose from '~icons/majesticons/close';
import IconSend from '~icons/majesticons/send';
import IconCog from '~icons/majesticons/settings-cog';

const chatStore = useChatStore();

const sidebarOpen = ref(false);
const loading = ref(false);

async function handleSend() {
  if (!chatStore.userMessage) {
    alert('You have not added any text to analyze.');
    return;
  }
  loading.value = true;
  await chatStore.sendPrompt().catch(console.error);
  loading.value = false;
}
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppHeader class="shrink-0" />
    <div class="flex w-full flex-1 items-stretch gap-x-8 px-4 py-6 sm:px-6 lg:px-8">
      <main class="relative flex-1">
        <h1 class="mb-8 text-xl font-semibold">Chat</h1>
        <DButton class="lg:hidden" @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <IconCog class="h-4 w-4" aria-hidden="true" />
        </DButton>
        <div class="pb-64">
          <div
            v-for="(message, i) in chatStore.messages"
            :key="i"
            class="flex gap-4 border-b border-gray-600 py-6"
          >
            <div class="basis-24">
              <span class="text-sm font-semibold uppercase">{{ message.role }}</span>
            </div>
            <pre class="mx-auto max-w-lg overflow-auto rounded-md bg-black p-3 text-xs">
              {{ message.content }}
            </pre>
          </div>
        </div>
        <div class="absolute bottom-0 flex w-full justify-center">
          <div class="w-full max-w-[75ch] overflow-y-scroll">
            <DTextarea
              id="userMessage"
              v-model="chatStore.userMessage"
              label="User Message"
              class="absolute inset-0 max-h-52 resize-none pr-10"
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
      </main>
      <aside class="sticky top-8 hidden w-72 shrink-0 lg:block">
        <ChatSettings />
      </aside>
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

        <div class="fixed inset-0 flex justify-end">
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

              <ChatSettings class="p-4" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
