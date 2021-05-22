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
  //
  if (!installedVersion) {
    installedVersion = await getLatestPoetryVersion();
  }
  const installerPath = path.join(tmpDir, "install-poetry.py");
  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, installedVersion))) {
    const installer = "https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py";
    await exec("curl", ["-sSL", installer, "-o", installerPath]);
    await exec("python", [installerPath, "--yes", "--version", installedVersion],
      {
        env: {
          POETRY_HOME: poetryHome,
        },
      });
    await cache.setup(pythonVersion, installedVersion);
  }
  core.info(path.join(poetryHome, "bin"));
}

run().catch((e) => {
  core.setFailed(e);
  process.exit(1);
});
