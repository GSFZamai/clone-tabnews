import controller from "infra/controller";
import user, { NewUserRequest } from "models/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);

export default router.handler(controller.defaultHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const newUserRequest: NewUserRequest = request.body;
  const newUser = await user.create(newUserRequest);
  return response.status(201).json(newUser);
}
