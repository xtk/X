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

# closure-library dir
closureLibraryDir = os.path.normpath( xtkDir + os.sep + 'lib' + os.sep + 'closure-library' )
closureLibraryRelativeDir = 'xtk' + os.sep + 'lib'

# closurebuilder.py
closureLinterFilePath = os.path.normpath( closureLibraryDir + os.sep + 'linter-latest' + os.sep + 'gjslint.py' )

# application dir
appDir = os.path.normpath( projectRootDir + os.sep + projectName )

# output filePath
outputFilePath = os.path.normpath( projectRootDir + os.sep + projectName + '-build.js' )

#
# generate build command
#
command = closureLinterFilePath
command += ' -r ' + xtkDir
command += ' -e ' + closureLibraryRelativeDir + os.sep + '*'
command += ' -x ' + 'xtk/xtk-deps.js --strict'

print command
exit()

#
# run, forest, run
#
os.system( command )
