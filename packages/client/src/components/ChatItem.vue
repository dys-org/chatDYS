<script setup lang="ts">
import { DDropdown, DInput, DLink } from 'deez-components';
import { InferResponseType } from 'hono';
import { computed, ref } from 'vue';
import { nextTick } from 'vue';

import { client } from '@/lib/apiClient';

type Chat = InferResponseType<typeof client.api.conversations.$get, 200>[number];
interface ChildInputExposed {
  focus: () => void;
}

const props = defineProps<{
  chat: Chat;
}>();

const emit = defineEmits<{
  delete: [id: number];
  save: [title: string];
}>();

const isEditing = ref(false);
const innerText = ref(props.chat.title);
const inputRef = ref<ChildInputExposed | null>(null);

const menuOptions = computed(() => {
  return [
    {
      key: 'delete_conversation',
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      danger: true,
      fn: onDelete,
    },
    isEditing.value
      ? {
          key: 'save_title',
          label: 'Save Title',
          icon: 'i-lucide-save',
          fn: onSave,
        }
      : {
          key: 'edit_title',
          label: 'Edit Title',
          icon: 'i-lucide-edit',
          fn: onEdit,
        },
  ];
});

function onSave() {
  if (innerText.value !== props.chat.title) {
    emit('save', innerText.value);
  }
  isEditing.value = false;
}

async function onEdit() {
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
}

function onDelete() {
  if (confirm('Are you sure you want to delete this chat?')) {
    emit('delete', props.chat.id);
  }
}
</script>

<template>
  <li class="group relative -mx-2">
    <DLink
      class="focus-visible:outline-primary-500 flex rounded px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-transparent dark:group-hover:bg-white/5"
      :to="{ name: 'chat', params: { id: props.chat.id } }"
      :title="props.chat.title"
      active-class="font-bold dark:bg-white/5"
    >
      <DInput
        :id="`${props.chat.id}-title`"
        ref="inputRef"
        v-model="innerText"
        label="chat title"
        hide-label
        :readonly="!isEditing"
        :tabindex="!isEditing ? -1 : 0"
        :class="[
          'w-56 truncate p-0.5 read-only:pointer-events-none focus:read-only:ring-0 dark:bg-transparent dark:read-only:ring-transparent',
        ]"
        @keydown.enter="onSave"
        @keydown.esc="isEditing = false"
      />
    </DLink>
    <div class="absolute right-1 top-1.5">
      <DDropdown
        minimal
        label="Action Menu"
        button-class="dark:bg-transparent"
        :options="menuOptions"
      />
    </div>
  </li>
</template>
