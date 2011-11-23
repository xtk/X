SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master
# reset the Build.xml file
git checkout xtk-utils/Build.xml

old_head=$(git rev-parse --verify HEAD) && git-pull -n >/dev/null 2>&1 || exit
new_head=$(git rev-parse --verify HEAD)
test "$old_head" = "$new_head" || python $XTKUTILS_DIR/build.py -e
