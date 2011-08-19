#
# imports
#
import os, sys

def calculate( namespace, dir, buildtool):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    output = dir + os.sep + namespace + '-deps.js'
    print 'Output: ' + output
    excludeDirs = ['lib']
    print 'Exclude: '
    print excludeDirs
    print 'Build Tool: ' + buildtool
    real_path = os.path.relpath(dir, buildtool);
    print 'Relative path: ' + real_path

    commandArgs = ""

    #
    # routine to automatically parse the xtk directory for all sources without the excludes
    for f in os.listdir( dir ):

        if not any( e == f for e in excludeDirs ):

            for files in dir:
                if os.path.isfile( dir + os.sep + f ):
                    commandArgs += ' --path_with_depspath="' + dir + os.sep + f

                # for sub-dirs of xtkDir
                elif os.path.isdir( dir + os.sep + f ):
                    commandArgs += ' --root_with_prefix="' + dir + os.sep + f
    
                commandArgs += ' ' + real_path + f + '"'

    #
    # generate build command
    #
    command = buildtool
    command += commandArgs
    command += ' > ' + output

    #
    # run, forest, run
    #
    os.system( command )