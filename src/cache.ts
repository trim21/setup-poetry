import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { ReserveCacheError } from "@actions/cache";

const paths = [path.join(os.homedir(), ".poetry", ".venv")];

function cacheKey(pyVersion: string, version: string): string {
  const md5 = crypto.createHash("md5");
  const result = md5.update(pyVersion + version).digest("hex");
  const key = `trim21-tool-poetry-5-${process.platform}-${result}`;
  core.info(`cache with key ${key}`);
  return key;
}

export async function setup(
  pythonVersion: string,
  poetryVersion: string
): Promise<void> {
  try {
    await cache.saveCache(paths, cacheKey(pythonVersion, poetryVersion));
  } catch (e) {
    if (e instanceof ReserveCacheError) {
      if (e.toString().includes("another job may be creating this cache")) {
        return;
      }
      throw e;
    }
    throw e;
  }
}

export async function restore(
  pythonVersion: string,
  poetryVersion: string
): Promise<Boolean> {
  return !!(await cache.restoreCache(
    paths,
    cacheKey(pythonVersion, poetryVersion)
  ));
}
