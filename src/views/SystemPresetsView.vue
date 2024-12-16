<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { DButton, DDialog, DInput, DLink, DSelect, DTextarea } from 'deez-components';
import { InferRequestType, InferResponseType } from 'hono';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useSystemPresets } from '@/composables/queries';
import OneColumn from '@/layouts/OneColumn.vue';
import { toastErrorHandler } from '@/lib';
import { client } from '@/lib/apiClient';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const queryClient = useQueryClient();
const toastStore = useToastStore();

const selectedPreset = ref<InferResponseType<typeof client.api.systemPresets.$get, 200>[number]>();
const isConfirmOpen = ref(false);
const name = ref('');
const text = ref('');
let confirmPresetName = '';

watch(selectedPreset, (newVal) => {
  name.value = newVal?.name || '';
  text.value = newVal?.text || '';
});

const { data: presetList } = useSystemPresets();

const $post = client.api.systemPresets.$post;
const createSystemPreset = useMutation<
  InferResponseType<typeof $post>,
  Error,
  InferRequestType<typeof $post>['json']
>({
  mutationFn: async (preset) => {
    const res = await $post({ json: preset });
    return await res.json();
  },
  onSuccess: async (data) => {
    await queryClient.invalidateQueries({ queryKey: ['presetList'] });
    // @ts-expect-error - data should by 201 type
    selectedPreset.value = presetList.value?.find((preset) => preset.id === data.id);
  },
  onError: (err) => {
    toastErrorHandler(err, 'There was a problem creating the preset.');
  },
});

function addNewPreset() {
  createSystemPreset.mutate({ name: 'New Preset', text: 'You are a helpful assistant.' });
}

const $put = client.api.systemPresets[':id'].$put;
const updateSystemPreset = useMutation<
  InferResponseType<typeof $put>,
  Error,
  InferRequestType<typeof $put>['json']
>({
  mutationFn: async (params) => {
    const { id, name, text } = params;
    const res = await $put({ param: { id: id!.toString() }, json: { name, text } });
    return await res.json();
  },
  onSuccess: async (data) => {
    await queryClient.invalidateQueries({ queryKey: ['presetList'] });
    // @ts-expect-error - data should by 201 type
    selectedPreset.value = presetList.value?.find((preset) => preset.id === data.id);
    toastStore.add({ variant: 'success', title: 'Preset successfully updated', duration: 5000 });
  },
  onError: (err) => {
    toastErrorHandler(err, 'There was a problem updating the preset.');
  },
});

async function updatePreset() {
  if (selectedPreset.value === undefined) return;
  updateSystemPreset.mutate({ id: selectedPreset.value.id, name: name.value, text: text.value });
}

const $delete = client.api.systemPresets[':id'].$delete;
const deleteSystemPreset = useMutation<
  InferResponseType<typeof $delete>,
  Error,
  InferRequestType<typeof $delete>['param']['id']
>({
  mutationFn: async (id) => {
    const res = await $delete({ param: { id } });
    return await res.json();
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['presetList'] });
    selectedPreset.value = undefined;
    isConfirmOpen.value = false;
    toastStore.add({ variant: 'success', title: 'Preset successfully deleted', duration: 5000 });
  },
  onError: (err) => {
    toastErrorHandler(err, 'There was a problem deleting the preset.');
  },
});
async function deletePreset() {
  if (selectedPreset.value === undefined) return;
  deleteSystemPreset.mutate(selectedPreset.value.id.toString());
}

function handleDeletePreset() {
  // make a copy of the preset name before opening the confirm modal
  confirmPresetName = selectedPreset.value?.name ?? '';
  isConfirmOpen.value = true;
}
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
          :size="5"
          label="Preset Messages"
          class="px-3 py-2"
        >
          <option value="" disabled class="py-1">Select Preset</option>
          <option v-for="preset in presetList" :key="preset.id" :value="preset" class="py-1">
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
  <DDialog
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
  </DDialog>
</template>
