import { useUserStore } from '@/stores/user';

async function http<T>(path: string, config: RequestInit): Promise<T> {
  const userStore = useUserStore();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // if (token) headers.Authorization = 'Bearer ' + token;

  const req = new Request(path, {
    headers,
    ...config,
  });
  const res = await fetch(req);
  // if no body, return empty object
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if ([401, 403].includes(res.status) && userStore.isLoggedIn) {
      userStore.logout();
    }
    return Promise.reject(data);
  }
  return data;
}

async function get<T>(path: string, config?: RequestInit): Promise<T> {
  const init = { method: 'GET', ...config };
  return await http<T>(path, init);
}
async function post<T, U>(path: string, body: T, config?: RequestInit): Promise<U> {
  const init = { method: 'POST', body: JSON.stringify(body), ...config };
  return await http<U>(path, init);
}
async function put<T, U>(path: string, body: T, config?: RequestInit): Promise<U> {
  const init = { method: 'PUT', body: JSON.stringify(body), ...config };
  return await http<U>(path, init);
}
async function patch<T, U>(path: string, body: T, config?: RequestInit): Promise<U> {
  const init = { method: 'PATCH', body: JSON.stringify(body), ...config };
  return await http<U>(path, init);
}
// delete is a reserved word in javascript
async function remove<T>(path: string, config?: RequestInit): Promise<T> {
  const init = { method: 'DELETE', ...config };
  return await http<T>(path, init);
}

export default { get, post, put, patch, delete: remove };
