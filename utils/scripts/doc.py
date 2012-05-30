# imports
#
import os, sys
import shutil

def calculate( namespace, dir, buildtool ):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    print 'Build Tool Dir: ' + buildtool
    output = dir + os.sep + 'doc' + os.sep
    print 'Output: ' + output

    # remove output dir contents
    shutil.rmtree( output )

    # create ouput folder if it doesn't exist
    if not os.path.exists( output ): os.makedirs( output )

    # also create the symbol subdir
    os.mkdir( output + os.sep + "symbols" )

    #
    # generate build command
    #
    command = 'java -jar'
    command += ' ' + buildtool + os.sep + 'jsrun.jar'
    command += ' ' + buildtool + os.sep + 'app' + os.sep + 'run.js'
    command += ' -d=' + output
    # exlude
    command += ' -E=lib -E=doc -E=utils -E=testing'
    # recursive level
    command += ' -r=10'
    # template
    command += ' -t=' + buildtool + os.sep + 'templates' + os.sep + 'x'
    # source dir
    command += ' -a ' + dir

    print command

    #
    # run, forest, run
    #
    os.system( command )

    print '>> OUTPUT: ' + output
