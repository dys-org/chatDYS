<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="relative isolate h-full overflow-hidden bg-gray-900">
    <div class="grid h-full place-content-center px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div class="max-w-2xl text-center">
        <h2 class="text-4xl font-bold tracking-tight text-white sm:text-5xl">Move Faster.</h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          Slowness anywhere justifies slowness everywhere.
          <br />
          You can and should be extremely thoughtful and still move fast.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <RouterLink
            to="/chat"
            class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Chat
          </RouterLink>
          <RouterLink
            to="/assistant"
            class="text-sm font-semibold leading-6 text-white transition-colors hover:text-sky-400"
          >
            Use an Assistant <span aria-hidden="true">→ </span>
          </RouterLink>
        </div>
      </div>
    </div>
    <svg
      viewBox="0 0 1024 1024"
      class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
      aria-hidden="true"
    >
      <circle
        cx="512"
        cy="512"
        r="512"
        fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
        fill-opacity="0.7"
      />
      <defs>
        <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
          <stop stop-color="#0284c7" />
          <stop offset="1" stop-color="#1f2937" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>
