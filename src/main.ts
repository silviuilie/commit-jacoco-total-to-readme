import * as core from '@actions/core'
import * as fileUtils from './files'

/*
  total coverage value from jacoco is contained between the following patterns:
 */
const _jacocoTotalCoverageStart = "</package><counter type=\"INSTRUCTION\"";
const _jacocoTotalCoverageEnd = "/><counter type=\"BRANCH\"";

const _defaultReadmeName = "readme.md"

/**
 * @returns {Promise<void>} Resolves when the action is complete
 */
export async function run(): Promise<void> {
  try {
    const fileName: string = core.getInput('fileName')
    const type: string = core.getInput('type')

    core.info(`#run filename is ${fileName}`)
    core.info(`#run type is ${type}`)

    const fileFound = await fileUtils.checkExistence(fileName)
    core.info(`#run file ${fileName} found : ${fileFound}`)
    if (!fileFound) {
      core.setFailed(`file not found : ${fileFound}`)
      core.warning(`#run file not found : ${fileName} using ${_defaultReadmeName}`)

    } else {
      core.info(`#run read file ${fileName}`)

      // TODO : if type is 'svg', extract the previous value svg file name ([![Coverage](<coverage-svg-file>)] and value (file from aria-label="Coverage: <VALUE>%")
      // TODO : if type is 'text' or 'badge' extract the previous value

      const newTotal = fileUtils.findPreviousCoverage(
        fileName || _defaultReadmeName,
        _jacocoTotalCoverageStart,
        _jacocoTotalCoverageEnd
      );
      await fileUtils.printFile(`new total : ${fileName}`)
    }

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
