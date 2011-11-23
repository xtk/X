SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master
# reset the Build.xml file
git checkout xtk-utils/Build.xml
# git diff returns 1 when there are changes
git diff origin/master --quiet
if [ $? -eq 1 ]
  then
    git pull
    cd $XTKUTILS_DIR
    # -e: experimental
    python build.py -e
  else
    echo 'no remote changes.. exiting..';
fi
