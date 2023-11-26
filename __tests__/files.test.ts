/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as files from "../src/files";
import * as fs from "fs";

jest.mock("fs", () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual("fs")
  };
});

// Mock the action's entrypoint
const findLastMock = jest.spyOn(files, "findPreviousCoverage");

let readFileSyncMock: jest.SpyInstance;

describe("test findLast coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    readFileSyncMock = jest.spyOn(fs, "readFileSync").mockImplementation();
  });

  it("gets the file from input and finds coverage", () => {
    // Set the action's inputs as return values from core.getInput()
    readFileSyncMock.mockImplementation(
      (fileName: string, encoding: string): string => {
        console.debug(`#readFileSyncMock (${fileName},${encoding})`);
        switch (fileName) {
          case "readme.md":
            return (
              "\n" +
              "\n" +
              "[![java/maven build](https://github.com/silviuilie/reload-quartz/actions/workflows/maven.yml/badge.svg)](https://github.com/silviuilie/reload-quartz/actions/workflows/maven.yml)\n" +
              "[![Coverage](./doc/badges/coverage.svg)](./doc/badges/coverage.svg)\n" +
              "[![Dependency Status](https://www.versioneye.com/user/projects/54436bbf53acfaccc8000025/badge.svg?style=flat)](https://www.versioneye.com/user/projects/54436bbf53acfaccc8000025)\n" +
              " "
            );
          default:
            return "";
        }
      }
    );

    const actualPrevCov = files.findPreviousCoverage("readme.md", "[![Coverage](", ")](./doc/badges/coverage.svg)");

    expect(actualPrevCov).toBe('./doc/badges/coverage.svg')
    expect(readFileSyncMock).toHaveBeenCalled();
    expect(findLastMock).toHaveReturned();
  });
});
