import fs from "fs/promises";
import fetch from "node-fetch";
import { logger } from "@/src/utils/logger";

interface HookList {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export const getAllHooksName = async () => {
  const allHooksUrl =
    "https://api.github.com/repos/novajslabs/nova.js/contents/src/hooks/ts";

  try {
    const response = await fetch(allHooksUrl);

    if (!response.ok) {
      throw Error;
    }

    const hooksData = (await response.json()) as HookList[];

    return hooksData.map((hook) => hook.name.replace(".ts", ""));
  } catch (e) {
    logger.error("Error obtaining the list of hooks. Try again.");
    process.exit(1);
  }
};

export const downloadHook = async (
  hookName: string,
  path: string,
  type: "ts" | "js"
) => {
  const hookUrl = `https://raw.githubusercontent.com/novajslabs/nova.js/main/src/hooks/${type}/${hookName}.${type}`;

  try {
    const response = await fetch(hookUrl);

    if (!response.ok) {
      throw Error;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(`${path}/${hookName}.${type}`, buffer);
    logger.success(`Added ${hookName}`);
  } catch (e) {
    logger.error(`An error occurred adding ${hookName}. Try again.`);
  }
};
