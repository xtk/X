#!/bin/bash
#
# XTK driver for nightly testing of the dev tree (uncompiled)
#

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master

# pull new master
git pull

cd $XTKUTILS_DIR
# -n: nightly
./deps.py && ./test.py && ./upload.py -n

