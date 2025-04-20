import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";
import { ConnectionOptions } from "tls";

async function query(
  queryObject: string | QueryConfig,
): Promise<QueryResult<any>> {
  let client;

  try {
    client = await getNewDbClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Erro Conexão Banco", error);
    console.log("Credenciais", {
      host: process.env.POSTGRES_HOST,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
    });
    throw error;
  } finally {
    await client.end();
  }
}

async function getNewDbClient() {
  const credentials: ClientConfig = {
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues(),
  };
  const client = new Client(credentials);
  client.connect();
  return client;
}

export default {
  query: query,
  getNewDbClient,
};

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    const connectionOptions: ConnectionOptions = {
      ca: process.env.POSTGRES_CA,
    };
    return connectionOptions;
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
