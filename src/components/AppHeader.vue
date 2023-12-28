<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

import ChatLogoSVG from '@/components/ChatLogoSVG.vue';

import LoginButton from './LoginButton.vue';
const { isAuthenticated, isLoading } = useAuth0();
</script>

<template>
  <header class="border-b border-gray-700 bg-gray-900 px-4 py-2 sm:px-6">
    <div class="flex items-center justify-between">
      <!-- DYS logo -->
      <RouterLink to="/">
        <span class="sr-only">Home</span>
        <ChatLogoSVG class="h-10 p-1.5 text-gray-300" />
      </RouterLink>
      <div class="flex items-center gap-6 text-white/60">
        <RouterLink to="/chat" class="text-sm font-medium hover:text-white">Chat</RouterLink>
        <RouterLink to="/vision" class="text-sm font-medium hover:text-white">Vision</RouterLink>
        <template v-if="!isLoading">
          <RouterLink
            v-if="isAuthenticated"
            to="/profile"
            class="text-sm font-medium hover:text-white"
          >
            Profile
          </RouterLink>
          <LoginButton />
        </template>
      </div>
    </div>
  </header>
</template>
