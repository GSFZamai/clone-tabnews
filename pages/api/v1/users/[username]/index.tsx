import controller from "infra/controller";
import user from "models/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

interface NextApiRequesWithQueryParams extends NextApiRequest {
  query: {
    username: string;
  };
}

async function getHandler(
  request: NextApiRequesWithQueryParams,
  response: NextApiResponse,
) {
  const responseBody = await user.findByUsername(request.query.username);

  return response.status(200).json(responseBody);
}

export default router.handler(controller.defaultHandlers);
