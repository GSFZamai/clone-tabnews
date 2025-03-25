import { Client, QueryConfig, QueryResult } from "pg";

async function query(
  queryObject: string | QueryConfig,
): Promise<QueryResult<any>> {
  const credentials = {
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
  };
  const client = new Client(credentials);
  console.log(credentials);

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
