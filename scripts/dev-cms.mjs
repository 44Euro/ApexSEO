import { spawn } from "child_process";
import { join } from "path";

const PORT = process.env.CMS_PORT ?? "3001";
const target = `http://localhost:${PORT}/admin/login`;

const nextBin = join(process.cwd(), "node_modules", ".bin", "next");
const dev = spawn(nextBin, ["dev", "-p", PORT], {
  stdio: "inherit",
  env: { ...process.env, NEXT_DIST_DIR: ".next-cms" },
});
dev.on("exit", (code) => process.exit(code ?? 0));

const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";

async function openWhenReady() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch(target, { redirect: "manual" });
      spawn(opener, [target], { stdio: "ignore", shell: true, detached: true }).unref();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

openWhenReady();
