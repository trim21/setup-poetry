import "source-map-support/register";

import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as pep440 from "@renovatebot/pep440";

import * as cache from "./cache";
import {
  createSymlink,
  createVenv,
  getLatestMatchedVersion,
  getPoetryPypiJSON,
  getPythonVersion,
} from "./utils";

async function getExpectedPoetryVersion(
  wantedVersion: string,
  currentPythonVersion: [number, number, number],
): Promise<string> {
  core.debug("getExpectedPoetryVersion");
  const json = await getPoetryPypiJSON();

  const pyVer = currentPythonVersion.join(".");
  const currentPythonSupportedPoetry = Object.entries(json.releases)
    .filter(([key, values]) => {
      return (
        pep440.satisfies(key, ">=1.3") &&
        values.some((v) => pep440.satisfies(pyVer, v.requires_python))
      );
    })
    .map(([key]) => key);
  if (!currentPythonSupportedPoetry.length) {
    core.error(
      `can't find any poetry version support current python version ${pyVer}`,
    );
    throw new Error("can't find poetry version support current python");
  }

  if (!wantedVersion) {
    core.info("poetry version not specified, latest poetry will be installed");
    return currentPythonSupportedPoetry.sort(
      (a, b) => -pep440.compare(a, b),
    )[0];
  }

  const version = getLatestMatchedVersion(
    currentPythonSupportedPoetry,
    wantedVersion,
  );
  if (!version) {
    throw new Error(
      `can't get expected poetry version, ${JSON.stringify(wantedVersion)}`,
    );
  }
  return version;
}

async function run(): Promise<void> {
  let wantedVersion = core.getInput("version");
  const [pythonVersion, pythonSemverVersion] = await getPythonVersion();
  core.info(
    `using python version ${pythonSemverVersion}, full spec: ${pythonVersion}`,
  );
  const poetryVersion = await getExpectedPoetryVersion(
    wantedVersion,
    pythonSemverVersion,
  );

  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, poetryVersion))) {
    if (!fs.existsSync(poetryHome)) {
      fs.mkdirSync(poetryHome);
    }
    process.chdir(poetryHome);
    const pythonPath = await createVenv();
    await exec(pythonPath, [
      "-m",
      "pip",
      "install",
      `poetry${poetryVersion ? `==${poetryVersion}` : ""}`,
    ]);
    await cache.setup(pythonVersion, poetryVersion);
  }
  fs.mkdirSync(path.join(poetryHome, "bin"));
  await createSymlink(poetryHome);
  core.addPath(path.join(poetryHome, "bin"));
}

run().catch((e) => {
  core.error(e);
  core.setFailed(e);
  throw e;
});
