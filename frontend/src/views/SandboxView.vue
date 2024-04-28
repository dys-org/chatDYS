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
async function authenticate() {
  try {
    const data = await http.post('/api/authenticate', { username: 'test', password: 'test' });
    console.log(data);
  } catch (err) {
    toastErrorHandler(err, 'Failed to authenticate.');
  }
}
async function logout() {
  try {
    const data = await http.get('/api/logout');
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
      <DButton @click="authenticate">Authenticate</DButton>
      <DButton @click="logout">Logout</DButton>
    </template>
    <template #side> </template>
  </TwoColumn>
</template>
