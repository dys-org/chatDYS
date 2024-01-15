import OpenAI from 'openai';

import { HTTPError } from '../../src/utils/exceptions.js';

interface Env {
  VITE_AUTH0_DOMAIN: string;
}

type JWK = {
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
  kid: string;
  x5t: string;
  x5c: string[];
};

type JWKS = { keys: JWK[] };

export function getSubject(req: Request) {
  const rawTokenBody = req.headers.get('Authorization')?.split(' ')[1].split('.')[1];
  return JSON.parse(atob(rawTokenBody)).sub;
}

async function validateToken({ token, domain }: { token: string; domain: string }) {
  const [rawHeader, rawBody, rawSignature] = token.split('.');
  const jwks = await fetch(`https://${domain}/.well-known/jwks.json`);
  const { keys } = (await jwks.json()) as JWKS;
  const { kid } = JSON.parse(atob(rawHeader));
  const signingKey = keys.find((key) => key.kid === kid);
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    signingKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
    false,
    ['verify'],
  );
  const signature = new Uint8Array(
    Array.from(atob(rawSignature.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0)),
  );
  const data = new TextEncoder().encode([rawHeader, rawBody].join('.'));
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
}

const errorHandling: PagesFunction = async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      const { status, message, code, type } = err;
      return new Response(JSON.stringify({ status, message, code, type }), { status });
    }
    const { status, message, stack } = err;
    return new Response(JSON.stringify({ status, message, stack }), {
      status: status ?? 500,
    });
  }
};

export const authentication: PagesFunction<Env> = async ({ request, env, next }) => {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) throw new HTTPError(401, 'Authorization header is missing or invalid');

  if (!env.VITE_AUTH0_DOMAIN) throw new Error('VITE_AUTH0_DOMAIN is not set');

  const isValid = await validateToken({ token, domain: env.VITE_AUTH0_DOMAIN });
  if (!isValid) throw new HTTPError(401, 'Invalid token');
  return next();
};

export const onRequest = [errorHandling, authentication];
