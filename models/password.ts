import bcryptjs from "bcryptjs";

async function hash(password: string) {
  const rounds = getNumberOfRounds();
  const hashedPassword = await bcryptjs.hash(password, rounds);
  return hashedPassword;
}

function getNumberOfRounds() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

async function compare(insertedPassword: string, persistedPassword: string) {
  return await bcryptjs.compare(insertedPassword, persistedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
