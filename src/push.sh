#!/bin/sh
set -e


echo "---- #push.sh "
echo ".."
echo "${GITHUB_ACTOR}"
git config --global user.name ${GITHUB_ACTOR}
git config --global user.email ${GITHUB_ACTOR}@users.noreply.github.com
git add -uv .
git reset -- target
git commit -m "coverage update"
git push
echo "---- #push.sh done "
