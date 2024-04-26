<script setup lang="ts">
// import { useAuth0 } from '@auth0/auth0-vue';
import { DLink } from 'deez-components';

import LoginButton from './LoginButton.vue';
import NewChatButton from './NewChatButton.vue';
// const { isAuthenticated, isLoading } = useAuth0();
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
      <!-- <Transition
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
      > -->
      <!-- <div v-if="!isLoading" class="flex items-center gap-6 text-white/60"> -->
      <div class="flex items-center gap-6 text-white/60">
        <!-- <NewChatButton v-if="isAuthenticated" /> -->
        <NewChatButton />
        <LoginButton />
      </div>
      <!-- </Transition> -->
    </div>
  </header>
</template>
