import * as core from '@actions/core'
import * as fileUtils from './files'

/**
 * @returns {Promise<void>} Resolves when the action is complete
 */
export async function run(): Promise<void> {
  try {
    //const ms: string = core.getInput('milliseconds')
    const fileName: string = core.getInput('fileName')
    core.debug(`fileName : ${fileName}`)
    const type: string = core.getInput('type')
    core.debug(`type : ${type}`)

    core.debug(`filename is ${fileName}`)
    core.debug(`type is ${type}`)

    const fileFound = await fileUtils.checkExistence(fileName)
    core.debug(`file not found : ${fileFound}`)
    if (!fileFound) {
      core.setFailed(`file not found : ${fileFound}`)
    } else {
      core.debug(`file found : ${fileFound}`)
    }

    // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    //await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    //if (error instanceof Error) core.setFailed(error.message)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
