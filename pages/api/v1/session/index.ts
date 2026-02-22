import controller from "infra/controller";
import { ICreateSession } from "models/session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import session from "models/session";

interface NextPostApiRequest extends NextApiRequest {
  body: ICreateSession;
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);

async function postHandler(
  request: NextPostApiRequest,
  response: NextApiResponse,
) {
  const createdSession = await session.create(request.body);

  return response.status(201).json(createdSession);
}

export default router.handler(controller.defaultHandlers);
