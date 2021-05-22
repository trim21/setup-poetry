import * as os from "os";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import { getLatestPoetryVersion, getPythonVersion, getTmpDir } from "./utils";
import * as cache from "./cache";

async function run(): Promise<void> {
  let installedVersion = core.getInput("version");
  // const preview = core.getInput('preview')
  const tmpDir = getTmpDir();
  const pythonVersion = await getPythonVersion();

  if (!installedVersion) {
    installedVersion = await getLatestPoetryVersion();
  }

  const flags = `--version ${installedVersion}`;
  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, installedVersion))) {
    const installer = "https://cdn.jsdelivr.net/gh/python-poetry/poetry@master/install-poetry.py";
    await exec(`curl -sSL ${installer} -o ${tmpDir}/install-poetry.py`);
    await exec(
      `python ${tmpDir}/install-poetry.py --yes ${flags} --path ${poetryHome}`,
      undefined,
      {
        env: {
          POETRY_HOME: poetryHome,
        },
      });
    await cache.setup(pythonVersion, installedVersion);
  }
  core.addPath(path.join(poetryHome, "bin"));
}

run().catch((e) => {
  core.setFailed(e);
  process.exit(1);
});
