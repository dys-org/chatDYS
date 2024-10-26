import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { InferRequestType, InferResponseType } from 'hono';
import { useRoute, useRouter } from 'vue-router';

import { toastErrorHandler } from '@/lib';
import { client } from '@/lib/apiClient';
import { useChatStore } from '@/stores/chat';
import { useToastStore } from '@/stores/toast';

export function useCreateConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const $post = client.api.conversations.$post;
  const mutation = useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['json']
  >({
    mutationFn: async (convo) => {
      const res = await $post({ json: convo });
      return await res.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['conversationList'] });
      // @ts-expect-error - data should by 201 type
      await router.push({ name: 'chat', params: { id: data.lastInsertRowid } });
    },
    onError: (err) => {
      toastErrorHandler(err, 'There was a problem creating the conversation.');
    },
  });

  return mutation;
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  const $patch = client.api.conversations[':id'].$patch;
  const mutation = useMutation<
    InferResponseType<typeof $patch>,
    Error,
    { id: string; data: InferRequestType<typeof $patch>['json'] }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await $patch({
        param: { id },
        json: data,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationList'] });
    },
    onError: (err) => {
      toastErrorHandler(err, 'There was a problem updating the messages.');
    },
  });

  return mutation;
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const route = useRoute();
  const chatStore = useChatStore();
  const toastStore = useToastStore();

  const $delete = client.api.conversations[':id'].$delete;
  const mutation = useMutation<
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
  return mutation;
}
