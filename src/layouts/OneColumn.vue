<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    h1?: string;
  }>(),
  { h1: 'Page Heading' },
);
</script>

<template>
  <main class="h-full overflow-auto bg-radial-glow px-4 sm:px-6">
    <div class="mx-auto h-full max-w-screen-md">
      <h1 class="mb-6 mt-12 text-4xl font-semibold">{{ props.h1 }}</h1>
      <slot />
    </div>
  </main>
</template>
