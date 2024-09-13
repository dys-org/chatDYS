<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { DCollapse, DDropdown, DRadioGroup, DRange, DSelect, DTextarea } from 'deez-components';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useSystemPresets } from '@/composables/queries';
import { useApiKeyStore } from '@/stores/apiKey';
import { ANTHROPIC_MODELS, OPENAI_MODELS, useChatStore } from '@/stores/chat';

const router = useRouter();
const route = useRoute();
const chatStore = useChatStore();
const apiKeyStore = useApiKeyStore();

const { data: presetList } = useSystemPresets();

const models = computed(() => (chatStore.provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS));

const shouldDisableSettings = computed(() => !!route.params.id);

const options = computed(() => {
  const opts = presetList.value?.map((preset) => ({
    label: preset.name,
    key: preset.id,
    fn: () => (chatStore.systemMessage = preset.text ?? ''),
  }));
  return [
    ...(opts ?? []),
    { divider: true, key: 'd1' },
    {
      label: 'Edit Presets',
      key: 'edit_presets',
      fn: () => router.push({ name: 'systemPresets' }),
    },
  ];
});

const providerOptions = computed(() => [
  ...(apiKeyStore.openAiKey ? [{ id: 'openai', label: 'Open AI', value: 'openai' }] : []),
  ...(apiKeyStore.anthropicKey
    ? [{ id: 'anthropic', label: 'Anthropic', value: 'anthropic' }]
    : []),
]);

watch(
  () => chatStore.provider,
  (newVal) => {
    if (newVal === 'anthropic') chatStore.model = ANTHROPIC_MODELS[0];
    if (newVal === 'openai') chatStore.model = OPENAI_MODELS[0];
  },
);

const isExpanded = useStorage('chatDYS.sidebar.settings.isExpanded', true);
</script>

<template>
  <DCollapse v-model:default-open="isExpanded" button-text="Settings">
    <div :class="['flex flex-col gap-8 px-4 pb-6 pt-3', shouldDisableSettings && 'opacity-50']">
      <DRadioGroup
        v-model="chatStore.provider"
        name="provider"
        legend="Choose Provider"
        inline
        :options="providerOptions"
        :disabled="shouldDisableSettings"
      />
      <DSelect id="model" v-model="chatStore.model" label="Model" :disabled="shouldDisableSettings">
        <option value="" disabled>Choose an LLM</option>
        <option v-for="model in models" :key="model">
          {{ model }}
        </option>
      </DSelect>

      <div>
        <DRange
          id="temperature"
          v-model="chatStore.temperature"
          label="Temperature"
          :min="0"
          :max="chatStore.provider === 'anthropic' ? 1 : 2"
          :step="0.1"
          :disabled="shouldDisableSettings"
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
          :disabled="shouldDisableSettings"
        />
      </div>

      <fieldset class="relative" :disabled="shouldDisableSettings">
        <div class="w mb-2 flex items-center justify-between">
          <legend class="text-sm font-semibold">System Message</legend>
          <DDropdown
            :options="options"
            label="Preset"
            button-class="px-2 py-1 text-sm"
            menu-class="w-48"
            align="end"
          />
        </div>
        <DTextarea
          id="systemMessage"
          v-model="chatStore.systemMessage"
          hide-label
          label="Message"
          :rows="6"
          placeholder="You are a helpful assistant."
        />
      </fieldset>
    </div>
  </DCollapse>
</template>
