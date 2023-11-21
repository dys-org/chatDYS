<script setup lang="ts">
import { computed } from 'vue';
import { DButton, DTextarea } from 'deez-components';

import IconSend from '~icons/majesticons/send';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  { modelValue: '' },
);

const emit = defineEmits<{
  send: [];
  'update:modelValue': [message: string];
}>();

const message = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
</script>

<template>
  <div class="mx-auto w-full max-w-[72ch] overflow-y-scroll">
    <DTextarea
      id="userMessage"
      v-model="message"
      label="User Message"
      class="absolute inset-0 max-h-52 resize-none pr-10"
      @keydown.enter.exact.prevent="emit('send')"
    >
      <template #before>
        <div
          class="invisible max-h-52 min-h-[36px] overflow-y-hidden whitespace-pre-wrap px-3 py-1.5 pr-10 sm:text-sm sm:leading-6"
        >
          {{ props.modelValue }}
        </div>
      </template>
      <template #after>
        <DButton
          class="absolute bottom-1 right-1 p-1 dark:bg-transparent hover:dark:bg-primary-500"
          @click="emit('send')"
        >
          <span class="sr-only">Send</span>
          <IconSend class="h-5 w-5" />
        </DButton>
      </template>
    </DTextarea>
  </div>
</template>
