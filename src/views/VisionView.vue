<script setup lang="ts">
import { DButton } from 'deez-components';

import TwoColumn from '@/layouts/TwoColumn.vue';
import http from '@/utils/http';

async function getUsers() {
  try {
    const data = await http.get('/api/users');
    console.log(data);
  } catch (err: any) {
    console.error(err.message);
  }
}
</script>

<template>
  <TwoColumn h1="Vision">
    <template #main>
      <DButton @click="getUsers">Get Users</DButton>
    </template>
    <template #side> </template>
  </TwoColumn>
</template>
