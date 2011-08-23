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
        for root, dirs, files in os.walk(dir):
            
            removeDirs = list(set(excludeDirs) & set(dirs))
            for i in removeDirs:
                dirs.remove(i)
            
            for name in dirs:
                print os.path.join(root, name)
                commandArgs += ' --root_with_prefix="' + os.path.join(root, name)
                real_path = os.path.relpath(root, buildtool);
                commandArgs += ' ' + real_path + '"'

                os.system( command )

    
    # compile project
    else:
        command = buildtool
        #command += ' --root=' + xtkdir
        #command += ' --root=' + dir
        #command += ' --namespace=' + namespace
        #command += ' --output_mode=compiled'
        #command += ' --compiler_jar=' + compiler
        #command += ' -f "--warning_level=VERBOSE"'
        #command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
        #command += ' > ' + output + os.sep + namespace + '.js'

        #
        # run, forest, run
        #
        os.system( command )
    print '>> OUTPUT: ' + output + os.sep + namespace + '.js'
