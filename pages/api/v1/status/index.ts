import { NextApiResponse, NextApiRequest } from "next";
import database from "infra/database";

export interface StatusResponse {
  updated_at: string;
  dependencies: {
    database: {
      version: string;
      max_connections: number;
      opened_connections: number;
    };
  };
}

async function status(request: NextApiRequest, response: NextApiResponse) {
  const serverVersionResult = await database.query("show server_version;");
  const serverVersionValue = serverVersionResult?.rows[0].server_version;

  const maxConnectionsResult = await database.query("show max_connections;");
  const maxConnectionsValue = maxConnectionsResult?.rows[0].max_connections;

  const opennedConnectionsResult = await database.query({
    text: "select count(*)::int from pg_stat_activity where datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const opennedConnectionsResultValue = opennedConnectionsResult.rows[0].count;

  const statusResponse: StatusResponse = {
    updated_at: new Date().toISOString(),
    dependencies: {
      database: {
        version: serverVersionValue ?? "Falha na consulta",
        max_connections: parseInt(maxConnectionsValue),
        opened_connections: opennedConnectionsResultValue,
      },
    },
  };

  return response.status(200).json(statusResponse);
}

export default status;
