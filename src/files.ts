import * as core from '@actions/core'
import glob from 'glob'
import * as fs from 'fs';

export async function printFile(fileName: string) {
  const content = fs.readFileSync(fileName, 'utf-8');
  core.info(`#printFile : ${content}`)
}

export  function findPreviousCoverage(fileName: string, leftPattern: string, rightPattern: string) {

  core.info(`find coverage for [${fileName}] and patterns L: [${leftPattern}] and R: [${rightPattern}]`)
  const content = fs.readFileSync(fileName, 'utf-8');
  core.info(`file content : ${content}`)

  return content.substring(
    content.lastIndexOf(leftPattern),
    content.lastIndexOf(rightPattern)
  )
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
