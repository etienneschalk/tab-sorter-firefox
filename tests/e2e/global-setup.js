import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default async function globalSetup() {
  execSync("./build-extensions.sh", { cwd: rootDir, stdio: "inherit" });
}
