import { Config } from "../util/config";

export default abstract class Engine {
    config: Config;

    abstract getPath(yarnName: string): string | null | Promise<string | null>;

    startCache(): void | Promise<void> {
        // is caching
        // useful for starting to accumulate a new cache to write
    }

    abstract cachePackage(
        yarnName: string,
        path: string,
    ): boolean | null | Promise<boolean | null>;

    finishCache(): void | Promise<void> {
        // is no longer caching
        // useful for writing the newly accumulated cache information
    }
}
