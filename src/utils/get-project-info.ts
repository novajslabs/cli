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

    return dependencies.react && dependencies["react-dom"]
}