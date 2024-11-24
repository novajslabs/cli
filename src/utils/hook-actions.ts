import fs from "fs/promises";
import fetch from "node-fetch";
import {logger} from "@/src/utils/logger";

export const downloadHook = async (
    hookName: string,
    path: string,
    type: "ts" | "js"
) => {
    const hookUrl = `https://raw.githubusercontent.com/novajslabs/nova.js/main/src/hooks/${type}/${hookName}.${type}`;

    try {
        const response = await fetch(hookUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`The ${hookName} hook does not exist.`);
            } else {
                throw new Error(`An error occurred adding ${hookName}. Try again.`);
            }
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(`${path}/${hookName}.${type}`, buffer);
    } catch (e) {
        logger.error(e);
    }
};
