<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { D1Result } from '@cloudflare/workers-types';
import { useStorage } from '@vueuse/core';
import { DButton, DCollapse, DRange, DSelect, DTextarea } from 'deez-components';

import router from '@/router';
import { MODELS, useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import http from '@/utils/http';

const chatStore = useChatStore();
const userStore = useUserStore();

const route = useRoute();

const isExpanded = useStorage('chatDYS.sidebar.settings.isExpanded', true);

const conversation = computed(() => ({
  user_id: userStore.user?.id,
  model: chatStore.model,
  temperature: chatStore.temperature,
  max_tokens: chatStore.maxTokens,
  system_message: chatStore.systemMessage,
  messages: JSON.stringify(chatStore.messages),
}));

async function createConversation() {
  const post: D1Result<Record<string, unknown>> = await http.post(
    '/api/conversations',
    conversation.value,
  );
  router.push({ name: 'chat', params: { id: post.meta.last_row_id } });
}
async function updateConversation(paramsId: string | string[]) {
  const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
  await http.put(`/api/conversations/${id}`, conversation.value);
}

async function handleSave() {
  try {
    if (route.params.id) {
      await updateConversation(route.params.id);
    } else {
      await createConversation();
      await userStore.fetchConversations();
    }
  } catch (err) {
    console.error(err);
  }
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
        <DButton @click="handleSave">Save</DButton>
      </div>
    </div>
  </DCollapse>
</template>
