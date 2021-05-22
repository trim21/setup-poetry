import * as os from "os";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import { getLatestPoetryVersion, getPythonVersion, getTmpDir } from "./utils";
import * as cache from "./cache";

async function run (): Promise<void> {
  let installedVersion = core.getInput("version");
  // const preview = core.getInput('preview')
  const tmpDir = getTmpDir();
  const pythonVersion = await getPythonVersion();

  if (!installedVersion) {
    installedVersion = await getLatestPoetryVersion();
  }

  const flags = `--version=${installedVersion}`;

  if (!(await cache.restore(pythonVersion, installedVersion))) {
    await exec(
      `curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py -o ${tmpDir}/get-poetry.py`,
    );
    await exec(`python ${tmpDir}/get-poetry.py --yes ${flags}`);
    await cache.setup(pythonVersion, installedVersion);
  }
  core.addPath(path.join(os.homedir(), ".poetry", "bin"));
}

run().catch((e) => {
  core.setFailed(e);
  process.exit(1);
});
