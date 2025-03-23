import { Client, QueryConfig, QueryResult } from "pg";

async function query(
  queryObject: string | QueryConfig,
): Promise<QueryResult<any>> {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
  });
  await client.connect();

  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
