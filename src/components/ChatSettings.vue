<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { DButton, DCollapse, DRange, DSelect, DTextarea } from 'deez-components';

import { MODELS, useChatStore } from '@/stores/chat';
import { useConversationStore } from '@/stores/conversation';
import { useToastStore } from '@/stores/toast';

const chatStore = useChatStore();
const conversationStore = useConversationStore();
const toastStore = useToastStore();

const route = useRoute();
const router = useRouter();

const isExpanded = useStorage('chatDYS.sidebar.settings.isExpanded', true);

async function handleSave() {
  if (chatStore.messages.length === 0) return;
  try {
    if (route.params.id) {
      await conversationStore.updateConversation(route.params.id);
    } else {
      const post = await conversationStore.createConversation();
      router.push({ name: 'chat', params: { id: post.meta.last_row_id } });
    }
    toastStore.add({ variant: 'success', title: 'Conversation saved!' });
  } catch (err: any) {
    console.error(err);
    toastStore.add({
      variant: 'error',
      title: 'There was a problem saving your conversation.',
      description: err.message,
    });
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
