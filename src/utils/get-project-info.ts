import {getPackageInfo} from "@/src/utils/get-package-info";

export const getProjectLanguageExtension = () => {
    let extension: "ts" | "js" = "js";
    const packageInfo = getPackageInfo();
    const dependencies = {
        ...packageInfo.dependencies,
        ...packageInfo.devDependencies,
    };

    if (dependencies.typescript) {
        extension = "ts";
    }

    return extension;
}