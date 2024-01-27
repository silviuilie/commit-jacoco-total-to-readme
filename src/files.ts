import * as core from "@actions/core";
import glob from "glob";
import * as fs from "fs";

export function printFile(fileName: string): void {
  const content = fs.readFileSync(fileName, "utf-8");
  core.info(`#printFile : ${content}`);
}

/**
 * TODO : +@ readme. see https://github.com/actions-js/push/blob/master/start.js
 * @param fileName
 */
export function commit(fileName: string) {
  const spawn = require("child_process").spawn;

  const exec = (cmd: string, args = []) => new Promise((resolve, reject) => {

    core.info(`Started: ${cmd} ${args.join(" ")}`);
    const app = spawn(cmd, args, { stdio: "inherit" });

    app.on("close", (code: number, signal: string) => {
      if (code !== 0) {
        var err = new Error(`Invalid status code: ${code}`);
        err.cause = code;
        return reject(err);
      }
      return resolve(code);
    });
    app.on("error", reject);
  });
  // event.commits[0].author.email/name
  // event.commits[0].committer.email/name :
  /*

      "commits": [
        {
          "author": {
            "email": "silviu.ilie@gmail.com",
            "name": "silviuilie",
            "username": "silviuilie"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
   */

  core.info(`-push-----`);
  exec(`./push.sh > push.out`);
  core.info(`-check-----`);
  exec("cat push.out");
  core.info(`test read context ${process.env["context"]}`);
  core.info(`-done-----`);

  core.info(`set user.name/user.email`);
  exec("git config user.name \${GITHUB_ACTOR}");
  exec("git config user.email \${GITHUB_ACTOR}@users.noreply.github.com");
  core.info(`git push ${fileName}`);
  exec(`git add ${fileName}`);
  exec("git commit -m \"coverage update\"");
  exec("git push");
  core.info(`git push ${fileName} done`);

}

export function replace(
  fileName: string,
  findPattern: string, replacePattern: string
) {

  core.info(`#replaceInFile replace : ${findPattern} with ${replacePattern} in ${fileName}`);

  fs.readFile(fileName, "utf8", function(err, data) {
    if (err) {
      return core.error(err);
    }
    var result = data.replace(new RegExp(`${findPattern}`, "g"), replacePattern);

    core.info(
      `replaced : ${result}`
    );
    core.info(
      `done`
    );

    fs.writeFile(fileName, result, "utf8", function(err) {
      if (err) return core.error(err);
    });

  });
}

/**
 * finds last occurrence of any coverage badge (as defined by left/right pattern).
 */
export function findInFile(
  fileName: string,
  leftPattern: string,
  rightPattern: string
): string {
  core.info(
    `find coverage for [${fileName}] and patterns L: [${leftPattern}] and R: [${rightPattern}]`
  );
  const content = fs.readFileSync(fileName, "utf-8");

  const start = content.lastIndexOf(leftPattern);
  const foundCoverage = content.substring(
    start + leftPattern.length,
    content.indexOf(rightPattern, start)
  );

  core.info(`foundCoverage.length : [${foundCoverage.length}]`);
  core.info(`foundCoverage : [${foundCoverage}]`);

  return foundCoverage;
}

export async function createFile(path: string, content: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, callback => {
      if (callback) {
        reject(callback);
      } else {
        resolve(true);
      }
    });
  });
}

export async function checkExistence(pattern: string): Promise<boolean> {
  const globOptions = {
    follow: !(
      (core.getInput("follow_symlinks") || "true").toUpperCase() === "FALSE"
    ),
    nocase: (core.getInput("ignore_case") || "false").toUpperCase() === "TRUE"
  };
  return new Promise((resolve, reject) => {
    glob(pattern, globOptions, (err: unknown, files: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.length > 0);
      }
    });
  });
}
