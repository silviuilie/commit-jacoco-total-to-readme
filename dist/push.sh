#!/bin/sh
set -e

echo "-- push      --"
echo "${GITHUB_ACTOR}"
echo "${GITHUB_TOKEN}"
git config --global user.name ${GITHUB_ACTOR}
git config --global user.email ${GITHUB_ACTOR}@users.noreply.github.com
git add README.md
git commit -m "coverage update"
git push
echo "-- push done --"
