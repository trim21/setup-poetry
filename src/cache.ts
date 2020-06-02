import * as os from 'os'
import * as path from 'path'

import * as cache from '@actions/cache'
import * as crypto from 'crypto'
import * as core from '@actions/core'

const paths = [path.join(os.homedir(), '.poetry')]

function cacheKey(pyVersion: string, version: string): string {
  const md5 = crypto.createHash('md5')
  const result = md5.update(pyVersion).digest('hex')
  const key = `tool-poetry-1-${process.platform}-${result}-${version}`
  core.info(`cache with key ${key}`)
  return key
}

export async function setup(
  pythonVersion: string,
  poetryVersion: string
): Promise<Boolean> {
  return !!(await cache.saveCache(
    paths,
    cacheKey(pythonVersion, poetryVersion)
  ))
}

export async function restore(
  pythonVersion: string,
  poetryVersion: string
): Promise<Boolean> {
  return !!(await cache.restoreCache(
    paths,
    cacheKey(pythonVersion, poetryVersion)
  ))
}
