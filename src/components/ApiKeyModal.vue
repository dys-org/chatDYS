<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { DInput, DModal } from 'deez-components';

import { useChatStore } from '@/stores/chat';
import { STORAGE_APIKEY_OPENAI } from '@/utils/constants';

const chatStore = useChatStore();

const openaiApiKeyStorage = useStorage(STORAGE_APIKEY_OPENAI, '');

const openaiApiKeyInput = ref('');

function handleSubmit() {
  openaiApiKeyStorage.value = openaiApiKeyInput.value;
  chatStore.isApiKeyModalOpen = false;
}

onMounted(() => {
  if (!openaiApiKeyStorage.value) {
    console.log('No API Key found in local storage.');
    chatStore.isApiKeyModalOpen = true;
  }
});
</script>

<template>
  <DModal
    v-model:open="chatStore.isApiKeyModalOpen"
    title="Please enter your OpenAI API Key."
    confirm-text="Save"
    confirm-form-attr="apiKeyForm"
  >
    <template #content>
      <div class="grid gap-3">
        <p class="text-sm text-white/60">
          To use the chat you need an OpenAI API Key. It will be saved in your browser's local
          storage. We <strong>DO NOT</strong> store your API Key on our servers.
        </p>
        <form id="apiKeyForm" @submit.prevent="handleSubmit">
          <DInput id="openaiApiKey" v-model="openaiApiKeyInput" label="OpenAI API Key" required />
        </form>
        <p class="text-sm text-white/60">
          If you don't have an API Key, you can create one
          <a
            href="https://platform.openai.com/docs/quickstart?context=node"
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-primary-400 hover:underline"
            >here</a
          >.
        </p>
      </div>
    </template>
  </DModal>
</template>
