import * as core from '@actions/core'
import * as fileUtils from './files'

/*
  total coverage value from jacoco is contained between the following patterns:
 */
const _jacocoTotalCoverageStart = '</package><counter type="INSTRUCTION"'
const _jacocoTotalCoverageEnd = '/><counter type="BRANCH"'

const _readmeTotalCoverageStart = '[![Coverage Status]('
const _readmeTotalCoverageEnd = ')'

const _defaultReadmeName = 'readme.md'
const _defaultJacocoFileName = 'target/site/jacoco/jacoco.xml'
const _defaultType = 'svg'
const _defaultMinim = '0.6'

/**
 * @returns {Promise<void>} Resolves when the action is complete
 */
export async function run(): Promise<void> {
  try {
    const readmeFileName: string = resolveFile(
      core.getInput('readmeFileName') || _defaultReadmeName
    )

    const jacocoFileName: string = resolveFile(
      core.getInput('jacocoFileName') || _defaultJacocoFileName
    )

    const type: string = core.getInput('type') || _defaultType
    const minim: string = core.getInput('minim') || _defaultMinim

    core.info(`#run filename is ${readmeFileName}`)
    core.info(`#run type is ${jacocoFileName}`)
    core.info(`#run type is ${type}`)
    core.info(`#run minimum is ${minim}`)

    const fileFound = await fileUtils.checkExistence(readmeFileName)
    core.info(`#run file ${readmeFileName} found : ${fileFound}`)

    if (!fileFound) {
      core.setFailed(
        `required coverage report target file not found : ${fileFound}`
      )
      core.warning(
        `#run file not found : ${readmeFileName} using ${_defaultReadmeName}`
      )
    } else {
      core.info(`#run read file ${readmeFileName}`)

      // TODO : if type is 'svg', extract the previous value svg file name ([![Coverage](<coverage-svg-file>)] and value (file from aria-label="Coverage: <VALUE>%")
      // TODO : if type is 'text' or 'badge' extract the previous value

      const oldTotal = fileUtils.findPreviousCoverage(
        readmeFileName || _defaultReadmeName,
        _readmeTotalCoverageStart,
        _readmeTotalCoverageEnd
      )
      fileUtils.printFile(`old total : ${oldTotal}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }

  function resolveFile(fileName: string): string {
    let resolvedName = fileName
    const fileFound = fileUtils.checkExistence(resolvedName)
    if (!fileFound) {
      core.warning(
        `#run file not found : [${resolvedName}]`
      )
      core.setFailed(`required file not found : ${resolvedName}`)
    }

    return resolvedName
  }
}
