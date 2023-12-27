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
    <div class="container mx-auto h-full">
      <h1 class="mb-4 text-2xl font-semibold">{{ props.h1 }}</h1>
      <slot />
    </div>
  </main>
</template>
