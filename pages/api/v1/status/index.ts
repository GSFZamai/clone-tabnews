import { createRouter } from "next-connect";
import { NextApiResponse, NextApiRequest } from "next";
import database from "infra/database";
import controller from "infra/controller";

interface IServerVersion {
  server_version: string;
}
interface IMaxConnections {
  max_connections: string;
}
interface IPGStat {
  count: number;
}

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

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.defaultHandlers);

async function getHandler(_: NextApiRequest, response: NextApiResponse) {
  const serverVersionResult = await database.query<IServerVersion>(
    "show server_version;",
  );
  console.log(serverVersionResult);
  const serverVersionValue = serverVersionResult?.rows[0].server_version;

  const maxConnectionsResult = await database.query<IMaxConnections>(
    "show max_connections;",
  );
  const maxConnectionsValue = maxConnectionsResult?.rows[0].max_connections;

  const openedConnectionsResult = await database.query<IPGStat>({
    text: "select count(*)::int from pg_stat_activity where datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const openedConnectionsResultValue = openedConnectionsResult.rows[0].count;

  const statusResponse: StatusResponse = {
    updated_at: new Date().toISOString(),
    dependencies: {
      database: {
        version: serverVersionValue ?? "Falha na consulta",
        max_connections: parseInt(maxConnectionsValue),
        opened_connections: openedConnectionsResultValue,
      },
    },
  };

  return response.status(200).json(statusResponse);
}
