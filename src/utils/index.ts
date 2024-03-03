import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

export function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function toastErrorHandler(err: unknown, title: string) {
  console.error(err);
  toastStore.add({ variant: 'error', title, description: getErrorMessage(err) });
}
