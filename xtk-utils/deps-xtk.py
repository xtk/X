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
