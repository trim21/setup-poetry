import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

import { exec } from "@actions/exec";
import { HttpClient, HttpClientResponse } from "@actions/http-client";

interface PypiJson {
  info: {version: string};
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

export function getTmpDir(): string {
  const tmpBase = os.tmpdir();
  const hex = crypto.randomBytes(16).toString("hex");
  const tmp = path.join(tmpBase, "setup-poetry-" + hex);
  fs.mkdirSync(tmp, { recursive: true });
  return tmp;
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
