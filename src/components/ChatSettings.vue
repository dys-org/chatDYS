<script setup lang="ts">
import { DButton, DRange, DSelect, DTextarea } from 'deez-components';

import { MODELS, useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
</script>

<template>
  <div class="flex flex-col gap-8 p-4 pb-12">
    <h2 class="text-xl font-semibold">Settings</h2>
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
    <div>
      <DButton @click="chatStore.$reset">Clear</DButton>
    </div>
  </div>
</template>
