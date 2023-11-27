import OpenAI from 'openai';

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

export const onRequest = [errorHandling];
