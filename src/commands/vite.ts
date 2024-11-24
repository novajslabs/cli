import {Command} from "commander";
import {downloadHook, getAllHooksName} from "@/src/utils/hook-actions";
import {getProjectLanguageExtension} from "@/src/utils/get-project-info";
import {mkdirp} from "fs-extra";
import {logger} from "@/src/utils/logger";

export const vite = new Command()
    .name("vite")
    .description("add hooks to your Vite + React project")
    .action(async (hooks, opts) => {
        const PATH_FOR_HOOKS = "src/hooks";

        // Handle TypeScript or JavaScript
        const extension = getProjectLanguageExtension();

        // Handle hooks selection
        const allHooks = await getAllHooksName();

        try {
            await mkdirp(PATH_FOR_HOOKS);
        } catch (e) {
            logger.error("Error creating hooks directory. Try again.");
            process.exit(1);
        }

        for (let i = 0; i < allHooks.length; i++) {
            const hook = allHooks[i];

            await downloadHook(hook, PATH_FOR_HOOKS, extension);
        }
    });
