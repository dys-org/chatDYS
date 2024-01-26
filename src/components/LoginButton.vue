<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { DAvatar, DButton, DDropdown } from 'deez-components';

import IconUser from '~icons/majesticons/user-line';

const userDropdownOptions = [
  {
    label: 'Profile',
    icon: IconUser,
    key: 'profile',
    to: '/profile',
  },
  { divider: true, key: 'd1' },
  {
    label: 'Log Out',
    key: 'log_out',
    danger: true,
    fn: () => logoutAndReturn(),
  },
];

const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

function login() {
  loginWithRedirect({ appState: { target: '/chat' } });
}
function logoutAndReturn() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}
</script>

<template>
  <DDropdown
    v-if="isAuthenticated"
    label="User"
    :options="userDropdownOptions"
    button-class="flex text-gray-400 p-0 dark:bg-transparent dark:hover:bg-transparent"
  >
    <DAvatar :image="user?.picture" class="size-8 max-w-fit" />
  </DDropdown>
  <DButton v-else variant="primary" @click="login">Login</DButton>
</template>
