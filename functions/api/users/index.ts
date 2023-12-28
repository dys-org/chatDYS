interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  // Create a prepared statement with our query
  const ps = env.DB.prepare('SELECT * from users');
  const { results } = await ps.all();

  return Response.json(results);
};
