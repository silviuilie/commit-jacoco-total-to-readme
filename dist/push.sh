#!/bin/sh
set -e


echo "-- push      --"
echo "----"
echo "${GITHUB_ACTOR}"
git config --global user.name ${GITHUB_ACTOR}
git config --global user.email ${GITHUB_ACTOR}@users.noreply.github.com
git add ./doc/badges/coverage.svg
git commit -m "coverage update"
git push
echo "-- push done --"
echo "----"