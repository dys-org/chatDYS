import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

export function toastErrorHandler(err: any, title: string) {
  console.error(err);
  toastStore.add({ variant: 'error', title, description: err.message ?? String(err) });
}
