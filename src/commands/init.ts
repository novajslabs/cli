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

const DEFAULT_PATH = "src/hooks";
const APP_WITHOUT_SRC_PATH = "app/hooks";
const PAGES_WITHOUT_SRC_PATH = "pages/hooks";

export const init = new Command()
    .name("init")
    .description("add React hooks to your Vite, Next.js or Astro project")
    .action(async () => {
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

        let path = DEFAULT_PATH;
        if (projectTechStack === "next") {
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

        const spinner = ora(`Adding hooks...`).start();

        for (const hook of allHooks) {
            await downloadHook(hook, path, extension);
        }

        spinner.succeed("Hooks added successfully.");
    });
