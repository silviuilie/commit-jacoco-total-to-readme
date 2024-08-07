 
 
purpose  
=

update badge jacoco coverage (svg file, badgen.net, shields.io etc or just text). 

 
if used
=


commits (as `${GITHUB_ACTOR}`) the latest svg doc/badges/coverage.svg file or covergate text value (or badge) in the readme file 

 
  - optional parameter  `readmeFileName` - defaults to `readme.md`
  - optional parameter  `jacocoFileName` - defaults to `target/site/jacoco/jacoco.xml`
  - define badge layout : _defaultGreenMinim 0.7 - green/_defaultMinim - yellow/less - red
  - optional supportedTypes : `svg`, `text` (markdown?), `badge`  - defaults to `svg`, text, or shields.io badge 
    

TODOs
===  
  - txt,badge support (update readme/commit), svg (update svg readme/commit)
  - commit coverage to wiki ?
      - extract md (separate action?) ?
      - jacoco-md report ? (https://github.com/silviuilie/jacoco-md-ReportTask)
  - add badge default (if not found - default path : doc/badges/coverage.svg, last coverage %) ?
  - add coverage summary ?
    - export coverage to MD ?    
    - modify original coverage (xml/html) summary to MD *or*
  - svg/badge should have same threshold for coverage style (green/yellow/red)
      - default minimum coverage : `0.6`; coverage badge will be 'green' when the total coverage > 'minim' configured value and total coverage >= from previous coverage value
      svg : green/yellow/red
      - badge green:url/yellow:url/red:url (defaults)
      - text : coverage : 
```diff
- 00.00% 
+ 99.00%
! text in orange
```

or  


coverage : \[ ${\textsf{\color{red}00.00}}$ % \]
coverage : \[ ${\textsf{\color{yellow}62.00}}$ % \]
coverage : \[ ${\textsf{\color{green}99.00}}$ % \]
     

<!-- use github context : 

   event.commits[0].author.email/name
   event.commits[0].committer.email/name :

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
          
  -->



related
==
 python : 
     https://github.com/cicirello/jacoco-badge-generator?tab=readme-ov-file (badge samples)

<!--
javascript github action that implements the following :

---




    - name: commit coverage to README file
      run: |
         oldCov=$(grep -Po '(?<=Coverage-).*(?=-)'  README.md) 
         totalCov=$(grep -Po '(?<=</package><counter type="INSTRUCTION").*(?=/><counter type="BRANCH")'  target/site/jacoco/jacoco.xml)
         eval $totalCov
         total=$((missed+covered)) 
         newCov=$(echo "scale=2; ($covered / $total) * 100" | bc) 
         color="critical"
         if (( $(echo "$newCov > $oldCov" | bc -l) )); then
           color="success"
         fi
         coverageBadge="![Code Coverage](https://img.shields.io/badge/Code%20Coverage-$newCov-$color?style=flat)"
         sed -i "s|!\[Code\ Coverage\]\(.*\)|$coverageBadge|" README.md 
         git config user.name silviuilie
         git config user.email silviuilie@gmail.com
         git add README.md
         git commit -m "coverage update"
         git push 




    - name: commit coverage to README file
      run: |
         oldCov=$(grep -Po '(?<=Coverage-).*(?=-)'  README.md)
         echo "oldCov $oldCov"
         totalCov=$(grep -Po '(?<=</package><counter type="INSTRUCTION").*(?=/><counter type="BRANCH")'  target/site/jacoco/jacoco.xml)
         eval $totalCov
         total=$((missed+covered))
         echo "missed : $missed, covered   : $covered, total     : $total"
         newCov=$(echo "scale=2; ($covered / $total) * 100" | bc)
         echo " newCov :[$newCov]" 
         echo " oldCov :[$oldCov]"
         color="critical"
         if (( $(echo "$newCov > $oldCov" | bc -l) )); then
           color="success"
         fi
         coverageBadge="![Code Coverage](https://img.shields.io/badge/Code%20Coverage-$newCov-$color?style=flat)"
         sed -i "s|!\[Code\ Coverage\]\(.*\)|$coverageBadge|" README.md
         head -12 README.md
         git config user.name silviuilie
         git config user.email silviuilie@gmail.com
         git add README.md
         git commit -m "coverage update"
         git push 

 

------


-->
 


<!--
generated with 'use this template' template : 




# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Use this template to bootstrap the creation of a TypeScript action. :rocket:

This template includes compilation support, tests, a validation workflow,
publishing, and versioning guidance.

If you are new, there's also a simpler introduction in the
[Hello world JavaScript action repository](https://github.com/actions/hello-world-javascript-action).

## Create Your Own Action

To create your own action, you can use this repository as a template! Just
follow the below instructions:

1. Click the **Use this template** button at the top of the repository
1. Select **Create a new repository**
1. Select an owner and name for your new repository
1. Click **Create repository**
1. Clone your new repository

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), this template has a `.node-version`
> file at the root of the repository that will be used to automatically switch
> to the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

## Update the Action Metadata

The [`action.yml`](action.yml) file defines metadata about your action, such as
input(s) and output(s). For details about this file, see
[Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions).

When you copy this repository, update `action.yml` with the name, description,
inputs, and outputs for your action.

## Update the Action Code

The [`src/`](./src/) directory is the heart of your action! This contains the
source code that will be run when your action is invoked. You can replace the
contents of this directory with your own code.

There are a few things to keep in mind when writing your action code:

- Most GitHub Actions toolkit and CI/CD operations are processed asynchronously.
  In `main.ts`, you will see that the action is run in an `async` function.

  ```javascript
  import * as core from '@actions/core'
  //...

  async function run() {
    try {
      //...
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  ```

  For more information about the GitHub Actions toolkit, see the
  [documentation](https://github.com/actions/toolkit/blob/master/README.md).

So, what are you waiting for? Go ahead and start customizing your action!

1. Create a new branch

   ```bash
   git checkout -b releases/v1
   ```

1. Replace the contents of `src/` with your action code
1. Add tests to `__tests__/` for your source code
1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > [!WARNING]
   >
   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc)
   > to build the final JavaScript action code with all dependencies included.
   > If you do not run this step, your action will not work correctly when it is
   > used in a workflow. This step also includes the `--license` option for
   > `ncc`, which will create a license file for all of the production node
   > modules used in your project.

1. Commit your changes

   ```bash
   git add .
   git commit -m "My first action is ready!"
   ```

1. Push them to your repository

   ```bash
   git push -u origin releases/v1
   ```

1. Create a pull request and get feedback on your action
1. Merge the pull request into the `main` branch

Your action is now published! :rocket:

For information about versioning your action, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

## Validate the Action

You can now validate the action by referencing it in a workflow file. For
example, [`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an
action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

For example workflow runs, check out the
[Actions tab](https://github.com/actions/typescript-action/actions)! :rocket:

## Usage

After testing, you can create version tag(s) that developers can use to
reference different stable versions of your action. For more information, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

To include the action in a workflow in another repository, you can use the
`uses` syntax with the `@` symbol to reference a specific branch, tag, or commit
hash.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: actions/typescript-action@v1 # Commit with the `v1` tag
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

## Publishing a new release

This project includes a helper script designed to streamline the process of
tagging and pushing new releases for GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. Our script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent release tag by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the latest release tag
   and provides a regular expression to validate the format of the new tag.
1. **Tagging the new release:** Once a valid new tag is entered, the script tags
   the new release.
1. **Pushing the new tag to the remote:** Finally, the script pushes the new tag
   to the remote repository. From here, you will need to create a new release in
   GitHub and users can easily reference the new tag in their workflows.

   -->
