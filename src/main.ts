import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import * as cache from "./cache";
import {
  createSymlink,
  createVenv, getLatestMatchedVersion,
  getLatestPoetryVersion, getPoetryPypiJSON,
  getPythonVersion,
} from "./utils";

async function run(): Promise<void> {
  let wantedVersion = core.getInput("version");

  const pythonVersion = await getPythonVersion();
  let toInstall: string | null = null;

  if (!wantedVersion) {
    toInstall = await getLatestPoetryVersion();
  } else {
    const json = await getPoetryPypiJSON();
    toInstall = getLatestMatchedVersion(Object.keys(json.releases), wantedVersion);
    if (!toInstall) {
      throw new Error(`can't get expected poetry version, ${JSON.stringify(wantedVersion)}`);
    }
  }

  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, wantedVersion))) {
    if (!fs.existsSync(poetryHome)) {
      fs.mkdirSync(poetryHome);
    }
    process.chdir(poetryHome);
    const pythonPath = await createVenv();
    await exec(pythonPath, ["-m", "pip", "install", `poetry${toInstall ? `==${toInstall}` : ""}`]);
    await cache.setup(pythonVersion, wantedVersion);
  }
  fs.mkdirSync(path.join(poetryHome, "bin"));
  await createSymlink(poetryHome);
  core.addPath(path.join(poetryHome, "bin"));
}

run().catch((e) => {
  core.error(e);
  core.setFailed(e);
  process.exit(1);
});
