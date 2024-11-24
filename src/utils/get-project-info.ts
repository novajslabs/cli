import {getPackageDependencies} from "@/src/utils/get-package-info";

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
    }

    return undefined;
}