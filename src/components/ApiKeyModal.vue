<script setup lang="ts">
import { DDialog, DInput } from 'deez-components';
import { onMounted, ref } from 'vue';

import { useApiKeyStore } from '@/stores/apiKey';
import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';

const chatStore = useChatStore();
const toastStore = useToastStore();
const apiKeyStore = useApiKeyStore();

const openaiApiKeyInput = ref('');
const anthropicApiKeyInput = ref('');
const errorText = ref('');

async function handleSubmit() {
  errorText.value = '';
  try {
    if (!openaiApiKeyInput.value && !anthropicApiKeyInput.value) {
      throw new Error('Please enter at least one API Key.');
    }

    if (openaiApiKeyInput.value) apiKeyStore.setApiKey('openai', openaiApiKeyInput.value);
    if (anthropicApiKeyInput.value) apiKeyStore.setApiKey('anthropic', anthropicApiKeyInput.value);

    chatStore.isApiKeyModalOpen = false;

    toastStore.add({
      variant: 'success',
      title: 'API key(s) successfully saved',
      description: 'You can change your API Keys anytime from the Profile page.',
      duration: 5000,
    });

    openaiApiKeyInput.value = '';
    anthropicApiKeyInput.value = '';
  } catch (err: any) {
    errorText.value = err.message;
  }
}

onMounted(async () => {
  await apiKeyStore.getApiKeys();
  if (!apiKeyStore.openAiKey && !apiKeyStore.anthropicKey) {
    console.log('No API Keys found in indexedDB.');
    chatStore.isApiKeyModalOpen = true;
  }
});
</script>

<template>
  <DDialog
    v-model:open="chatStore.isApiKeyModalOpen"
    title="Please enter your key(s)."
    confirm-text="Save"
    confirm-form-attr="apiKeyForm"
  >
    <template #trigger>
      <slot />
    </template>
    <template #content>
      <div class="grid gap-3">
        <p class="text-sm leading-normal text-white/60">
          To use the chat you need an OpenAI and/or Anthropic API Key. They will be saved in your
          browser's indexedDB. We <strong>DO NOT</strong> store your API Keys on our servers.
        </p>
        <form id="apiKeyForm" class="grid gap-6" @submit.prevent="handleSubmit">
          <DInput id="openaiApiKey" v-model="openaiApiKeyInput" label="OpenAI API Key" />
          <DInput id="anthropicApiKey" v-model="anthropicApiKeyInput" label="Anthropic API Key" />
          <!-- ERROR -->
          <div v-if="errorText" class="border-l-4 border-red-400 bg-danger-400/10 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span
                  class="i-majesticons-exclamation block size-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm text-danger-200">{{ errorText }}</p>
              </div>
            </div>
          </div>
        </form>
        <p class="text-sm leading-normal text-white/60">
          If you don't have API Keys, you can create them
          <a
            href="https://platform.openai.com/docs/quickstart?context=node"
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-primary-400 hover:underline"
          >
            OpenAI
          </a>
          or
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-primary-400 hover:underline"
            >Anthropic</a
          >.
        </p>
      </div>
    </template>
  </DDialog>
</template>
