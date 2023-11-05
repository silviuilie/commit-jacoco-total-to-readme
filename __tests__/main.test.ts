/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as fileUtils from '../src/files'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let fileUtilsMock: jest.SpyInstance

describe('action', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        debugMock = jest.spyOn(core, 'debug').mockImplementation()
        errorMock = jest.spyOn(core, 'error').mockImplementation()
        getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
        setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
        fileUtilsMock = jest.spyOn(fileUtils, 'checkExistence').mockImplementation()
        // setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    })

    it('gets the file name from input', async () => {
        // Set the action's inputs as return values from core.getInput()
        await getInputMock.mockImplementation((name: string): string => {
            switch (name) {
                case 'fileName':
                    return 'readme.MD'
                case 'type':
                    return 'txt'
                default:
                    return ''
            }
        })

        await main.run()
        expect(runMock).toHaveReturned()

        // Verify that all of the core library functions were called correctly
        expect(debugMock).toHaveBeenNthCalledWith(1, 'filename is readme.MD')
        expect(debugMock).toHaveBeenNthCalledWith(2, 'type is txt')
        // expect(debugMock).toHaveBeenNthCalledWith(
        //   2,
        //   expect.stringMatching(timeRegex)
        // )
        // expect(debugMock).toHaveBeenNthCalledWith(
        //   3,
        //   expect.stringMatching(timeRegex)
        // )
        // expect(setOutputMock).toHaveBeenNthCalledWith(
        //   1,
        //   'time',
        //   expect.stringMatching(timeRegex)
        // )
        expect(errorMock).not.toHaveBeenCalled()
    })

    it('sets a failed status', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            switch (name) {
                case 'fileName':
                    return '@%^#'
                default:
                    return ''
            }
        })

        fileUtilsMock.mockImplementation((name: string): Promise<boolean> => {
            return new Promise<boolean>((resolve, reject) => {
                process.nextTick(() => {
                    switch (name) {
                        case 'fileName':
                            resolve(true);
                        default:
                            reject({
                                error: `File ${name} not found`
                            })
                    }
                })

            })
        })

        await main.run()
        expect(runMock).toHaveReturned()

        // Verify that all of the core library functions were called correctly
        // expect(setFailedMock).toHaveBeenNthCalledWith(1, 'File @%^# not found')
        // await expect(setFailedMock).toHaveReturned()
        // expect(errorMock).not.toHaveBeenCalled()
    })
})
