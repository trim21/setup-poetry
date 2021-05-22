import * as path from "path";
import { promises as fs } from "fs";

import { exec } from "@actions/exec";
import { HttpClient, HttpClientResponse } from "@actions/http-client";

interface PypiJson {
  info: { version: string };
}

export async function getLatestPoetryVersion(): Promise<string> {
  const http = new HttpClient("actions install poetry");
  const res: HttpClientResponse = await http.get(
    "https://pypi.org/pypi/poetry/json"
  );
  const body: string = await res.readBody();
  const obj: PypiJson = JSON.parse(body);
  return obj.info.version;
}

export async function getPythonVersion(): Promise<string> {
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
  return myOutput;
}

export async function createVenv(): Promise<string> {
  await exec("python", ["-m", "venv", ".venv"]);
  if (process.platform === "linux" || process.platform === "darwin") {
    return path.join(".venv", "bin", "python.exe");
  } else if (process.platform === "win32") {
    return path.join(".venv", "Scripts", "python.exe");
  }
  return "";
}

export async function createSymlink(poetryHome: string) {

  if (process.platform === "linux" || process.platform === "darwin") {
    await fs.symlink(path.join(poetryHome, "bin", "poetry"), path.join(".venv", "bin", "poetry.exe"));
  } else if (process.platform === "win32") {
    await fs.symlink(path.join(poetryHome, "bin", "poetry"), path.join(".venv", "Scripts", "poetry.exe"));
  }
}
