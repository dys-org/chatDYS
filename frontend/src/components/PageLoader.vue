<script setup lang="ts">
import { DSpinner } from 'deez-components';
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  { show: false },
);
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity duration-100"
    leave-active-class="transition-opacity duration-100"
  >
    <div v-if="props.show" class="absolute inset-0 grid h-full place-content-center bg-gray-950/30">
      <DSpinner class="size-24" />
    </div>
  </Transition>
</template>
