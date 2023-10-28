<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { DButton } from 'deez-components';

import AppHeader from '@/components/AppHeader.vue';
import SettingsSidebar from '@/components/SettingsSidebar.vue';

import IconClose from '~icons/majesticons/close';
import IconCog from '~icons/majesticons/settings-cog';

const sidebarOpen = ref(false);
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppHeader class="shrink-0" />
    <div class="flex w-full flex-1 items-start gap-x-8 px-4 py-6 sm:px-6 lg:px-8">
      <main class="flex-1">
        <h1 class="text-xl font-semibold">Chat</h1>
        <DButton class="lg:hidden" @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <IconCog class="h-4 w-4" aria-hidden="true" />
        </DButton>
      </main>
      <aside class="sticky top-8 hidden w-72 shrink-0 lg:block">
        <SettingsSidebar />
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

              <SettingsSidebar class="p-4" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
