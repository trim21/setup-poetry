import os from 'os'
import path from 'path'

import cache from '@actions/cache'

const paths = [path.join(os.homedir(), '.poetry')]

function cacheKey(version: string): string {
  return `tool-poetry-1-${version}`
}

export async function setupCache(poetryVersion: string): Promise<Boolean> {
  return !!(await cache.saveCache(paths, cacheKey(poetryVersion)))
}

export async function restoreCache(poetryVersion: string): Promise<Boolean> {
  return !!(await cache.restoreCache(paths, cacheKey(poetryVersion)))
}
