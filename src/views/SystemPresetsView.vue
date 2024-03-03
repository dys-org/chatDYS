<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { DButton, DInput, DLink, DSelect, DTextarea } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';
import { type SystemPreset, useSystemPresetsStore } from '@/stores/systemPresets';
import { toastErrorHandler } from '@/utils';

import IconChevronLeft from '~icons/majesticons/chevron-left';
import IconMinus from '~icons/majesticons/minus';
import IconPlus from '~icons/majesticons/plus';

const systemPresetStore = useSystemPresetsStore();
const router = useRouter();

const selectedPreset = ref<SystemPreset>();
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
    .catch((err) => toastErrorHandler(err, 'There was a problem creating the preset.'));
}

async function updatePreset() {
  if (selectedPreset.value == null) return;
  await systemPresetStore
    .updateSystemPreset({
      id: selectedPreset.value.id,
      name: name.value,
      text: text.value,
    })
    .catch((err) => toastErrorHandler(err, 'There was a problem updating the preset.'));
}

async function deletePreset() {
  if (selectedPreset.value?.id === undefined) return;
  try {
    await systemPresetStore.deleteSystemPreset(selectedPreset.value?.id);
    selectedPreset.value = undefined;
  } catch (err) {
    toastErrorHandler(err, 'There was a problem deleting the preset.');
  }
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
    <DLink
      to=""
      class="mb-2 mt-12 transition-colors hover:underline focus:underline dark:text-primary-500 dark:hover:text-primary-400"
      @click="router.go(-1)"
    >
      <IconChevronLeft class="-ml-1 size-5" aria-hidden="true" />
      Back to Chat
    </DLink>
    <h1 class="mb-16 text-4xl font-semibold">System Message Presets</h1>
    <form class="grid gap-8 md:grid-cols-2 md:gap-16" @submit.prevent="updatePreset">
      <div>
        <DSelect
          id="preset"
          v-model="selectedPreset"
          size="5"
          label="Preset Messages"
          class="px-3 py-2"
        >
          <option value="" disabled class="py-1">Select Preset</option>
          <option
            v-for="preset in systemPresetStore.presetList"
            :key="preset.id"
            :value="preset"
            class="py-1"
          >
            {{ preset.name }}
          </option>
        </DSelect>
        <div class="mt-4 flex gap-0.5">
          <DButton
            class="justify-self-start rounded-r-none px-2.5"
            title="Add New Preset"
            @click="addNewPreset"
          >
            <span class="sr-only">Add New Preset</span>
            <IconPlus class="size-4" aria-hidden="true" />
          </DButton>
          <DButton
            class="justify-self-start rounded-l-none px-2.5"
            :disabled="!selectedPreset?.id"
            title="Delete Preset"
            @click="deletePreset"
          >
            <span class="sr-only">Delete Preset</span>
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
