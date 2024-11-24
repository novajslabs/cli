import {existsSync} from "fs";
import {logger} from "@/src/utils/logger";
import chalk from "chalk";
import {Command} from "commander";
import prompts from "prompts";
import {z} from "zod";
import {downloadHook, getAllHooksName} from "@/src/utils/hook-actions";
import {getProjectLanguageExtension} from "@/src/utils/get-project-info";

const addOptionsSchema = z.object({
    overwrite: z.boolean().optional(),
    path: z.string().optional(),
    typescript: z.boolean().optional(),
});

export const vite = new Command()
    .name("vite")
    .description("add hooks to your Vite + React project")
    .option("-o, --overwrite", "overwrite existing files")
    .option("-p, --path <path>", "the path to add the hook to")
    .action(async (hooks, opts) => {
        const options = addOptionsSchema.parse({
            ...opts,
        });
        // Handle TypeScript or JavaScript
        const extension = getProjectLanguageExtension();
        console.log(extension)

        // Handle hooks selection
        const allHooks = await getAllHooksName();

        // Handle path selection
        let selectedPath = options.path ?? "";

        if (selectedPath === "") {
            const {path} = await prompts({
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

        for (let i = 0; i < allHooks.length; i++) {
            const hook = allHooks[i];

            // Handle overwrite
            if (
                options.overwrite === undefined &&
                existsSync(`${selectedPath}/${hook}.${extension}`)
            ) {
                const {overwrite} = await prompts({
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
