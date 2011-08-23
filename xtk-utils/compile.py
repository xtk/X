# imports
#
import os, sys

def calculate( namespace, dir, xtkdir, buildtool, compiler):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    print 'Build Tool: ' + buildtool
    excludeDirs = ['lib']
    print 'Exclude: '
    print excludeDirs
    output = dir + '-build'
    print 'Output: ' + output

    #compile all files
    if(namespace == 'X'):
        #
        # routine to automatically parse the xtk directory for all sources without the excludes
        for f in os.listdir( xtkdir ):
        
            if not any( e == f for e in excludeDirs ):
            
                for files in xtkdir:
                    if os.path.isfile( dir + os.sep + f ):
                        command = buildtool
                        command += ' --root="' + xtkdir + os.sep + f
                        command += ' --namespace=' + namespace
                        command += ' --output_mode=compiled'
                        command += ' --compiler_jar=' + compiler
                        command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
                        command += ' > ' + output + os.sep + f
                            
                        os.system( command )
                            
                        print '>> OUTPUT: ' + output + os.sep + f

    
    # compile project
    else:
        command = buildtool
        command += ' --root=' + xtkdir
        command += ' --root=' + dir + os.sep + 'js'
        command += ' --namespace=' + namespace
        command += ' --output_mode=compiled'
        command += ' --compiler_jar=' + compiler
        command += ' -f "--warning_level=VERBOSE"'
        command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
        command += ' > ' + output + os.sep + namespace + '.js'

        #
        # run, forest, run
        #
        os.system( command )

        print '>> OUTPUT: ' + output + os.sep + namespace + '.js'
