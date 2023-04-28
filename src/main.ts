import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import * as cache from "./cache";
import {
  createSymlink,
  createVenv, getLatestMatchedVersion,
  getPoetryPypiJSON,
  getPythonVersion,
} from "./utils";

async function getExpectedPoetryVersion(wantedVersion: string): Promise<string> {
  const json = await getPoetryPypiJSON();

  if (!wantedVersion) {
    core.info("poetry version not specified, latest poetry will be installed");
    return json.info.version;
  }

  const version = getLatestMatchedVersion(Object.keys(json.releases), wantedVersion);
  if (!version) {
    throw new Error(`can't get expected poetry version, ${JSON.stringify(wantedVersion)}`);
  }
  return version;
}

async function run(): Promise<void> {
  let wantedVersion = core.getInput("version");
  const poetryVersion = await getExpectedPoetryVersion(wantedVersion);
  const pythonVersion = await getPythonVersion();
  core.info(`using python version ${pythonVersion}`);

  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, poetryVersion))) {
    if (!fs.existsSync(poetryHome)) {
      fs.mkdirSync(poetryHome);
    }
    process.chdir(poetryHome);
    const pythonPath = await createVenv();
    await exec(pythonPath, ["-m", "pip", "install", `poetry${poetryVersion ? `==${poetryVersion}` : ""}`]);
    await cache.setup(pythonVersion, poetryVersion);
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
