import {Command} from "commander";
import {downloadHook, getAllHooksName} from "@/src/utils/hook-actions";
import {getProjectLanguageExtension, isProjectUsingReact} from "@/src/utils/get-project-info";
import {mkdirp} from "fs-extra";
import {logger} from "@/src/utils/logger";
import ora from "ora"

const PATH_FOR_HOOKS = "src/hooks";

export const vite = new Command()
    .name("vite")
    .description("add hooks to your Vite + React project")
    .action(async () => {
        const isUsingReact = isProjectUsingReact();
        if (!isUsingReact) {
            logger.error("The project is not using React. Exiting.");
            process.exit(1);
        }


        const extension = getProjectLanguageExtension();
        const allHooks = await getAllHooksName();

        try {
            await mkdirp(PATH_FOR_HOOKS);
        } catch (e) {
            logger.error("Error creating hooks directory. Try again.");
            process.exit(1);
        }

        const spinner = ora(`Adding hooks...`).start()

        for (const hook of allHooks) {
            await downloadHook(hook, PATH_FOR_HOOKS, extension);
        }

        spinner.succeed("Hooks added successfully.");
    });
