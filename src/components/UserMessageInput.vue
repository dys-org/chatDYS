<script setup lang="ts">
import { DButton, DTextarea } from 'deez-components';

const model = defineModel<string>();

const emit = defineEmits<{
  send: [];
}>();
</script>

<template>
  <div class="scrollbar-hide mx-auto w-full max-w-[72ch] overflow-y-scroll">
    <DTextarea
      id="userMessage"
      v-model="model"
      label="User Message"
      class="absolute inset-0 max-h-52 resize-none pr-10"
      @keydown.enter.exact.prevent="emit('send')"
    >
      <template #before>
        <div
          class="invisible max-h-52 min-h-[36px] overflow-y-hidden whitespace-pre-wrap px-3 py-1.5 pr-10 sm:text-sm sm:leading-6"
        >
          {{ model }}
        </div>
      </template>
      <template #after>
        <DButton
          class="absolute bottom-1 right-1 p-1 dark:bg-transparent hover:dark:bg-primary-500"
          @click="emit('send')"
        >
          <span class="sr-only">Send</span>
          <span class="i-majesticons-send size-5"></span>
        </DButton>
      </template>
    </DTextarea>
  </div>
</template>
