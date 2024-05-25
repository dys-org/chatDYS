import { hc } from 'hono/client';

import { useUserStore } from '@/stores/user';

import type { AppType } from '../../../server/src';
import { HTTPError } from './exceptions';

async function myFetch(input: string | URL | Request, init?: RequestInit) {
  const userStore = useUserStore();
  const req = new Request(input, init);
  const res = await fetch(req);

  if (!res.ok) {
    if ([401, 403].includes(res.status) && userStore.data) {
      userStore.logout();
    }
    const error = await res.text();
    return Promise.reject(new HTTPError(res.status, error));
  }
  return res;
}

export const client = hc<AppType>('/', { fetch: myFetch });
