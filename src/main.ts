import fs from 'fs'
import path from 'path'
import os from 'os'

import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {getLatestVersion, getTmpDir} from './utils'
import {restoreCache} from './cache'

async function run(): Promise<void> {
  let installedVersion = core.getInput('version')
  const preview = core.getInput('preview')
  const tmpDir = getTmpDir()
  await exec(
    `curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py -o ${tmpDir}/get-poetry.py`
  )

  if (!installedVersion) {
    installedVersion = await getLatestVersion()
  }

  const flags = `--version=${installedVersion}`

  if (!(await restoreCache(installedVersion))) {
    await exec(`python ${tmpDir}/get-poetry.py --yes ${flags}`)
  }
  core.addPath(path.join(os.homedir(), '.poetry', 'bin'))
  fs.unlinkSync('get-poetry.py')
}

run().catch(e => {
  core.setFailed(e)
  process.exit(1)
})
