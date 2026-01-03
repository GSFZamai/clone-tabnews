const { exec, spawn } = require("node:child_process");

spawn("npm", ["run", "dev"], { shell: true, stdio: "inherit" });

function shutdown() {
  process.stdout.write("\nEncerrando serviços docker...\n");
  const processServiceDown = exec("npm run services:down");
  processServiceDown.on("exit", (code) => {
    if (code >= 1) {
      console.log("\nFalha ao encerrar serviços docker...\n");
    }
    console.log("\nServiços docker encerrados com sucesso...\n");
  });
}

process.on("SIGINT", shutdown);
