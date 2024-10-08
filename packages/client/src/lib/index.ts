import { useToastStore } from '@/stores/toast';

export function toastErrorHandler(err: any, title: string) {
  const toastStore = useToastStore();
  toastStore.add({ variant: 'error', title, description: err.message ?? String(err) });
  console.error(err);
}

export function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
