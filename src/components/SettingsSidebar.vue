<script setup lang="ts">
import { ref } from 'vue';
import { DRange, DSelect, DTextarea } from 'deez-components';

const models = ['gpt-3.5-turbo', 'gpt-4'];

const presets = [{ value: 'vue-3-convert', display: 'Vue Options to Composition conversion' }];

const selectedPreset = ref('');
const selectedModel = ref('');
const systemMessage = ref('');
const temp = ref(0);
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-xl font-semibold">Settings</h2>
    <DSelect
      id="preset"
      v-model="selectedPreset"
      label="Preset"
      description="Use a group of pre-configured settings."
    >
      <option value="" disabled>Choose a preset</option>
      <option v-for="preset in presets" :key="preset.value" :value="preset.value">
        {{ preset.display }}
      </option>
    </DSelect>

    <div>
      <div class="mb-3 flex justify-between" aria-hidden="true">
        <span class="text-sm leading-6">Temperature</span> <span>{{ temp }}</span>
      </div>
      <DRange
        id="temperature"
        v-model="temp"
        label="Temperature"
        :min="0"
        :max="2"
        :step="0.1"
        hide-label
      />
    </div>

    <DSelect id="model" v-model="selectedModel" label="Model">
      <option value="" disabled>Choose a LLM</option>
      <option v-for="model in models" :key="model">
        {{ model }}
      </option>
    </DSelect>

    <DTextarea id="systemMessage" v-model="systemMessage" label="System Message" />
  </div>
</template>
