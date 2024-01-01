import { useToast } from 'deez-components';
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', () => {
  const { add, remove, notifications } = useToast();

  return { add, remove, notifications };
});
