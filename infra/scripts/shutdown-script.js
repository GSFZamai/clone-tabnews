const { exec, spawn } = require("node:child_process");

spawn("npm", ["run", "dev"], { shell: true, stdio: "inherit" });

function shutdown() {
  process.stdout.write("\nEncerrando serviços docker...\n");
  exec("npm run services:down");
  process.exit(0);
}

process.on("SIGINT", shutdown);
