import * as core from "@actions/core";
import * as fileUtils from "./files";

/*
  total coverage value from jacoco is contained between the following patterns:
 */
const _jacocoTotalCoverageStart = "</package><counter type=\"INSTRUCTION\"";
const _jacocoTotalCoverageEnd = "/><counter type=\"BRANCH\"";

const _readmeTotalCoverageStart = "[![Coverage Status](";
const _readmeTotalCoverageEnd = ")]";

const _badgeSvgTotalCoverageStart = "<title>Coverage: "; //51.00%
const _badgeSvgTotalCoverageEnd = "</title>";

const _defaultReadmeName = "readme.md";
const _defaultJacocoFileName = "target/site/jacoco/jacoco.xml";
const _supportedTypes = ["svg", "text", "badge"];
const _defaultType = "svg";
const _defaultMinim = "0.6";

/**
 * @returns {Promise<void>} Resolves when the action is complete
 */
export async function run(): Promise<void> {
  function isSupported(oldCoverage: string): boolean {
    let supported = false;
    for (const supportedType of _supportedTypes) {
      if (oldCoverage.includes(supportedType)) {
        supported = true;
        break;
      }
    }
    console.log(`#isSupported returns ${supported}`);
    return supported;
  }

  try {
    const readmeFileName: string = resolveFile(
      core.getInput("readmeFileName") || _defaultReadmeName
    );

    const jacocoFileName: string = resolveFile(
      core.getInput("jacocoFileName") || _defaultJacocoFileName
    );

    const type: string = core.getInput("type") || _defaultType;
    const minim: string = core.getInput("minim") || _defaultMinim;

    core.info(`#run filename is ${readmeFileName}`);
    core.info(`#run type is ${jacocoFileName}`);
    core.info(`#run type is ${type}`);
    core.info(`#run minimum is ${minim}`);

    const fileFound = await fileUtils.checkExistence(readmeFileName);
    core.info(`#run file ${readmeFileName} found : ${fileFound}`);

    if (!fileFound) {
      core.setFailed(
        `required coverage report target file not found : ${fileFound}`
      );
      core.warning(
        `#run file not found : ${readmeFileName} using ${_defaultReadmeName}`
      );
    } else {
      core.info(`#run read file ${readmeFileName}`);

      // TODO : if type is 'svg', extract the previous value svg file name ([![Coverage](<coverage-svg-file>)] and value (file from aria-label="Coverage: <VALUE>%")
      // TODO : if type is 'text' or 'badge' extract the previous value

      const oldCoverage = fileUtils.findInFile(
        readmeFileName || _defaultReadmeName,
        _readmeTotalCoverageStart,
        _readmeTotalCoverageEnd
      );

      core.info(`#run oldCoverage is ${oldCoverage}`);
      if (isSupported(oldCoverage)) {
        //fileUtils.printFile(`old total : ${oldCoverage}`)
        core.info(`handle supported coverage type ${oldCoverage}`);

        const oldCoverageValue = fileUtils.findInFile(
          oldCoverage,
          _badgeSvgTotalCoverageStart,
          _badgeSvgTotalCoverageEnd
        );
        core.info(`handle supported oldCoverageValue type ${oldCoverageValue}`);

        const currentBuildCoverage = fileUtils.findInFile(
          _defaultJacocoFileName,
          _jacocoTotalCoverageStart,
          _jacocoTotalCoverageEnd
        );
        core.info(
          `handle supported currentBuildCoverage type ${currentBuildCoverage}`
        );

        function jacocoCoverage(input: string): Record<string, number> {
          const result: Record<string, number> = {};
          const keyValuePairs = input.split(" ");
          keyValuePairs.forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key && value) {
              result[key] = +value.replaceAll("\"", "");
            }
          });

          return result;
        }

        const jacocoNewCoverage: Record<string, number> = jacocoCoverage(currentBuildCoverage);
        core.info(
          `new jacocoNewCoverage :  ${jacocoNewCoverage.missed}: ${jacocoNewCoverage.covered}`
        );
        const latestTotal: number = jacocoNewCoverage.missed + jacocoNewCoverage.covered;

        const latestCoverage: string = (jacocoNewCoverage.covered / latestTotal).toPrecision(2);
        core.info(
          `new jacocoNewCoverage total lines vs covered :  ${latestTotal}: ${latestCoverage}`
        );

        fileUtils.replaceInFile(oldCoverage, oldCoverageValue, latestCoverage+"%");
        fileUtils.printFile(oldCoverage)

      } else {
        const recommendedFix = `You can add "${_readmeTotalCoverageStart}${type}${_readmeTotalCoverageEnd}" to your ${readmeFileName} to fix this error.`;
        const notSupportedOldCoverage = `failed to match old coverage [${oldCoverage}] to supported coverage badge types : ${_supportedTypes}. You have to add a supported coverage badge to your ${readmeFileName} so it can be replaced by this action.${recommendedFix}`;
        core.warning(notSupportedOldCoverage);
        core.error(notSupportedOldCoverage);
      }
    }
  } catch (error: any) {
    // Fail the workflow run if an error occurs
    core.debug(error);
    if (error instanceof Error) core.setFailed(error.message);
  }

  function resolveFile(fileName: string): string {
    const resolvedName = fileName;
    const fileFound = fileUtils.checkExistence(resolvedName);
    if (!fileFound) {
      core.warning(`#run file not found : [${resolvedName}]`);
      core.setFailed(`required file not found : ${resolvedName}`);
    }

    return resolvedName;
  }
}
