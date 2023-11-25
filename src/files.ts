import * as core from '@actions/core'
import glob from 'glob'
import * as fs from 'fs';

export async function printFile(fileName: string) {
  const content = fs.readFileSync(fileName, 'utf-8');
  core.info(`#printFile : ${printFile}`)
}

export async function checkExistence(pattern: string): Promise<boolean> {
  const globOptions = {
    follow: !(
      (core.getInput('follow_symlinks') || 'true').toUpperCase() === 'FALSE'
    ),
    nocase: (core.getInput('ignore_case') || 'false').toUpperCase() === 'TRUE'
  }
  return new Promise((resolve, reject) => {
    glob(pattern, globOptions, (err: unknown, files: string[]) => {
      if (err) {
        reject(err)
      } else {
        resolve(files.length > 0)
      }
    })
  })
}
