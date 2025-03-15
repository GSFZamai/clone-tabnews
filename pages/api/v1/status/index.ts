import { NextApiResponse, NextApiRequest } from "next";
function status(request: NextApiRequest, response: NextApiResponse) {
  return response.status(200).json({ message: "funcionando!" });
}

export default status;
