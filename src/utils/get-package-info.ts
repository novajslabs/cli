import path from "path"
import fs from "fs-extra"
import {type PackageJson} from "type-fest"

export const getPackageInfo = () => {
    const packageJsonPath = path.join("package.json")

    return fs.readJSONSync(packageJsonPath) as PackageJson
}

export const getPackageDependencies = () => {
    const packageInfo = getPackageInfo();
    
    return {
        ...packageInfo.dependencies,
        ...packageInfo.devDependencies,
    };
}