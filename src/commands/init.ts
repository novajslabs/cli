import {Command} from "commander";
import {downloadHook, getAllHooksName} from "@/src/utils/hook-actions";
import {
    getProjectLanguageExtension,
    isProjectUsingReact,
    getProjectTechStack,
    isProjectUsingAppRouter,
    isProjectUsingSrcDir
} from "@/src/utils/get-project-info";
import {mkdirp} from "fs-extra";
import {logger} from "@/src/utils/logger";
import ora from "ora"
import {z} from "zod";
import {existsSync} from "fs";
import chalk from "chalk";
import prompts from "prompts";

const DEFAULT_PATH = "src/hooks";
const APP_WITHOUT_SRC_PATH = "app/hooks";
const PAGES_WITHOUT_SRC_PATH = "pages/hooks";

const addOptionsSchema = z.object({
    overwrite: z.boolean().optional(),
    path: z.string().optional(),
});

export const init = new Command()
    .name("init")
    .description("add React hooks to your Vite, Next.js or Astro project")
    .option("-o, --overwrite", "overwrite existing files")
    .option("-p, --path <path>", "the path to add the hook to")
    .action(async (opts) => {
        const options = addOptionsSchema.parse({
            ...opts,
        });

        const projectTechStack = getProjectTechStack();
        if (!projectTechStack) {
            logger.error("Project tech stack not detected. Exiting.");
            process.exit(1);
        }

        if (projectTechStack === "vite" || projectTechStack === "astro") {
            const isUsingReact = isProjectUsingReact();
            if (!isUsingReact) {
                logger.error("The project is not using React. Exiting.");
                process.exit(1);
            }
        }

        let path = options.path ?? DEFAULT_PATH;
        if (projectTechStack === "next" && !options.path) {
            const isUsingSrcDir = isProjectUsingSrcDir();

            if (!isUsingSrcDir) {
                const isUsingAppRouter = isProjectUsingAppRouter();
                path = isUsingAppRouter ? APP_WITHOUT_SRC_PATH : PAGES_WITHOUT_SRC_PATH;
            }
        }

        const extension = getProjectLanguageExtension();
        const allHooks = await getAllHooksName();

        try {
            await mkdirp(path);
        } catch (e) {
            logger.error("Error creating hooks directory. Try again.");
            process.exit(1);
        }

        const spinner = ora("Adding hooks...").start();

        for (const hook of allHooks) {
            // Handle overwrite
            if (
                options.overwrite === undefined &&
                existsSync(`${path}/${hook}.${extension}`)
            ) {
                spinner.stop();
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

            spinner.start("Adding hooks...");
            await downloadHook(hook, path, extension);
        }

        spinner.succeed("Hooks added successfully.");
    });
