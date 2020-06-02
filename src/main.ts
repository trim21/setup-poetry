import * as os from 'os'
import * as path from 'path'

import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { getLatestVersion, getPythonVersion, getTmpDir } from './utils'
import { restore, setup } from './cache'

async function run (): Promise<void> {
  let installedVersion = core.getInput('version')
  // const preview = core.getInput('preview')
  const tmpDir = getTmpDir()
  const pythonVersion = await getPythonVersion()

  if (!installedVersion) {
    installedVersion = await getLatestVersion()
  }

  const flags = `--version=${installedVersion}`

  if (!(await restore(pythonVersion, installedVersion))) {
    await exec(
      `curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py -o ${tmpDir}/get-poetry.py`
    )
    await exec(`python ${tmpDir}/get-poetry.py --yes ${flags}`)
    await setup(pythonVersion, installedVersion)
  }
  core.addPath(path.join(os.homedir(), '.poetry', 'bin'))
}

run().catch(e => {
  core.setFailed(e)
  process.exit(1)
})
