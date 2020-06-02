import fs from 'fs'
import path from 'path'
import os from 'os'
import {HttpClient, HttpClientResponse} from '@actions/http-client'

type pypiJson = {info: {version: string}}

export async function getLatestVersion(): Promise<string> {
  let http = new HttpClient('actions install poetry')
  let res: HttpClientResponse = await http.get('https://pypi.org/pypi/poetry/json')
  expect(res.message.statusCode).toBe(200)
  let body: string = await res.readBody()
  let obj: pypiJson = JSON.parse(body)
  return obj.info.version
}

export function getTmpDir(): string {
  const tmpBase = os.tmpdir()
  const tmp = path.join(tmpBase, 'setup-poetry')
  path.join(tmpBase, 'setup-poetry')
  fs.mkdirSync(tmp)
  return tmp
}
