SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master
pull=$(git diff origin/master)
echo ${pull}
if [ ${#pull} > 0]
  then
    git pull
    cd $XTKUTILS_DIR
    python build.py -e
fi

