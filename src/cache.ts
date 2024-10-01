import * as os from "node:os";
import * as path from "node:path";
import * as crypto from "node:crypto";

import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { ReserveCacheError } from "@actions/cache";

const cacheHome = path.join(os.homedir(), ".poetry", ".venv");

function cacheKey(pyVersion: string, version: string): string {
  const md5 = crypto.createHash("md5");
  const result = md5
    .update(process.platform + process.arch + pyVersion + version)
    .digest("hex");
  const key = `trim21-tool-poetry-6-${result}`;
  core.info(`cache with key ${key}`);
  return key;
}

export async function setup(
  pythonVersion: string,
  poetryVersion: string,
): Promise<void> {
  try {
    await cache.saveCache([cacheHome], cacheKey(pythonVersion, poetryVersion));
  } catch (error) {
    if (error?.toString().includes("another job may be creating this cache")) {
      return;
    }

    if (error instanceof ReserveCacheError) {
      throw error;
    }
    throw error;
  }
}

export async function restore(
  pythonVersion: string,
  poetryVersion: string,
): Promise<boolean> {
  const key = cacheKey(pythonVersion, poetryVersion);
  const restoreCache = await cache.restoreCache([cacheHome], key);
  core.info(`expected cache key ${JSON.stringify(key)}`);
  core.info(`restored cache key ${JSON.stringify(restoreCache)}`);
  core.info(`hit primary cache key ${key === restoreCache}`);
  return key === restoreCache;
}
