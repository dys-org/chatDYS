import { auth0 } from '@/main';

async function http<T>(path: string, config: RequestInit): Promise<T> {
  const token = await auth0.getAccessTokenSilently();
  const req = new Request(path, { headers: { Authorization: 'Bearer ' + token }, ...config });
  const res = await fetch(req);
  // may error if there is no body, return empty array
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return Promise.reject(data);
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

// delete is a reserved word in javascript
async function remove<T>(path: string, config?: RequestInit): Promise<T> {
  const init = { method: 'DELETE', ...config };
  return await http<T>(path, init);
}

export default { get, post, put, delete: remove };
