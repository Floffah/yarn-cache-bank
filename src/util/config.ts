import { resolve } from "path";
import { homedir } from "os";

export const defaultConfig = {
    location: resolve(homedir(), ".ycb"),
    engine: "flatfile",
};

export type Config = typeof defaultConfig;

export interface Cache {
    cached: { name: string; version: string; yarnName: string }[];
    projects: { rootpath: string; using: number[] }[]; // the using property is indexes from the cached property
}
