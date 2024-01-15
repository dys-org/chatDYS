<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DDropdown, DLink } from 'deez-components';

import { useChatStore } from '@/stores/chat';
import { useConversationStore } from '@/stores/conversation';
import { useToastStore } from '@/stores/toast';

import IconTrash from '~icons/lucide/trash-2';
const route = useRoute();
const router = useRouter();

const chatStore = useChatStore();
const conversationStore = useConversationStore();
const toastStore = useToastStore();

async function handleDelete(id: number) {
  try {
    await conversationStore.deleteConversation(id);
    toastStore.add({ variant: 'success', title: 'Conversation deleted!' });
    if (id.toString() === route.params.id) {
      chatStore.$reset();
      router.push({ name: 'chat' });
    }
  } catch (err: any) {
    console.error(err);
    toastStore.add({
      variant: 'error',
      title: 'There was a problem deleting your conversation.',
      description: err.message,
    });
  }
}

onBeforeMount(() => {
  // fetch the conversations if they are not already loaded
  if (conversationStore.conversationList === null) {
    conversationStore.fetchConversationList();
  }
});
</script>

<template>
  <nav class="px-4 py-3">
    <h2 class="mb-2 text-sm font-bold text-white/60">Conversations</h2>
    <ul class="flex grow flex-col gap-1">
      <li
        v-for="chat in conversationStore.conversationList"
        :key="chat.id"
        class="group relative -mx-2"
      >
        <DLink
          class="flex rounded px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:bg-transparent dark:group-hover:bg-white/5"
          :to="{ name: 'chat', params: { id: chat.id } }"
          :title="chat.title"
          active-class="text-white font-bold dark:bg-white/5"
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
                icon: IconTrash,
                danger: true,
                fn: () => handleDelete(chat.id),
              },
            ]"
          ></DDropdown>
        </div>
      </li>
    </ul>
  </nav>
</template>
