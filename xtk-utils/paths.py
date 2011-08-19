# imports
import os, sys


# xtk-utils dir
xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

# project root dir
projectRootDir = os.path.normpath( xtkUtilsDir + os.sep + '..' + os.sep )

# xtk dir
xtkDir = os.path.normpath( projectRootDir + os.sep + 'xtk' )

# xtk dir excludes for dependency detection
xtkDirExcludes = ['.DS_Store', 'xtk_tests.html', 'xtk-deps.js', 'lib']

#application name
projectName = 'sampleApp'

# application dir
appDir = os.path.normpath( projectRootDir + os.sep + projectName )

# utilities

# closure-library dir
closureLibraryDir = os.path.normpath( xtkDir + os.sep + 'lib' + os.sep + 'closure-library' )

# closurebuilder.py
closureBuilderFilePath = os.path.normpath( closureLibraryDir + os.sep + 'closure' + os.sep + 'bin' + os.sep + 'build' + os.sep + 'closurebuilder.py' )

# compiler.jar
compilerFilePath = os.path.normpath( closureLibraryDir + os.sep + 'compiler-latest' + os.sep + 'compiler.jar' )

# depswriter.py
closureDepsFilePath = os.path.normpath( closureLibraryDir + os.sep + 'closure' + os.sep + 'bin' + os.sep + 'build' + os.sep + 'depswriter.py' )

# output filePath
outputFilePath = os.path.normpath( appDir + os.sep + projectName + '-build.js' )