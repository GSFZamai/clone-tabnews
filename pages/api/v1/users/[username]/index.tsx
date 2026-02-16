import controller from "infra/controller";
import user, { NewUserRequest } from "models/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.patch(patchHandler);

interface NextApiGetRequest extends NextApiRequest {
  query: {
    username: string;
  };
}

interface NextApiPatchRequest extends NextApiGetRequest {
  body: Partial<NewUserRequest>;
}

async function getHandler(
  request: NextApiGetRequest,
  response: NextApiResponse,
) {
  const responseBody = await user.findByUsername(request.query.username);

  return response.status(200).json(responseBody);
}

async function patchHandler(
  request: NextApiPatchRequest,
  response: NextApiResponse,
) {
  const updatedUser = await user.update(request.query.username, request.body);

  response.status(200).json(updatedUser);
}

export default router.handler(controller.defaultHandlers);
