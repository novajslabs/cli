import fs from "fs/promises";
import fetch from "node-fetch";

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
    "https://api.github.com/repos/novajslabs/nova.js/contents/src/hooks";

  try {
    const response = await fetch(allHooksUrl);

    if (!response.ok) {
      throw Error;
    }

    const hooksData = (await response.json()) as HookList[];

    return hooksData.map((hook) => hook.name.replace(".ts", ""));
  } catch (e) {
    //console.log(`❌ ${hook} error`);
  }
};

export const downloadHook = async (hookName: string) => {
  const hookUrl = `https://raw.githubusercontent.com/novajslabs/nova.js/main/src/hooks/${hookName}.ts`;

  try {
    const response = await fetch(hookUrl);

    if (!response.ok) {
      throw Error;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(`${hookName}.ts`, buffer);
    console.log(`✅ ${hookName} added`);
  } catch (e) {
    console.log(`❌ ${hookName} error`);
  }
};
