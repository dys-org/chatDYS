async function get(url: string) {
  const res = await fetch(url);
  return handleResponse(res);
}

async function post(url: string, body: {}, { ...customConfig } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...customConfig,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

async function put(url: string, body: {}, { ...customConfig } = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    ...customConfig,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// prefixed with underscored because delete is a reserved word in javascript
async function _delete(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res);
}

// helper functions
async function handleResponse(res: Response) {
  if (!res.ok) {
    const error = await res.text();
    return Promise.reject(new Error(error || res.statusText));
  }
  return await res.json();
}

export const $http = { get, post, put, delete: _delete };
