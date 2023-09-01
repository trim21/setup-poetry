import * as path from "path";
import { promises as fs } from "fs";

import { exec } from "@actions/exec";
import { HttpClient, HttpClientResponse } from "@actions/http-client";
import * as pep440 from "@renovatebot/pep440";

interface PypiJson {
  info: {
    /**
     * latest poetry stable version
     */
    version: string;
  };
  releases: Record<string, [{
    requires_python: string;
    yanked: boolean;
  }]>;
}

export function getLatestMatchedVersion(versions: string[], specifier: string,): string | null {
  return pep440.maxSatisfying(versions, specifier);
}

export async function getPoetryPypiJSON(): Promise<PypiJson> {
  const http = new HttpClient("actions install poetry");
  const res: HttpClientResponse = await http.get(
    "https://pypi.org/pypi/poetry/json"
  );
  const body: string = await res.readBody();
  return JSON.parse(body) as PypiJson;
}

export async function getPythonVersion(): Promise<[string, [number, number, number]]> {
  let myOutput = "";
  const options = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      },
    },
  };

  await exec("python", ["-VV"], options);

  let semverOutput = "";
  const semverOptions = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        semverOutput += data.toString();
      },
    },
  };

  await exec("python", ["-c", "import sys,json;print(json.dumps(sys.version_info))"], semverOptions);

  return [myOutput, (JSON.parse(semverOutput) as Array<number>).slice(3) as [number, number, number]];
}

export async function createVenv(): Promise<string> {
  await exec("python", ["-m", "venv", ".venv"]);
  if (process.platform === "linux" || process.platform === "darwin") {
    return path.join(".venv", "bin", "python");
  } else if (process.platform === "win32") {
    return path.join(".venv", "Scripts", "python.exe");
  }
  return "";
}

export async function createSymlink(poetryHome: string) {
  if (process.platform === "linux" || process.platform === "darwin") {
    await fs.symlink(
      path.join(poetryHome, ".venv", "bin", "poetry"),
      path.join(poetryHome, "bin", "poetry"),
    );
  } else if (process.platform === "win32") {
    await fs.symlink(
      path.join(poetryHome, ".venv", "Scripts", "poetry.exe"),
      path.join(poetryHome, "bin", "poetry.exe"),
    );
  }
}
