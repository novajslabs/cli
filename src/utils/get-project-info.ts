import {getPackageDependencies} from "@/src/utils/get-package-info";
import {existsSync} from "fs";

export const getProjectLanguageExtension = () => {
    let extension: "ts" | "js" = "js";
    const dependencies = getPackageDependencies();

    if (dependencies.typescript) {
        extension = "ts";
    }

    return extension;
}

export const isProjectUsingReact = () => {
    const dependencies = getPackageDependencies();

    return Boolean(dependencies.react && dependencies["react-dom"])
}

export const getProjectTechStack = () => {
    const dependencies = getPackageDependencies();

    if (dependencies.vite) {
        return "vite";
    } else if (dependencies.next) {
        return "next";
    } else if (dependencies.astro) {
        return "astro";
    } else if (dependencies["@remix-run/react"]) {
        return "remix";
    }

    return undefined;
}

export const isProjectUsingAppRouter = () => {
    return existsSync("src/app") || existsSync("app");
}

export const isProjectUsingSrcDir = () => {
    return existsSync("src");
}