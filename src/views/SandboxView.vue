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
async function logout() {
  try {
    const data = await http.get('/auth/logout');
    console.log(data);
  } catch (err) {
    toastErrorHandler(err, 'Failed to logout.');
  }
}
</script>

<template>
  <TwoColumn h1="Sandbox">
    <template #main>
      <DButton @click="getUsers">Get Users</DButton>
      <DButton @click="getConvos">Get Conversations</DButton>
      <DButton @click="logout">Logout</DButton>
    </template>
    <template #side> </template>
  </TwoColumn>
</template>
