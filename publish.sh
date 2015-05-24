#!/bin/bash

set -e

cd "$(dirname "$0")"

rm -rf build/ gh-pages/

# clone into gh-pages
git clone -b gh-pages git@github.com:Legitcode/ReactJSNews gh-pages/

# clone theme
git clone git://github.com/skevy/pixyll build

# copy posts
cd build/
rm -rf .git/
rm -rf _posts
cp -R ../posts ./_posts
cp -R ../theme/. .
rm -rf CNAME

# copy img
cp -R ../img ./img

# copy build to gh-pages/
cd ../gh-pages
rm -rf *
cp -R ../build/. .

# commit gh-pages
git add -A
git commit -m 'website build'
git push origin gh-pages

cd ..
rm -rf gh-pages/
rm -rf build/

