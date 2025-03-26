import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";

async function query(
  queryObject: string | QueryConfig,
): Promise<QueryResult<any>> {
  const credentials: ClientConfig = {
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    ssl: process.env.NODE_ENV === "development" ? false : true,
  };
  const client = new Client(credentials);

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
