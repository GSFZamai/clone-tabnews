import { NextApiResponse, NextApiRequest } from "next";
import database from "infra/database";
async function status(request: NextApiRequest, response: NextApiResponse) {
  console.log((await database.query("SELECT 1 + 1 AS SUM;")).rows);
  return response.status(200).json({ message: "funcionando!" });
}

export default status;
