export async function get(url: string) {
  const res = await fetch(url);
  return handleResponse(res);
}

export async function post(url: string, body: {}, { ...customConfig } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...customConfig,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function put(url: string, body: {}, { ...customConfig } = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    ...customConfig,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// delete is a reserved word in javascript
export async function remove(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res);
}

// helper functions
async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    return Promise.reject(data);
  }
  return data;
}

export default { get, post, put, delete: remove };
