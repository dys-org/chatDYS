<script setup lang="ts">
import { DLink } from 'deez-components';

import { useUserStore } from '@/stores/user';

import LoginButton from './LoginButton.vue';
import NewChatButton from './NewChatButton.vue';

const userStore = useUserStore();
</script>

<template>
  <header class="border-b border-gray-700 bg-gray-900 px-4 py-2 sm:px-6">
    <div class="flex items-center justify-between">
      <!-- DYS logo -->
      <DLink to="/">
        <span class="sr-only">Home</span>
        <img
          src="@/assets/img/chat-dys.svg"
          alt="chat DYS"
          class="h-10 p-1.5 pl-0 opacity-80 transition-opacity hover:opacity-100"
        />
      </DLink>

      <div class="flex items-center gap-6 text-white/60">
        <NewChatButton v-if="userStore.isLoggedIn" />
        <LoginButton />
      </div>
    </div>
  </header>
</template>
