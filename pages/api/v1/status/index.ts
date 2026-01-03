import { createRouter } from "next-connect";
import { NextApiResponse, NextApiRequest } from "next";
import database from "infra/database";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

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

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

async function onNoMatchHandler(_: NextApiRequest, response: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function onErrorHandler(
  error: unknown,
  _: NextApiRequest,
  response: NextApiResponse,
) {
  console.log("Erro capturado dentro do método onErrorHandler do next-connect");
  const publicError = new InternalServerError({ cause: error });
  return response.status(publicError.statusCode).json(publicError);
}

async function getHandler(_: NextApiRequest, response: NextApiResponse) {
  const serverVersionResult = await database.query("show server_version;");
  const serverVersionValue = serverVersionResult?.rows[0].server_version;

  const maxConnectionsResult = await database.query("show max_connections;");
  const maxConnectionsValue = maxConnectionsResult?.rows[0].max_connections;

  const openedConnectionsResult = await database.query({
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
