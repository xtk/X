#!/bin/bash
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master

# pull new master
git pull
git submodule init
git submodule update

cd $XTKUTILS_DIR
# -n: nightly
./build.py && ./upload.py -n

