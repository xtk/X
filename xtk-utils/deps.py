#
#
#

#
# configuration
#


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

# closure-library dir
closureLibraryDir = os.path.normpath( projectRootDir + os.sep + 'closure-library' )

# depswriter.py
closureDepsFilePath = os.path.normpath( closureLibraryDir + os.sep + 'closure' + os.sep + 'bin' + os.sep + 'build' + os.sep + 'depswriter.py' )

# xtk dir
xtkDir = os.path.normpath( projectRootDir + os.sep + 'xtk' )

# output filePath
outputFilePath = os.path.normpath( xtkDir + os.sep + 'xtk-deps.js' )

#
# generate build command
#
command = closureDepsFilePath
command += ' --root_with_prefix="' + xtkDir
command += ' ../../../xtk"'
command += ' > ' + outputFilePath

#
# run, forest, run
#
os.system( command )
