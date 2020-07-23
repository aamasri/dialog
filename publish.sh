#!/bin/bash
set -e  # exit when any command fails

if [ $# -ne 2 ]
  then
    echo "Usage: npm run publish 1.0.1 'fixed...'"
    exit 0
fi

echo "publishing version $1 ..."
echo "installing npm dependencies..."
npm install
echo "building browser dist folder..."
webpack --mode production;
echo "git committing..."
git commit -a -m "Release version $1 - $2"
echo "git tagging..."
git tag "$1"
git tag -f latest
echo "git pushing..."
git push origin master :refs/tags/latest
git push origin master --tags
echo "publishing to npmjs..."
npm publish