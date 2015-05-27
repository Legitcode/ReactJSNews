#!/bin/bash

set -e

cd "$(dirname "$0")"

rm -rf build/ gh-pages/

# clone into gh-pages
git clone -b gh-pages git@github.com:Legitcode/ReactJSNews gh-pages/

# clone theme
git clone git://github.com/Legitcode/pixyll build

# copy posts
cd build/
rm -rf .git/
rm -rf _posts
rm -rf _layouts
rm -rf about.md
rm -rf contact.html
rm -rf CNAME
rm -rf _scss/_main.scss
cp -R ../posts ./_posts
cp -R ../layouts ./_layouts
cp -R ../sass/main.scss ./_sass/_main.scss

cp -R ../pages .
cp -R ../theme/. .
cp -R ../CNAME .

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

