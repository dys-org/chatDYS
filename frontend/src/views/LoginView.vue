<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  beforeRouteEnter() {
    window.location.replace(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/authorize`);
  },
});
</script>

<template>
  <div></div>
</template>
