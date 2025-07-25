const { exec } = require("node:child_process");

function checkPostgresConnection() {
  exec("docker exec postgres_dev pg_isready --host localhost", handleReturn);

  /**
   * @param {import("node:child_process").ExecException} error
   * @param {string} stdout
   */
  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdin.write(".");
      checkPostgresConnection();
      return;
    }
    process.stdin.write("\n🟢 Postgres está pronto e recebendo conexões!\n");
  }
}

process.stdin.write("\n\n🔴 Aguardando Postgres aceitar conexões");
checkPostgresConnection();
