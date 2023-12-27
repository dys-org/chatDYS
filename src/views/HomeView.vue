<script setup lang="ts">
import { RouterLink } from 'vue-router';

import ChatLogoSVG from '@/components/ChatLogoSVG.vue';
</script>

<template>
  <div class="h-full overflow-hidden bg-radial-glow">
    <div class="grid h-full place-content-center px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div class="max-w-2xl text-center">
        <h2
          class="mt-8 flex flex-wrap items-center justify-center gap-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl"
        >
          Move faster with
          <ChatLogoSVG class="inline-block h-9 sm:h-12" />
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          Slowness anywhere justifies slowness everywhere.
          <br />
          You can and should be extremely thoughtful and still move fast.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <RouterLink
            to="/chat"
            class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Chat
          </RouterLink>
          <RouterLink
            to="/vision"
            class="text-sm font-semibold leading-6 text-white transition-colors hover:text-sky-400"
          >
            Play with images <span aria-hidden="true">→ </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
