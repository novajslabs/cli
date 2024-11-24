#!/usr/bin/env node
import { add, vite } from "@/src/commands";
import { Command } from "commander";

import { getPackageInfo } from "./utils/get-package-info";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
  const packageInfo = await getPackageInfo();

  const program = new Command()
    .name("@novajslabs/cli")
    .description("add hooks to your React project")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number"
    );

  program.addCommand(add).addCommand(vite);

  program.parse();
}

main();
