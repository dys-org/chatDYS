<script setup lang="ts">
import { computed, onBeforeMount, watch } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { DToastList } from 'deez-components';

import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';
import { useUserStore } from '@/stores/user';

import AppHeader from './components/AppHeader.vue';
import PageLoader from './components/PageLoader.vue';

const { isAuthenticated, user, isLoading } = useAuth0();

const chatStore = useChatStore();
const toastStore = useToastStore();
const userStore = useUserStore();

const showLoader = computed(() => isLoading.value);

watch(
  () => !isLoading.value && isAuthenticated.value,
  async (newValue) => {
    if (newValue) {
      // check database for user
      if (!user.value) return;
      try {
        await userStore.fetchCurrentUser();
      } catch (err: any) {
        console.error(err.message);
        // if user not found, create new user
        if (err.status === 404) {
          userStore.createNewUser({
            name: user.value.name ?? '',
            email: user.value.email ?? '',
          });
        }
      }
    }
  },
);

const CHAT_STORAGE_KEY = 'chatDYS.currentChat';

chatStore.$subscribe((mutation, state) => {
  // persist the whole state to the local storage whenever it changes
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
});

onBeforeMount(() => {
  // otherwise load the persisted state from the local storage
  const persistedState = localStorage.getItem(CHAT_STORAGE_KEY);
  if (persistedState) {
    chatStore.$patch(JSON.parse(persistedState));
  }
});
</script>

<template>
  <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
    <PageLoader :show="showLoader" />
    <AppHeader />
    <RouterView />
    <DToastList :notifications="toastStore.notifications" @dismiss="toastStore.remove" />
  </div>
</template>
