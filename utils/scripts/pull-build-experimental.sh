SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master
# reset the Build.xml file
git checkout xtk-utils/Build.xml

old_head=$(git rev-parse --verify HEAD)
git pull -n
new_head=$(git rev-parse --verify HEAD)

if [ "$old_head" != "$new_head" ]
then
  # rebuild
  cd $XTKUTILS_DIR
  python build.py -e
else
  echo 'no changes..'
fi
