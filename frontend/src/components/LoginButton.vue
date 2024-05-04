<script setup lang="ts">
import { DAvatar, DButton, DDropdown, DLink } from 'deez-components';

import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const userDropdownOptions = [
  {
    label: 'Profile',
    icon: 'i-majesticons-user-line',
    key: 'profile',
    to: '/profile',
  },
  { divider: true, key: 'd1' },
  {
    label: 'Log Out',
    icon: 'i-majesticons-logout-line',
    key: 'log_out',
    fn: () => userStore.logout(),
  },
];
</script>

<template>
  <DDropdown
    v-if="userStore.user !== null"
    label="User"
    :options="userDropdownOptions"
    button-class="flex text-gray-400 p-0 dark:bg-transparent dark:hover:bg-transparent"
  >
    <DAvatar :image="userStore.user.avatar_url" class="size-8 max-w-fit" />
  </DDropdown>
  <DLink
    v-else
    to="/login"
    class="rounded px-3 py-1.5 text-sm font-semibold text-primary-400 transition-colors hover:bg-white/5 hover:text-white"
    active-class="text-white font-bold"
  >
    Login <span aria-hidden="true" class="i-majesticons-login-line text-lg">→</span>
  </DLink>
</template>
