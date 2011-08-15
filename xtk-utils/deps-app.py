#
#
#

#
# configuration
#
projectName = 'sampleApp'

##############################################################################

#
# imports
#
import os, sys

#
# find folders
#

# xtk-utils dir
xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

# project root dir
projectRootDir = os.path.normpath( xtkUtilsDir + os.sep + '..' + os.sep )

# xtk dir
xtkDir = os.path.normpath( projectRootDir + os.sep + 'xtk' )

# relative path from xtk/lib/closure-library/goog/base.js to xtkDir
fromBaseJStoXtkDir = '../../../../../xtk/'

# closure-library dir
closureLibraryDir = os.path.normpath( xtkDir + os.sep + 'lib' + os.sep + 'closure-library' )

# depswriter.py
closureDepsFilePath = os.path.normpath( closureLibraryDir + os.sep + 'closure' + os.sep + 'bin' + os.sep + 'build' + os.sep + 'depswriter.py' )

# output filePath
outputFilePath = os.path.normpath( xtkDir + os.sep + 'xtk-deps.js' )

# xtk dir excludes for dependency detection
xtkDirExcludes = ['.DS_Store', 'xtk_tests.html', 'xtk-deps.js', 'lib']

commandArgs = ""

#
# routine to automatically parse the xtk directory for all sources without the excludes
for f in os.listdir( xtkDir ):

  if not any( e == f for e in xtkDirExcludes ):

    # for files which are directly in xtkDir
    if os.path.isfile( xtkDir + os.sep + f ):
      commandArgs += ' --path_with_depspath="' + xtkDir + os.sep + f


    # for sub-dirs of xtkDir
    elif os.path.isdir( xtkDir + os.sep + f ):
      commandArgs += ' --root_with_prefix="' + xtkDir + os.sep + f

    commandArgs += ' ' + fromBaseJStoXtkDir + f + '"'

#
# generate build command
#
command = closureDepsFilePath
command += commandArgs
command += ' > ' + outputFilePath

#
# run, forest, run
#
os.system( command )
