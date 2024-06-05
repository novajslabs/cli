import fs from "fs/promises";
import fetch from "node-fetch";

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
