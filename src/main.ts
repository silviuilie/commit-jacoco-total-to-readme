import * as core from "@actions/core";
import * as fileUtils from "./files";

/*
  total coverage value from jacoco is contained between the following patterns:
 */
const _jacocoTotalCoverageStart = "</package><counter type=\"INSTRUCTION\"";
const _jacocoTotalCoverageEnd = "/><counter type=\"BRANCH\"";

const _readmeTotalCoverageStart = "![Coverage Status](";
const _readmeTotalCoverageEnd = ")";
const _svgTemplate=
  '<svg xmlns="http://www.w3.org/2000/svg" width="103" height="20" role="img" aria-label="coverage: 100%"><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="103" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="61" height="20" fill="#555"/><rect x="61" width="42" height="20" fill="${badgeColor}"/><rect width="103" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="315" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="510">coverage</text><text x="315" y="140" transform="scale(.1)" fill="#fff" textLength="510">coverage</text><text aria-hidden="true" x="810" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="315">100%</text><text x="810" y="140" transform="scale(.1)" fill="#fff" textLength="315">100%</text></g></svg>';


const _supportedTypes = ["svg", "text", "badge"];

interface BadgeConfiguration {
  type: string;
  placeHolderSearch: string[];
}

const badgeCfg: BadgeConfiguration[] = [
  {
    type: "badge",
    placeHolderSearch: [_readmeTotalCoverageStart, _readmeTotalCoverageEnd]
  },
  {
    type: "svg",
    placeHolderSearch: [_readmeTotalCoverageStart, _readmeTotalCoverageEnd]
  },
  {
    type: "text",
    placeHolderSearch: ["coverage : \\[", "\\]"] //coverage : \[ ${\textsf{\color{red}00.00}}$ % \]
  }
];



const _badgeSvgTotalCoverageStart = "<title>Coverage: "; //51.00%
const _badgeSvgTotalCoverageEnd = "</title>";

const _defaultReadmeName = "readme.md";
const _defaultJacocoFileName = "target/site/jacoco/jacoco.xml";
const _defaultType = "svg";
const _defaultMinim = "0.6";
const _defaultGreenMinim = "0.8";
const defaultCoverageColor = {
  yellow: "#dfb317",
  red: "#e05d44",
  green: "#4c1"
};

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
    return supported;
  }

  try {
    const readmeFileName: string = resolveFile(
      core.getInput("readmeFileName") || _defaultReadmeName
    );
    core.info(`#run readmeFileName is ${readmeFileName}`);

    const jacocoFileName: string = resolveFile(
      core.getInput("jacocoFileName") || _defaultJacocoFileName
    );
    core.info(`#run jacocoFileName is ${jacocoFileName}`);

    const type: string = core.getInput("type") || _defaultType;
    core.info(`#run type is ${type}`);

    const minimCoverage: string = core.getInput("minim") || _defaultMinim;
    core.info(`#run minimum Coverage is ${minimCoverage}`);

    const fileFound = await fileUtils.exists(readmeFileName);
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

        // const latestCoverage: string = ((jacocoNewCoverage.covered / latestTotal)*100).toPrecision(4);
        const latestCoverageRatio = parseFloat((jacocoNewCoverage.covered / latestTotal).toFixed(4));
        const latestCoverage: string = parseFloat(
          "" + latestCoverageRatio * 100
        ).toPrecision(4);

        core.info(
          `new jacocoNewCoverage total lines vs covered :  ${latestTotal}: ${latestCoverage}`
        );

        var badgeColor = defaultCoverageColor.red;
        if (latestCoverageRatio > parseFloat(_defaultGreenMinim)) {
          core.info(
            `green ${latestCoverageRatio} > ${parseFloat(_defaultGreenMinim)}`
          );
          badgeColor = defaultCoverageColor.green;
        } else if (latestCoverageRatio > parseFloat(_defaultMinim)) {
          badgeColor = defaultCoverageColor.yellow;
          core.info(
            `yellow ${latestCoverageRatio} > ${parseFloat(_defaultMinim)}`
          );
        }
        core.info(
          `badgeColor a= ${_svgTemplate}`
        );
        core.info(
          `badgeColor b= ` + _svgTemplate.replace('${badgeColor}',badgeColor)
        );

        core.info(
          `readmeFileName = ${readmeFileName}  oldCoverage = ${oldCoverage} latestCoverage = ${latestCoverage}%`
        );
        fileUtils.replace(oldCoverage, oldCoverageValue, latestCoverage + "%");
        fileUtils.push().then(() => {
          core.info("push complete");
        }, () => {
        });
        // fileUtils.printFile(oldCoverage)
        // await fileUtils.push(oldCoverage)

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
    const fileFound = fileUtils.exists(resolvedName);
    if (!fileFound) {
      core.warning(`#run file not found : [${resolvedName}]`);
      core.setFailed(`required file not found : ${resolvedName}`);
    }

    return resolvedName;
  }
}
