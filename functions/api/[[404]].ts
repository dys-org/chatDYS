import { HTTPError } from '../../src/utils/exceptions.js';

export const onRequest: PagesFunction = async ({ request }) => {
  throw new HTTPError(404, `Not Found - ${request.url}`);
};
