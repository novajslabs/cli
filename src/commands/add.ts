import { existsSync } from "fs";
import { logger } from "@/src/utils/logger";
import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";
import { z } from "zod";
import { downloadHook, getAllHooksName } from "@/src/utils/hook-actions";

const addOptionsSchema = z.object({
  hooks: z.array(z.string()).optional(),
  overwrite: z.boolean().optional(),
  all: z.boolean(),
  path: z.string().optional(),
  typescript: z.boolean().optional(),
});

export const add = new Command()
  .name("add")
  .description("add a hook to your project")
  .argument("[hooks...]", "the hooks to add")
  .option("-o, --overwrite", "overwrite existing files")
  .option("-a, --all", "add all available hooks", false)
  .option("-p, --path <path>", "the path to add the hook to")
  .option("-t, --typescript", "add hook in typescript")
  .action(async (hooks, opts) => {
    const options = addOptionsSchema.parse({
      hooks,
      ...opts,
    });

    // Handle hooks selection
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

    // Handle path selection
    let selectedPath = options.path ?? "";

    if (selectedPath === "") {
      const { path } = await prompts({
        type: "text",
        name: "path",
        message: "Where would you like to add the hooks?",
        instructions: false,
      });

      selectedPath = path;
    }

    if (!existsSync(selectedPath)) {
      logger.error(
        `The path ${selectedPath} does not exist. Please try again.`
      );
      process.exit(1);
    }

    // Handle TypeScript or JavaScript
    let extension;

    if (options.typescript === undefined) {
      const { type } = await prompts({
        type: "select",
        name: "type",
        message: "TypeScript or JavaScript?",
        hint: "Space or Enter to submit.",
        instructions: false,
        choices: [
          {
            title: "TypeScript",
            value: "ts",
          },
          {
            title: "JavaScript",
            value: "js",
          },
        ],
      });

      if (!type) {
        logger.warn("No type selected. Exiting.");
        process.exit(0);
      }

      extension = type;
    } else {
      extension = "ts";
    }

    for (let i = 0; i < selectedHooks.length; i++) {
      const hook = selectedHooks[i];

      // Handle overwrite
      if (
        options.overwrite === undefined &&
        existsSync(`${selectedPath}/${hook}.${extension}`)
      ) {
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message: `Hook ${hook} already exists. Would you like to overwrite?`,
          initial: false,
        });

        if (!overwrite) {
          logger.info(
            `Skipped ${hook}. To overwrite, run with the ${chalk.green(
              "--overwrite"
            )} flag.`
          );
          continue;
        }
      }

      await downloadHook(hook, selectedPath, extension);
    }
  });
