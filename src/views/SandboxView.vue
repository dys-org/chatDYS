<script setup lang="ts">
import { DButton } from 'deez-components';

import TwoColumn from '@/layouts/TwoColumn.vue';
import { toastErrorHandler } from '@/utils';
import http from '@/utils/http';

async function getUsers() {
  try {
    const data = await http.get('/api/users');
    console.log(data);
  } catch (err) {
    toastErrorHandler(err, 'Failed to get users.');
  }
}
async function getConvos() {
  try {
    const data = await http.get('/api/conversations');
    console.log(data);
  } catch (err) {
    toastErrorHandler(err, 'Failed to get conversations.');
  }
}
</script>

<template>
  <TwoColumn h1="Sandbox">
    <template #main>
      <DButton @click="getUsers">Get Users</DButton>
      <DButton @click="getConvos">Get Conversations</DButton>
    </template>
    <template #side> </template>
  </TwoColumn>
</template>
