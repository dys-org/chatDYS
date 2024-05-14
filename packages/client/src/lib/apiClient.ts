import { hc } from 'hono/client';

import { useUserStore } from '@/stores/user';

import type { AppType } from '../../../server/src'

async function myFetch(input: string | URL | Request, init?: RequestInit) {
  const userStore = useUserStore();
  const req = new Request(input, init);
  const res = await fetch(req);
  if (!res.ok) {
    if ([401, 403].includes(res.status) && userStore.isLoggedIn) {
      userStore.logout();
    }
    return Promise.reject(res);
  }
  return res;
}

export const client = hc<AppType>('/', { fetch: myFetch });
