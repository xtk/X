SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XTKUTILS_DIR=$SCRIPTS_DIR/../
XTK_DIR=$XTKUTILS_DIR/../

cd $XTK_DIR
git checkout master
update=$(git diff origin/master ../xtk)
if [ ${#update} > 0 ]
  then
    git pull
    cd $XTKUTILS_DIR
    # -n: nightly
    python build.py -n
fi

