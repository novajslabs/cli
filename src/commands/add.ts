import { existsSync, promises as fs } from "fs";
import path from "path";
import { getConfig } from "@/src/utils/get-config";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { handleError } from "@/src/utils/handle-error";
import { logger } from "@/src/utils/logger";
import {
  fetchTree,
  getItemTargetPath,
  getRegistryBaseColor,
  getRegistryIndex,
  resolveTree,
} from "@/src/utils/registry";
import { transform } from "@/src/utils/transformers";
import chalk from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";
import { z } from "zod";
import { downloadHook } from "../utils/downloadHook";

const addOptionsSchema = z.object({
  hooks: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
});

export const add = new Command()
  .name("add")
  .description("add a hook to your project")
  .argument("[hooks...]", "the hooks to add")
  .option("-y, --yes", "skip confirmation prompt.", true)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available hooks", false)
  .option("-p, --path <path>", "the path to add the hook to.")
  .action(async (hooks, opts) => {
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i];
      await downloadHook(hook);
    }
  });
