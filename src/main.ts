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
  '<svg xmlns="http://www.w3.org/2000/svg" width="103" height="20" role="img" aria-label="coverage: 100%"><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="103" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="61" height="20" fill="#555"/><rect x="61" width="42" height="20" fill="{badgeColor}"/><rect width="103" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="315" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="510">coverage</text><text x="315" y="140" transform="scale(.1)" fill="#fff" textLength="510">coverage</text><text aria-hidden="true" x="830" y="150" fill="#010101" fill-opacity=".6" transform="scale(.1)" textLength="390">{badgeCoverage}</text><text x="830" y="140" transform="scale(.1)" fill="#fff" textLength="390">{badgeCoverage}</text></g></svg>';


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

const badgeConfigurations = new Map<string, BadgeConfiguration>()
badgeCfg.forEach(config=> {
  badgeConfigurations.set(config.type, config)
})


const _badgeSvgTotalCoverageStart = "<title>Coverage: "; //51.00%
const _badgeSvgTotalCoverageEnd = "</title>";

const _defaultReadmeName = "readme.md";
const _defaultJacocoFileName = "target/site/jacoco/jacoco.xml";
const _defaultType = "svg";
const _defaultMinim = "0.6";
const _defaultGreenMinim = "0.7";

const defaultCoverageColor = {
  yellow: "#dfb317",
  red: "#e05d44",
  green: "#4c1"
};

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

export async function run(): Promise<void> {
  try {
    const readmeFileName: string = resolveFile(
      core.getInput("readmeFileName") || _defaultReadmeName
    );
    core.debug(`#run readmeFileName is ${readmeFileName}`);

    const jacocoFileName: string = resolveFile(
      core.getInput("jacocoFileName") || _defaultJacocoFileName
    );
    core.debug(`#run jacocoFileName is ${jacocoFileName}`);

    const type: string = core.getInput("type") || _defaultType;
    core.debug(`#run type is ${type}`);

    const minimCoverage: string = core.getInput("minim") || _defaultMinim;
    core.debug(`#run minimum coverage is ${minimCoverage}`);

    const fileFound = await fileUtils.exists(readmeFileName);
    core.debug(`#run file ${readmeFileName} found : ${fileFound}`);

    if (!fileFound) {
      core.setFailed(
        `required coverage report target file not found : ${fileFound}`
      );
      core.warning(
        `#run file not found : ${readmeFileName} using ${_defaultReadmeName}`
      );
    } else {
      core.debug(`#run read file ${readmeFileName}`);

      // TODO : if type is 'text' or 'badge' extract the previous value

      const oldCoverageSource = fileUtils.findInFile(
        readmeFileName || _defaultReadmeName,
        _readmeTotalCoverageStart,
        _readmeTotalCoverageEnd
      );

      core.debug(`#run oldCoverageSource is ${oldCoverageSource}`);

      if (isSupported(oldCoverageSource)) {
        //fileUtils.printFile(`old total : ${oldCoverage}`)
        core.info(`#run handle supported coverage type ${oldCoverageSource}`);

        const oldCoverageValue = fileUtils.findInFile(
          oldCoverageSource,
          _badgeSvgTotalCoverageStart,
          _badgeSvgTotalCoverageEnd
        );
        core.info(`#run handle supported oldCoverageValue type ${oldCoverageValue}`);

        const currentBuildCoverage = fileUtils.findInFile(
          _defaultJacocoFileName,
          _jacocoTotalCoverageStart,
          _jacocoTotalCoverageEnd
        );
        core.info(
          `#run  handle supported currentBuildCoverage type ${currentBuildCoverage}`
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
          `#run new jacocoNewCoverage :  ${jacocoNewCoverage.missed}: ${jacocoNewCoverage.covered}`
        );
        const latestTotal: number = jacocoNewCoverage.missed + jacocoNewCoverage.covered;

        // const latestCoverage: string = ((jacocoNewCoverage.covered / latestTotal)*100).toPrecision(4);
        const latestCoverageRatio = parseFloat((jacocoNewCoverage.covered / latestTotal).toFixed(4));
        const latestCoverage: string = parseFloat(
          "" + latestCoverageRatio * 100
        ).toPrecision(4);

        core.info(
          `#run new jacocoNewCoverage total lines vs covered :  ${latestTotal}: ${latestCoverage}`
        );

        var badgeColor = defaultCoverageColor.red;
        if (latestCoverageRatio > parseFloat(_defaultGreenMinim)) {
          core.info(
            `#run green ${latestCoverageRatio} > ${parseFloat(_defaultGreenMinim)}`
          );
          badgeColor = defaultCoverageColor.green;
        } else if (latestCoverageRatio > parseFloat(_defaultMinim)) {
          badgeColor = defaultCoverageColor.yellow;
          core.info(
            `#run yellow ${latestCoverageRatio} > ${parseFloat(_defaultMinim)}`
          );
        }

        var newCovFile =  _svgTemplate
          .replace(new RegExp('{badgeColor}', "g"),badgeColor)
          .replace(new RegExp('{badgeCoverage}', "g"),latestCoverage+'%');

        core.info(
          `#run svg replaced : ` + newCovFile
        );
        fileUtils.createFile(oldCoverageSource, newCovFile)

        if (false) {

          core.info(
            `#run readmeFileName = ${readmeFileName}  oldCoverage = ${oldCoverageSource} latestCoverage = ${latestCoverage}%`
          );
          fileUtils.replace(oldCoverageSource, oldCoverageValue, latestCoverage + "%");
        }

        fileUtils.push().then(() => {
          core.info("#run push complete");
        }, () => {
        });
        // fileUtils.printFile(oldCoverage)
        // await fileUtils.push(oldCoverage)

      } else {
        const recommendedFix = `You can add "${_readmeTotalCoverageStart}${type}${_readmeTotalCoverageEnd}" to your ${readmeFileName} to fix this error.`;
        const notSupportedOldCoverage = `failed to match old coverage [${oldCoverageSource}] to supported coverage badge types : ${_supportedTypes}. You have to add a supported coverage badge to your ${readmeFileName} so it can be replaced by this action.${recommendedFix}`;
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
      core.warning(`#resolveFile file not found : [${resolvedName}]`);
      core.setFailed(`required file not found : ${resolvedName}`);
    }

    return resolvedName;
  }
}
