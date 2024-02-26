import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

export function errorHandler(err: Error, title: string) {
  console.error(err);
  toastStore.add({ variant: 'error', title, description: err.message });
}
