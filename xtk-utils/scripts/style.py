# imports
#
import os, sys

def calculate( namespace, dir, buildtool):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    print 'Build Tool: ' + buildtool

    #
    # generate build command
    #
    
    command = buildtool
    command += ' -r ' + dir
    command += ' -e ' + dir + os.sep + 'lib'
    command += ' -x ' + dir + os.sep + namespace + os.sep + namespace + '-deps.js'
    command += ' --strict'

    #
    # run, forest, run
    #
    os.system( command )