import { Client } from "pg";

async function query(queryObject: string) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
  });
  await client.connect();
  const result = await client.query(queryObject);
  client.end();
  return result;
}

export default {
  query: query,
};
