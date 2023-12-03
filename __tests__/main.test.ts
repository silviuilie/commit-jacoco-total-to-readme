/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */
import * as core from "@actions/core";
import * as main from "../src/main";
import * as fileUtils from "../src/files";

// Mock the action's main function
const runMock = jest.spyOn(main, "run");

// Other utilities
// Mock the GitHub Actions core library
// let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance;
let getInputMock: jest.SpyInstance;
// let setFailedMock: jest.SpyInstance
let checkFileExistenceMock: jest.SpyInstance;
let fileUtilsFindPreviousCoverageMock: jest.SpyInstance;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, "error").mockImplementation();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    // setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    checkFileExistenceMock = jest.spyOn(fileUtils, "checkExistence").mockImplementation();
    fileUtilsFindPreviousCoverageMock = jest.spyOn(fileUtils, "findPreviousCoverage").mockImplementation();
    // setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  });

  it("gets the file name from input", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case "readmeFileName":
          return "readme.MD";
        case "type":
          return "txt";
        default:
          return "";
      }
    });

    await main.run();
    expect(runMock).toHaveReturned();

    // Verify that all of the core library functions were called correctly
    // expect(debugMock).toHaveBeenNthCalledWith(1, 'filename is readme.MD')
    // expect(debugMock).toHaveBeenNthCalledWith(2, 'type is txt')
    expect(errorMock).not.toHaveBeenCalled();
  });

  it("old doc file (readme) contains a non compatible coverage badge", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case "readmeFileName":
          return "readme.md";
        case "jacocoFileName":
          return "invalid-file-name";
        default:
          return "";
      }
    });

    checkFileExistenceMock.mockImplementation(async (name: string): Promise<boolean> => {
      return new Promise<boolean>((resolve, reject) => {
        process.nextTick(() => {
          console.log(`fileUtilsMock.mockImplementation name : ${name}`);
          switch (name) {
            case "readme.md":
              resolve(true);
              break;
            case "invalid-file-name":
              resolve(false);
              break;
            default:
              const err = `File ${name} not found`;
              console.log(err);
              reject(Error(err));
          }
        });
      });
    });

    fileUtilsFindPreviousCoverageMock.mockImplementation((readmeFileName: string,
                                                          left: string,
                                                          right: string): string => {
      return "https://coveralls.io/repos/silviuilie/reload-log4j/badge.png?branch=master";
    });

    await main.run();
    expect(getInputMock).toHaveReturned();
    expect(checkFileExistenceMock).toHaveReturned();
    expect(fileUtilsFindPreviousCoverageMock).toHaveReturned();
    expect(runMock).toHaveReturned();

  });

  it("sets a failed status", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case "readmeFileName":
          return "readme.md";
        case "jacocoFileName":
          return "invalid-file-name";
        default:
          return "";
      }
    });

    checkFileExistenceMock.mockImplementation(async (name: string): Promise<boolean> => {
      return new Promise<boolean>((resolve, reject) => {
        process.nextTick(() => {
          console.log(`fileUtilsMock.mockImplementation name : ${name}`);
          switch (name) {
            case "readme.md":
              resolve(true);
              break;
            case "invalid-file-name":
              resolve(false);
              break;
            default:
              const err = `File ${name} not found`;
              console.log(err);
              reject(Error(err));
          }
        });
      });
    });

    fileUtilsFindPreviousCoverageMock.mockImplementation((readmeFileName: string,
                                                          left: string,
                                                          right: string): string => {
      return "0.6";
    });

    await main.run();
    expect(getInputMock).toHaveReturned();
    expect(checkFileExistenceMock).toHaveReturned();
    expect(fileUtilsFindPreviousCoverageMock).toHaveReturned();
    expect(runMock).toHaveReturned();

    // Verify that all of the core library functions were called correctly
    // expect(setFailedMock).toHaveBeenNthCalledWith(1, 'File @%^# not found')
    // await expect(setFailedMock).toHaveReturned()
    // expect(errorMock).not.toHaveBeenCalled()
  });
});
