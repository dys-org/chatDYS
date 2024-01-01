<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DButton } from 'deez-components';

import TwoColumn from '@/layouts/TwoColumn.vue';
import { useToastStore } from '@/stores/toast';
import http from '@/utils/http';

const toastStore = useToastStore();

const { getAccessTokenSilently } = useAuth0();

async function getUsers() {
  const token = await getAccessTokenSilently();
  try {
    const data = await http.get('/api/users', {
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log(data);
  } catch (err: any) {
    console.error(err);
    toastStore.add({
      variant: 'error',
      title: 'Failed to get users',
      description: err.message,
    });
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
