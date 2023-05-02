import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { ReserveCacheError } from "@actions/cache";

const cacheHome = path.join(os.homedir(), ".poetry", ".venv");

function cacheKey(pyVersion: string, version: string): string {
  const md5 = crypto.createHash("md5");
  const result = md5.update(process.platform + process.arch + pyVersion + version).digest("hex");
  const key = `trim21-tool-poetry-7-${result}`;
  core.info(`cache with key ${key}`);
  return key;
}

export async function setup(
  pythonVersion: string,
  poetryVersion: string
): Promise<void> {
  try {
    await cache.saveCache([cacheHome], cacheKey(pythonVersion, poetryVersion));
  } catch (e) {
    if (e?.toString().includes("another job may be creating this cache")) {
      return;
    }

    if (e instanceof ReserveCacheError) {
      throw e;
    }
    throw e;
  }
}

export async function restore(
  pythonVersion: string,
  poetryVersion: string
): Promise<Boolean> {
  const key = cacheKey(pythonVersion, poetryVersion);
  const restoreCache = await cache.restoreCache([cacheHome], key);
  core.info(`expected cache key ${JSON.stringify(key)}`);
  core.info(`restored cache key ${JSON.stringify(restoreCache)}`);
  core.info(`hit primary cache key ${key === restoreCache}`);
  return key === restoreCache;
}
