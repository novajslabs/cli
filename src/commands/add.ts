import { existsSync, promises as fs } from "fs";
import path from "path";
import { getConfig } from "@/src/utils/get-config";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { handleError } from "@/src/utils/handle-error";
import { logger } from "@/src/utils/logger";
import { transform } from "@/src/utils/transformers";
import chalk from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";
import { z } from "zod";
import { downloadHook, getAllHooksName } from "../utils/downloadHook";

const addOptionsSchema = z.object({
  hooks: z.array(z.string()).optional(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
});

export const add = new Command()
  .name("add")
  .description("add a hook to your project")
  .argument("[hooks...]", "the hooks to add")
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available hooks", false)
  .option("-p, --path <path>", "the path to add the hook to.")
  .action(async (hooks, opts) => {
    const options = addOptionsSchema.parse({
      hooks,
      ...opts,
    });

    const cwd = path.resolve(options.cwd);

    if (!existsSync(cwd)) {
      logger.error(`The path ${cwd} does not exist. Please try again.`);
      process.exit(1);
    }

    const allHooks = await getAllHooksName();

    let selectedHooks = options.all ? allHooks : options.hooks;

    if (!options.hooks?.length && !options.all && allHooks) {
      const { hooks } = await prompts({
        type: "multiselect",
        name: "hooks",
        message: "Which hooks would you like to add?",
        hint: "Space to select. A to toggle all. Enter to submit.",
        instructions: false,
        choices: allHooks.map((entry) => ({
          title: entry,
          value: entry,
          selected: options.all ? true : options.hooks?.includes(entry),
        })),
      });
      selectedHooks = hooks;
    }

    if (!selectedHooks?.length) {
      logger.warn("No hooks selected. Exiting.");
      process.exit(0);
    }

    for (let i = 0; i < selectedHooks.length; i++) {
      const hook = selectedHooks[i];
      await downloadHook(hook);
    }
  });
