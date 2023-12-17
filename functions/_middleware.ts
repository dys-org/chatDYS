import OpenAI from 'openai';

interface Env {
  USERNAME_PASSWORD: string;
}

function getUnauthorizedResponse(message: string) {
  return new Response(message, {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="chatDYS, charset="UTF-8"' },
  });
}

const errorHandling: PagesFunction = async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    console.error('chat error: ', err);
    if (err instanceof OpenAI.APIError) {
      const { status, message, code, type } = err;
      return new Response(JSON.stringify({ message, code, type }), { status });
    }
    const { statusText, status, message, stack } = err;
    return new Response(JSON.stringify({ message, stack }), {
      status: status ?? 500,
      statusText: statusText || 'Internal PagesFunction Error',
    });
  }
};

export const authenticationBasic: PagesFunction<Env> = async ({ request, env, next }) => {
  const { headers } = request;
  const authString = 'Basic ' + btoa(env.USERNAME_PASSWORD);

  const authHeader = headers.get('authorization');
  if (!authHeader) {
    return getUnauthorizedResponse('Provide Username and Password to access this page.');
  }
  if (authHeader !== authString) {
    return getUnauthorizedResponse('The Username and Password combination you entered is invalid.');
  }
  return next();
};

export const onRequest = [errorHandling, authenticationBasic];
