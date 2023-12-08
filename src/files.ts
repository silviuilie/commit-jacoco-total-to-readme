import * as core from '@actions/core'
import glob from 'glob'
import * as fs from 'fs'

export function printFile(fileName: string): void {
  const content = fs.readFileSync(fileName, 'utf-8')
  core.info(`#printFile : ${content}`)
}

/**
 * finds last occurrence of any coverage badge (as defined by left/right pattern).
 */
export function findPreviousCoverage(
  fileName: string,
  leftPattern: string,
  rightPattern: string
): string {
  core.info(
    `find coverage for [${fileName}] and patterns L: [${leftPattern}] and R: [${rightPattern}]`
  )
  const content = fs.readFileSync(fileName, 'utf-8')

  const start = content.lastIndexOf(leftPattern)
  const foundCoverage = content.substring(
    start + leftPattern.length,
    content.indexOf(rightPattern, start)
  )

  core.info(`foundCoverage.length : [${foundCoverage.length}]`)
  core.info(`foundCoverage : [${foundCoverage}]`)

  return foundCoverage
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
