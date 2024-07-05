<script setup lang="ts">
import { ImageBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs';
import { DButton, DTextarea } from 'deez-components';
import { ref } from 'vue';

import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const model = defineModel<string>({ required: true });
const base64Img = defineModel<{
  data: string;
  type?: ImageBlockParam.Source['media_type'];
}>('base64Img', {
  default: { data: '' },
});

const emit = defineEmits<{
  send: [];
}>();

const imgInput = ref<HTMLInputElement | null>(null);

function onUploadImgClick() {
  imgInput.value?.click();
}

function handleImageSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file === undefined) return;
  const fileReader = new FileReader();
  // Check if the file size is under 5MB
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSizeInBytes) {
    toastStore.add({
      variant: 'error',
      title: 'File size exceeds 2MB. Please select a smaller file.',
    });
    base64Img.value = { data: '' };
    return;
  }
  fileReader.onload = (e) => {
    base64Img.value.data = e.target?.result as string;
    base64Img.value.type = file.type as ImageBlockParam.Source['media_type'];
  };
  fileReader.readAsDataURL(file);
}
</script>

<template>
  <div class="scrollbar-hide mx-auto w-full max-w-[72ch] overflow-y-scroll">
    <DTextarea
      id="userMessage"
      v-model="model"
      label="User Message"
      :class="['absolute inset-0 max-h-52 resize-none px-10', { 'pl-20': !!base64Img.data }]"
      @keydown.enter.exact.prevent="emit('send')"
    >
      <template #before>
        <div
          :class="[
            'invisible max-h-52 overflow-y-hidden whitespace-pre-wrap px-10 py-1.5 sm:text-sm sm:leading-6',
            base64Img.data ? 'min-h-[108px]' : 'min-h-[36px]',
          ]"
        >
          {{ model }}&nbsp;
        </div>
        <!-- Display the image preview -->
        <div class="absolute left-2 top-2">
          <div v-if="base64Img.data" class="group relative z-10 h-14 w-14">
            <DButton
              class="hover:dark:bg-primary-500 absolute -right-1.5 -top-1.5 rounded-full p-0.5 opacity-0 focus:opacity-100 group-hover:opacity-100 dark:bg-gray-600"
              @click="base64Img = { data: '' }"
            >
              <span class="sr-only">Delete Image</span>
              <span class="i-majesticons-close text-base"></span
            ></DButton>
            <img
              :src="base64Img.data"
              class="h-full w-full rounded bg-gray-700 object-cover"
              alt="Image Preview"
            />
          </div>
        </div>
        <input
          id="imgInput"
          ref="imgInput"
          type="file"
          tabindex="-1"
          class="hidden"
          accept="image/*"
          aria-labelledby="uploadImgLabel"
          @change="handleImageSelected"
        />
        <DButton
          class="hover:dark:bg-primary-500 absolute bottom-1 left-1 z-10 p-1 dark:bg-transparent"
          @click="onUploadImgClick"
        >
          <span id="uploadImgLabel" class="sr-only">Upload Image</span>
          <span class="i-majesticons-image-line size-5"></span>
        </DButton>
      </template>
      <template #after>
        <DButton
          class="hover:dark:bg-primary-500 absolute bottom-1 right-1 p-1 dark:bg-transparent"
          @click="emit('send')"
        >
          <span class="sr-only">Send</span>
          <span class="i-majesticons-send size-5"></span>
        </DButton>
      </template>
    </DTextarea>
  </div>
</template>
