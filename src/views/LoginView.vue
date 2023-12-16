<script setup lang="ts">
import { ref } from 'vue';
import { DButton, DInput } from 'deez-components';

import ChatLogoSVG from '@/components/ChatLogoSVG.vue';

const initForm = () => ({ name: '', password: '' });

const loginForm = ref(initForm());

function onSubmit() {
  console.log(loginForm.value);
  loginForm.value = initForm();
}
</script>

<template>
  <div
    class="bg-radial-glow flex min-h-full flex-1 flex-col justify-center bg-gray-900 px-6 py-12 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <ChatLogoSVG class="mx-auto h-12" />
      <h2 class="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-white">
        You Shall Not Pass!
      </h2>
      <div class="text-center text-sm text-white/60">
        (unless you know the username and password)
      </div>
    </div>

    <div class="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="flex flex-col gap-y-6" @submit.prevent="onSubmit">
        <DInput id="name" v-model.trim="loginForm.name" label="Username" required />
        <DInput id="password" v-model.trim="loginForm.password" label="Password" type="password" />
        <DButton type="submit" class="w-full justify-center" variant="primary">Sign in</DButton>
      </form>
    </div>
  </div>
</template>
