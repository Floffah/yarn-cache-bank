import Engine from "./Engine";
import { resolve } from "path";
import { parse as jjuParse, stringify as jjuStringify } from "jju";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

export interface FlatfileCache {
    cache: [string, string][];
}

export default class FlatfileEngine extends Engine {
    filecache?: Map<string, string>; //yarnPath: cached path (the flatfile engine's one)

    getCache<Parse extends boolean = false>(
        parse?: Parse,
    ): Parse extends true
        ?
              | {
                    worked: false;
                    datapath: string;
                    cachepath: string;
                    cache?: undefined;
                }
              | {
                    worked: true;
                    datapath: string;
                    cachepath: string;
                    cache: FlatfileCache;
                }
        :
              | {
                    worked: false;
                    datapath: string;
                    cachepath: string;
                    cache: undefined;
                }
              | {
                    worked: true;
                    datapath: string;
                    cachepath: string;
                    cache: FlatfileCache | undefined;
                } {
        const datapath = resolve(this.config.location, "flatfile");
        const cachepath = resolve(datapath, "cache.json");

        if (!existsSync(datapath) || !existsSync(cachepath))
            return { worked: false, datapath, cachepath, cache: undefined };

        if (parse)
            return {
                datapath,
                cachepath,
                cache: jjuParse(readFileSync(cachepath, "utf-8")),
                worked: true,
            };
        else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return {
                datapath,
                cachepath,
                cache: undefined,
                worked: true,
            };
        }
    }

    getPath(yarnName: string) {
        if (this.filecache && this.filecache.has(yarnName))
            return this.filecache.get(yarnName) as string;

        const cache = this.getCache(false);

        if (existsSync(resolve(cache.datapath, yarnName)))
            return resolve(cache.datapath, yarnName);
        else return null;
    }

    startCache() {
        const cache = this.getCache(true);

        if (!cache.worked) this.filecache = new Map();

        try {
            if (cache.cache) this.filecache = new Map(cache.cache?.cache);
            else this.filecache = new Map();
        } catch {
            this.filecache = new Map();
        }
    }

    cachePackage(yarnName: string, path: string) {
        const cache = this.getCache();
        if (!cache.worked) mkdirSync(cache.datapath, { recursive: true });

        const pkgcachepath = resolve(cache.datapath, yarnName);
        this.filecache?.set(yarnName, pkgcachepath);
        if (existsSync(pkgcachepath)) return false;

        writeFileSync(pkgcachepath, readFileSync(path));
        return true;
    }

    finishCache() {
        if (!this.filecache) return;

        const cache = this.getCache(false);

        writeFileSync(
            cache.cachepath,
            jjuStringify(
                { cache: [...this.filecache.entries()] },
                { mode: "json" },
            ),
        );
        this.filecache = undefined;
    }
}
