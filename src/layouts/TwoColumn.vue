<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useStorage } from '@vueuse/core';
import { DButton } from 'deez-components';

import IconPanelRight from '~icons/lucide/panel-right-close';
import IconClose from '~icons/majesticons/close';
import IconCog from '~icons/majesticons/settings-cog';

const props = withDefaults(
  defineProps<{
    h1?: string;
  }>(),
  { h1: 'Page Heading' },
);

const sidebarOpen = ref(false);
const isSidebarCollapsed = useStorage('isSidebarCollapsed', false);
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <!-- MAIN LEFT COLUMN -->
    <main class="relative flex-1">
      <div id="chatArea" class="h-full overflow-auto">
        <slot name="heading">
          <h1 class="my-4 px-4 text-xl font-semibold sm:px-6">
            {{ props.h1 }}
            <DButton class="ml-3 lg:hidden" @click="sidebarOpen = true">
              <span class="sr-only">Open sidebar</span>
              <IconCog class="size-4" aria-hidden="true" />
            </DButton>
          </h1>
        </slot>
        <slot name="main" />
        <div class="absolute right-0 top-0 hidden justify-center pt-3.5 lg:flex">
          <DButton
            class="rounded-r-none p-2 dark:bg-gray-700 hover:dark:bg-gray-600"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
          >
            <span class="sr-only">{{ isSidebarCollapsed ? 'Expand' : 'Collapse' }} Settings</span>
            <IconPanelRight
              :class="['size-5', isSidebarCollapsed && 'rotate-180']"
              aria-hidden="true"
            />
          </DButton>
        </div>
      </div>
    </main>

    <!-- DESKTOP STATIC LEFT COLUMN -->
    <aside
      :class="[
        'scrollbar-x-hide relative hidden h-full transform-gpu overflow-auto border-l border-gray-700 bg-gray-950/20 transition-[width_transform] duration-300 lg:block',
        isSidebarCollapsed ? 'w-0 translate-x-full' : 'w-72',
      ]"
    >
      <Transition
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        enter-active-class="transition-opacity delay-200 duration-300"
        leave-active-class="transition-opacity duration-100"
      >
        <slot v-if="!isSidebarCollapsed" name="side" />
      </Transition>
    </aside>
  </div>

  <!-- MOBILE SIDEBAR -->
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
                  <IconClose class="size-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="w-full overflow-auto">
              <slot name="side" />
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
