import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import * as cache from "./cache";
import {
  createSymlink,
  createVenv,
  getLatestPoetryVersion,
  getPythonVersion,
} from "./utils";

async function run(): Promise<void> {
  let wantedVersion = core.getInput("version");
  // const preview = core.getInput('preview')
  const pythonVersion = await getPythonVersion();
  //
  if (!wantedVersion) {
    wantedVersion = await getLatestPoetryVersion();
  }
  const poetryHome = path.join(os.homedir(), ".poetry");

  if (!(await cache.restore(pythonVersion, wantedVersion))) {
    if (!fs.existsSync(poetryHome)) {
      fs.mkdirSync(poetryHome);
    }
    process.chdir(poetryHome);
    const pythonPath = await createVenv();
    await exec(pythonPath, ["-m", "pip", "install", `poetry==${wantedVersion}`]);
    await cache.setup(pythonVersion, wantedVersion);
  }
  fs.mkdirSync(path.join(poetryHome, "bin"));
  await createSymlink(poetryHome);
  core.addPath(path.join(poetryHome, "bin"));
}

await run();
