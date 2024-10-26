<script setup lang="ts">
import { useRoute } from 'vue-router';

import OneColumn from '@/layouts/OneColumn.vue';

const route = useRoute();
</script>

<template>
  <OneColumn>
    <div class="grid h-full place-content-center text-center">
      <h1 class="mb-2 text-6xl font-thin">404</h1>
      <p class="font-sans text-2xl font-light">
        Not Found:
        <span class="bg-gray-4 ml-1 inline-block rounded-sm px-2 py-0.5 font-mono">
          {{ route.path }}
        </span>
      </p>
      <img
        src="@/assets/img/chat-dys.svg"
        alt="chat DYS"
        class="mx-auto mt-4 block h-9 opacity-20 sm:h-10"
      />
    </div>
  </OneColumn>
</template>
