<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { DButton, DInput, DLink, DModal, DSelect, DTextarea } from 'deez-components';

import OneColumn from '@/layouts/OneColumn.vue';
import { type SystemPreset, useSystemPresetsStore } from '@/stores/systemPresets';
import { useToastStore } from '@/stores/toast';
import { toastErrorHandler } from '@/utils';

const router = useRouter();
const systemPresetStore = useSystemPresetsStore();
const toastStore = useToastStore();

const selectedPreset = ref<SystemPreset>();
const isConfirmOpen = ref(false);
const name = ref('');
const text = ref('');
let confirmPresetName = '';

watch(selectedPreset, (newVal, _) => {
  name.value = newVal?.name || '';
  text.value = newVal?.text || '';
});

async function addNewPreset() {
  try {
    const res = await systemPresetStore.createSystemPreset({
      name: 'New Preset',
      text: 'You are a helpful assistant.',
    });
    selectedPreset.value = systemPresetStore.presetList?.find(
      // @ts-expect-error
      (preset) => preset.id === res.info.lastInsertRowid,
    );
  } catch (err) {
    toastErrorHandler(err, 'There was a problem creating the preset.');
  }
}

async function updatePreset() {
  if (selectedPreset.value === undefined) return;
  try {
    await systemPresetStore.updateSystemPreset({
      id: selectedPreset.value.id,
      name: name.value,
      text: text.value,
    });
    // preset has to be re-selected because the modeled object has changed
    selectedPreset.value = systemPresetStore.presetList?.find(
      (preset) => preset.id === selectedPreset.value?.id,
    );
    toastStore.add({ variant: 'success', title: 'Preset successfully updated' });
  } catch (err) {
    toastErrorHandler(err, 'There was a problem updating the preset.');
  }
}

async function deletePreset() {
  if (selectedPreset.value?.id === undefined) return;
  try {
    await systemPresetStore.deleteSystemPreset(selectedPreset.value.id);
    selectedPreset.value = undefined;
    isConfirmOpen.value = false;
    toastStore.add({ variant: 'success', title: 'Preset successfully deleted' });
  } catch (err) {
    toastErrorHandler(err, 'There was a problem deleting the preset.');
  }
}

function handleDeletePreset() {
  // make a copy of the preset name before opening the confirm modal
  confirmPresetName = selectedPreset.value?.name ?? '';
  isConfirmOpen.value = true;
}

onBeforeMount(() => {
  // fetch the preset system messages if they are not already loaded
  if (systemPresetStore.presetList === null) {
    systemPresetStore.fetchPresetList().catch((err) => {
      toastErrorHandler(err, 'There was a problem fetching presets.');
    });
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
      <span class="i-majesticons-chevron-left -ml-1 size-5" aria-hidden="true"></span>
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
            <span class="i-majesticons-plus size-4" aria-hidden="true"></span>
          </DButton>
          <DButton
            class="justify-self-start rounded-l-none px-2.5"
            :disabled="!selectedPreset?.id"
            title="Delete Preset"
            @click="handleDeletePreset"
          >
            <span class="sr-only">Delete Preset</span>
            <span class="i-majesticons-minus size-4" aria-hidden="true"></span>
          </DButton>
        </div>
      </div>
      <div class="grid gap-8">
        <DInput id="name" v-model="name" label="Name" :disabled="selectedPreset === undefined" />
        <DTextarea
          id="text"
          v-model="text"
          label="Text"
          :rows="6"
          :disabled="selectedPreset === undefined"
        />
        <DButton
          type="submit"
          variant="primary"
          class="justify-self-end"
          :disabled="selectedPreset === undefined"
        >
          Save
        </DButton>
      </div>
    </form>
  </OneColumn>
  <DModal
    v-model:open="isConfirmOpen"
    danger
    title="Delete Preset"
    confirm-text="Yes, Delete"
    @confirm="deletePreset"
  >
    <template #content>
      <p class="text-sm dark:text-white/60">
        Are you sure you want to delete
        <span class="font-semibold text-white">{{ confirmPresetName }}</span
        >? This action cannot be undone.
      </p>
    </template>
  </DModal>
</template>
