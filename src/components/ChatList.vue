<script setup lang="ts">
import { DSpinner } from 'deez-components';

import ChatItem from '@/components/ChatItem.vue';
import { useDeleteConversation, useUpdateConversation } from '@/composables/mutations';
import { useConversations } from '@/composables/queries';
import { toastErrorHandler } from '@/lib';

const { data: conversationList, isPending, error } = useConversations();
const deleteConversation = useDeleteConversation();
const updateConversation = useUpdateConversation();

async function handleDelete(id: number) {
  try {
    deleteConversation.mutate(id.toString());
  } catch (err) {
    toastErrorHandler(err, 'There was a problem deleting your conversation.');
  }
}

async function handleSave(id: string, title: string) {
  try {
    updateConversation.mutate({ id, data: { title } });
  } catch (err) {
    toastErrorHandler(err, 'There was a problem updating your conversation.');
  }
}
</script>

<template>
  <nav class="px-4 py-3">
    <h2 class="mb-2 text-sm font-bold text-white/60">Conversations</h2>

    <DSpinner v-if="isPending" />
    <span v-else-if="error" class="i-lucide-triangle-alert size-5"></span>

    <ul v-else class="flex grow flex-col gap-1">
      <ChatItem
        v-for="chat in conversationList"
        :key="chat.id"
        :chat
        @delete="handleDelete"
        @save="($event) => handleSave(chat.id.toString(), $event)"
      />
    </ul>
  </nav>
</template>
