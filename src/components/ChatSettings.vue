<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { DButton, DCollapse, DRange, DSelect, DTextarea } from 'deez-components';

import router from '@/router';
import { MODELS, useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import http from '@/utils/http';

const chatStore = useChatStore();
const userStore = useUserStore();

const isExpanded = useStorage('chatDYS.sidebar.settings.isExpanded', true);

async function saveChat() {
  const post: any = await http.post('/api/conversations', {
    user_id: userStore.user?.id,
    model: chatStore.model,
    temperature: chatStore.temperature,
    max_tokens: chatStore.maxTokens,
    system_message: chatStore.systemMessage,
    messages: JSON.stringify(chatStore.messages),
  });
  router.push({ name: 'chat', params: { id: post.meta.last_row_id } });
}
</script>

<template>
  <DCollapse v-model:defaultOpen="isExpanded" button-text="Settings">
    <div class="flex flex-col gap-8 px-4 pb-6 pt-3">
      <DSelect id="model" v-model="chatStore.model" label="Model">
        <option value="" disabled>Choose an LLM</option>
        <option v-for="model in MODELS" :key="model">
          {{ model }}
        </option>
      </DSelect>

      <div>
        <DRange
          id="temperature"
          v-model="chatStore.temperature"
          label="Temperature"
          :min="0"
          :max="2"
          :step="0.1"
        />
      </div>

      <div>
        <DRange
          id="maxTokens"
          v-model="chatStore.maxTokens"
          label="Max Token Length"
          :min="256"
          :max="4096"
          :step="256"
        />
      </div>

      <DTextarea
        id="systemMessage"
        v-model="chatStore.systemMessage"
        label="System Message"
        :rows="6"
        placeholder="You are a helpful assistant."
      />
      <div class="flex justify-between">
        <!-- <DButton danger @click="chatStore.$reset">Clear</DButton> -->
        <DButton @click="saveChat">Save</DButton>
      </div>
    </div>
  </DCollapse>
</template>
