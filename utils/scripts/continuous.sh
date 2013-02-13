#!/bin/bash
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master

old_head=$(git rev-parse --verify HEAD)
git pull -n
git submodule init
git submodule update
new_head=$(git rev-parse --verify HEAD)

if [ "$old_head" != "$new_head" ]
then
  # rebuild
  cd $XTKUTILS_DIR
  ./build.py && ./upload.py -c
else
  echo 'no changes..'
fi
