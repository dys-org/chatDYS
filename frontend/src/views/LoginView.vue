<script setup lang="ts">
import OneColumn from '@/layouts/OneColumn.vue';
</script>

<template>
  <OneColumn>
    <div class="grid h-full place-content-center">
      <div class="grid place-items-center gap-y-8 text-center">
        <h1
          class="mt-8 flex flex-wrap items-center justify-center gap-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl"
        >
          Welcome to
          <img src="@/assets/img/chat-dys.svg" alt="chat DYS" class="inline-block h-9 sm:h-12" />
        </h1>
        <a
          href="/auth/login/github"
          class="inline-flex items-center gap-x-2 rounded px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-60 dark:bg-primary-500 dark:hover:bg-primary-400"
        >
          Sign in with GitHub
          <span class="i-lucide-github text-lg" aria-hidden="true"></span>
        </a>
      </div>
    </div>
  </OneColumn>
</template>
