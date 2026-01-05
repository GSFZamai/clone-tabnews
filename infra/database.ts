import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";
import { ConnectionOptions } from "tls";
import { ServicesError } from "./errors";

async function query(
  queryObject: string | QueryConfig,
): Promise<QueryResult<any>> {
  let client: Client;

  try {
    client = await getNewDbClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceError = new ServicesError({
      cause: error,
      message: "Falha de conexão ou execução de query no Banco de dados.",
    });

    throw serviceError;
  } finally {
    await client?.end();
  }
}

async function getNewDbClient(): Client {
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

const database = {
  query: query,
  getNewDbClient,
};

export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    const connectionOptions: ConnectionOptions = {
      ca: process.env.POSTGRES_CA,
    };
    return connectionOptions;
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
