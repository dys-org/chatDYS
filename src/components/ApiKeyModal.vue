<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DInput, DModal } from 'deez-components';
import { get as getIDB, set as setIDB } from 'idb-keyval';

import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';
import { STORAGE_APIKEY_OPENAI } from '@/utils/constants';

const chatStore = useChatStore();
const toastStore = useToastStore();

const openaiApiKeyInput = ref('');

async function handleSubmit() {
  try {
    await setIDB(STORAGE_APIKEY_OPENAI, openaiApiKeyInput.value);
    chatStore.isApiKeyModalOpen = false;
    toastStore.add({
      variant: 'success',
      title: 'API key successfully saved',
      description: 'You can change your API Key anytime from the Profile page.',
    });
  } catch (err: any) {
    console.error(err);
    toastStore.add({ variant: 'error', title: 'Error saving API Key', description: err.message });
  }
}

onMounted(async () => {
  const apiKey = await getIDB(STORAGE_APIKEY_OPENAI);
  if (!apiKey) {
    console.log('No API Key found in indexedDB.');
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
          To use the chat you need an OpenAI API Key. It will be saved in your browser's indexedDB.
          We <strong>DO NOT</strong> store your API Key on our servers.
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
