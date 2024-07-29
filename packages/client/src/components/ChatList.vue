<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { DDropdown, DLink, DSpinner } from 'deez-components';
import { InferRequestType, InferResponseType } from 'hono';
import { useRoute, useRouter } from 'vue-router';

import { useConversations } from '@/composables/queries';
import { toastErrorHandler } from '@/lib';
import { client } from '@/lib/apiClient';
import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';

const route = useRoute();
const router = useRouter();

const chatStore = useChatStore();
const toastStore = useToastStore();
const queryClient = useQueryClient();

const { data: conversationList, isPending, error } = useConversations();

async function handleDelete(id: number) {
  try {
    deleteConversation.mutate(id.toString());
  } catch (err) {
    toastErrorHandler(err, 'There was a problem deleting your conversation.');
  }
}

const $delete = client.api.conversations[':id'].$delete;
const deleteConversation = useMutation<
  InferResponseType<typeof $delete>,
  Error,
  InferRequestType<typeof $delete>['param']['id']
>({
  mutationFn: async (id) => {
    const res = await $delete({ param: { id } });
    return await res.json();
  },
  onSuccess: async (_, id) => {
    await queryClient.invalidateQueries({ queryKey: ['conversationList'] });
    toastStore.add({ variant: 'success', title: 'Conversation deleted!', duration: 5000 });
    if (id === route.params.id) {
      chatStore.$reset();
      await router.push({ name: 'chat' });
    }
  },
  onError: (err) => {
    toastErrorHandler(err, 'There was a problem deleting the conversation.');
  },
});
</script>

<template>
  <nav class="px-4 py-3">
    <h2 class="mb-2 text-sm font-bold text-white/60">Conversations</h2>

    <DSpinner v-if="isPending" />
    <span v-else-if="error" class="i-lucide-triangle-alert size-5"></span>

    <ul v-else class="flex grow flex-col gap-1">
      <li v-for="chat in conversationList" :key="chat.id" class="group relative -mx-2">
        <DLink
          class="focus-visible:outline-primary-500 flex rounded px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-transparent dark:group-hover:bg-white/5"
          :to="{ name: 'chat', params: { id: chat.id } }"
          :title="chat.title"
          active-class="font-bold dark:bg-white/5"
        >
          <span class="max-w-56 truncate">{{ chat.title }}</span>
        </DLink>
        <div class="absolute right-1 top-1">
          <DDropdown
            minimal
            label="Action Menu"
            button-class="dark:bg-transparent"
            :options="[
              {
                key: 'delete_conversation',
                label: 'Delete',
                icon: 'i-lucide-trash-2',
                danger: true,
                fn: () => handleDelete(chat.id),
              },
            ]"
          />
        </div>
      </li>
    </ul>
  </nav>
</template>
