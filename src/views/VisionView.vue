<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DButton } from 'deez-components';

import TwoColumn from '@/layouts/TwoColumn.vue';
import http from '@/utils/http';

const { getAccessTokenSilently } = useAuth0();

async function getUsers() {
  const token = await getAccessTokenSilently();
  try {
    const data = await http.get('/api/users', {
      headers: { Authorization: 'Bearer ' + token },
    });
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
