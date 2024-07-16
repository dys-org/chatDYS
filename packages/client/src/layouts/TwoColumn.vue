<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useStorage } from '@vueuse/core';
import { DButton } from 'deez-components';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    h1?: string;
  }>(),
  { h1: 'Page Heading' },
);

const sidebarOpen = ref(false);
const chatAreaScroll = ref(0);
const isSidebarExpanded = useStorage('chatDYS.sidebar.isExpanded', true);

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  console.log(target.scrollTop);
  chatAreaScroll.value = target.scrollTop;
}

function backToTop() {
  const container = document.querySelector('#chatArea');
  container?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <!-- MAIN LEFT COLUMN -->
    <main class="relative flex-1">
      <div id="chatArea" class="h-full overflow-auto" @scroll="handleScroll">
        <slot name="heading">
          <h1 class="my-4 px-4 text-xl font-semibold sm:px-6">
            {{ props.h1 }}
          </h1>
        </slot>
        <slot name="main" />
        <div class="absolute right-0 top-0 flex justify-center pt-3.5">
          <DButton
            class="hidden rounded-r-none p-1.5 lg:block dark:bg-gray-700 hover:dark:bg-gray-600"
            @click="isSidebarExpanded = !isSidebarExpanded"
          >
            <span class="sr-only">{{ isSidebarExpanded ? 'Collapse' : 'Expand' }} Settings</span>
            <span
              :class="[
                'i-majesticons-menu-expand-left block size-6',
                isSidebarExpanded && 'rotate-180',
              ]"
              aria-hidden="true"
            ></span>
          </DButton>
          <DButton
            class="rounded-r-none p-1.5 lg:hidden dark:bg-gray-700 hover:dark:bg-gray-600"
            @click="sidebarOpen = true"
          >
            <span class="sr-only">Open sidebar</span>
            <span class="i-majesticons-menu-expand-left block size-6" aria-hidden="true"></span>
          </DButton>
        </div>
      </div>
      <DButton
        class="dark:hover:bg-primary-500 absolute bottom-36 end-6 size-11 justify-center rounded-full p-0.5 shadow-lg transition-all duration-300 ease-in-out active:shadow-xl"
        :class="[chatAreaScroll < 20 ? 'invisible opacity-0' : 'visible']"
        @click="backToTop"
      >
        <span class="sr-only">Scroll to top</span>
        <span class="i-lucide-arrow-big-up mt-0.5 size-7" />
      </DButton>
    </main>

    <!-- DESKTOP STATIC LEFT COLUMN -->
    <aside
      :class="[
        'relative hidden h-full transform-gpu overflow-auto border-l border-gray-700 bg-gray-950/20 transition-[width_transform] duration-300 lg:block',
        !isSidebarExpanded ? 'w-0 translate-x-full' : 'w-72',
      ]"
    >
      <Transition
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        enter-active-class="transition-opacity delay-200 duration-300"
        leave-active-class="transition-opacity duration-100"
      >
        <div v-show="isSidebarExpanded">
          <slot name="side" />
        </div>
      </Transition>
    </aside>
  </div>

  <!-- MOBILE SIDEBAR -->
  <TransitionRoot as="template" :show="sidebarOpen">
    <Dialog as="div" class="relative z-50 lg:hidden" u @close="sidebarOpen = false">
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
                <button
                  type="button"
                  class="focus-visible:outline-primary-500 -m-2.5 rounded p-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <span
                    class="i-majesticons-close block size-6 text-white"
                    aria-hidden="true"
                  ></span>
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
