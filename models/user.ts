import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";

export type NewUserRequest = {
  username: string;
  email: string;
  password: string;
};

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

async function findByUsername(username: string): Promise<User> {
  const user = await findOneByUsername(username);

  return user;
  async function findOneByUsername(username: string) {
    const result = await database.query<User>({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
      ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado para os dados informados.",
        action: "Tente outro nome de usuário.",
      });
    }

    return result.rows[0];
  }
}

async function create(newUserRequest: NewUserRequest): Promise<User> {
  await verifyExistingEmail(newUserRequest.email);
  await verifyExistingUsername(newUserRequest.username);
  const newUser = await insertNewUser(newUserRequest);
  return newUser;

  async function verifyExistingEmail(email: NewUserRequest["email"]) {
    const result = await database.query({
      text: `
        SELECT 
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
      ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Email já utilizado.",
        action: "Insira outro email e tente novamente.",
      });
    }
  }
  async function verifyExistingUsername(username: NewUserRequest["username"]) {
    const result = await database.query({
      text: `
        SELECT 
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
      ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Nome de usuário já utilizado.",
        action: "Insira outro nome de usuário e tente novamente.",
      });
    }
  }
  async function insertNewUser({ username, email, password }: NewUserRequest) {
    const queryResult = await database.query<User>({
      text: `
      INSERT INTO
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [username, email, password],
    });
    return queryResult.rows[0];
  }
}

const user = {
  create,
  findByUsername,
};

export default user;
