import { UnauthorizedError } from "infra/errors";
import password from "./password";
import user from "./user";

export interface ICreateSession {
  email: string;
  password: string;
}

async function create(createSession: ICreateSession) {
  try {
    const userFound = await user.findByEmail(createSession.email);
    const correctPassword = await password.compare(
      userFound.password,
      createSession.password,
    );

    if (!correctPassword) {
      throw new UnauthorizedError({
        action: "Verifique as credenciais e tente novamente.",
        message: "Falha na autenticação.",
      });
    }

    return { session: "foi" };
  } catch (e) {
    throw new UnauthorizedError({
      action: "Verifique as credenciais e tente novamente.",
      message: "Falha na autenticação.",
    });
  }
}

const session = { create };

export default session;
