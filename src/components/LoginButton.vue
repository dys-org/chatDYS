<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DButton } from 'deez-components';

const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

function login() {
  loginWithRedirect();
}
function logoutAndReturn() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}
</script>

<template>
  <div>
    <DButton v-if="isAuthenticated" @click="logoutAndReturn">Logout</DButton>
    <DButton v-else variant="primary" @click="login">Login</DButton>
  </div>
</template>
