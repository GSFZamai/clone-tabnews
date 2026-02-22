import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import password from "./password";

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

async function findByEmail(email: string): Promise<User> {
  const user = await findOneByEmail(email);
  return user;
  async function findOneByEmail(email: string) {
    const result = await database.query<User>({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
      ;`,
      values: [email],
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
  await hashPasswordInObject(newUserRequest);

  const newUser = await insertNewUser(newUserRequest);
  return newUser;

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

async function update(username: string, userInfo: Partial<NewUserRequest>) {
  const currentUser = await user.findByUsername(username);
  const updateUserInfo = { ...currentUser, ...userInfo };

  if ("username" in userInfo) {
    await verifyExistingUsername(userInfo.username);
  }

  if ("email" in userInfo) {
    await verifyExistingEmail(userInfo.email);
  }

  if ("password" in userInfo) {
    await hashPasswordInObject(updateUserInfo);
  }

  const updatedUser = await updateUser(updateUserInfo);

  return updatedUser;

  async function updateUser({ id, username, email, password }: User) {
    const queryResult = await database.query<User>({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [id, username, email, password],
    });
    return queryResult.rows[0];
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

async function hashPasswordInObject(newUserRequest: NewUserRequest) {
  const hashedPassword = await password.hash(newUserRequest.password);
  newUserRequest.password = hashedPassword;
}

const user = {
  create,
  findByUsername,
  findByEmail,
  update,
};

export default user;
