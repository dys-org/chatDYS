<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    h1?: string;
  }>(),
  { h1: 'Page Heading' },
);
</script>

<template>
  <main class="my-4 px-4 sm:px-6">
    <div class="mx-auto h-full max-w-screen-md">
      <h1 class="mb-4 text-xl font-semibold">{{ props.h1 }}</h1>
      <slot />
    </div>
  </main>
</template>
