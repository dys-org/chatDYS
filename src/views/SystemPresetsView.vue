<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { DButton, DInput, DLink, DTextarea } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';
import { type SystemPreset, useSystemPresetsStore } from '@/stores/systemPresets';
import { errorHandler } from '@/utils';

import IconChevronLeft from '~icons/majesticons/chevron-left';
import IconMinus from '~icons/majesticons/minus';
import IconPlus from '~icons/majesticons/plus';

const systemPresetStore = useSystemPresetsStore();

const selectedPreset = ref<SystemPreset | null>(null);
const name = ref('');
const text = ref('');

watch(selectedPreset, (newVal, _) => {
  name.value = newVal?.name || '';
  text.value = newVal?.text || '';
});

async function addNewPreset() {
  await systemPresetStore
    .createSystemPreset({
      name: 'New Preset',
      text: 'You are a helpful assistant.',
    })
    .catch((err) => errorHandler(err, 'There was a problem creating the preset.'));
}

async function updatePreset() {
  if (selectedPreset.value == null) return;
  await systemPresetStore
    .updateSystemPreset({
      id: selectedPreset.value.id,
      name: name.value,
      text: text.value,
    })
    .catch((err) => errorHandler(err, 'There was a problem updating the preset.'));
}

async function deletePreset() {
  if (selectedPreset.value?.id === undefined) return;
  await systemPresetStore
    .deleteSystemPreset(selectedPreset.value?.id)
    .catch((err) => errorHandler(err, 'There was a problem deleting the preset.'));
}

onBeforeMount(() => {
  // fetch the preset system messages if they are not already loaded
  if (systemPresetStore.presetList === null) {
    systemPresetStore.fetchPresetList();
  }
});
</script>

<template>
  <OneColumn>
    <DLink :to="{ name: 'chat' }" class="mb-2 mt-12 flex items-center gap-1 text-primary-500">
      <IconChevronLeft class="-ml-1 size-5" aria-hidden="true" />
      Back to Chat
    </DLink>
    <h1 class="mb-16 text-4xl font-semibold">System Message Presets</h1>
    <form class="grid gap-8 md:grid-cols-2 md:gap-16" @submit.prevent="updatePreset">
      <div>
        <div>
          <label for="preset" class="block text-sm font-semibold leading-6">System Messages</label>
          <select
            id="preset"
            v-model="selectedPreset"
            size="5"
            name="preset"
            class="mt-2 block w-full rounded-md border-0 bg-white/5 px-3 py-2 ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-primary-500 sm:text-sm sm:leading-6"
          >
            <option value="" disabled class="py-1">Select Message</option>
            <option
              v-for="preset in systemPresetStore.presetList"
              :key="preset.id"
              :value="preset"
              class="py-1"
            >
              {{ preset.name }}
            </option>
          </select>
        </div>
        <div class="mt-4 flex gap-0.5">
          <DButton class="justify-self-start rounded-r-none px-2.5" @click="addNewPreset">
            <IconPlus class="size-4" aria-hidden="true" />
          </DButton>
          <DButton
            class="justify-self-start rounded-l-none px-2.5"
            :disabled="!selectedPreset?.id"
            @click="deletePreset"
          >
            <IconMinus class="size-4" aria-hidden="true" />
          </DButton>
        </div>
      </div>
      <div class="grid gap-8">
        <DInput id="name" v-model="name" label="Name" />
        <DTextarea id="text" v-model="text" label="Text" :rows="6" />
        <DButton
          type="submit"
          variant="primary"
          class="justify-self-end"
          :disabled="selectedPreset == null"
        >
          Save
        </DButton>
      </div>
    </form>
  </OneColumn>
</template>