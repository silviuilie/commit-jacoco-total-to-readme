import * as core from '@actions/core'
import * as fileUtils from './files'



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
    } else {
      core.info(`#run read file ${fileName}`)
      await fileUtils.printFile(fileName)
    }

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
