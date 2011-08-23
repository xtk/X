# imports
#
import os, sys

def calculate( namespace, dir, xtkdir, buildtool, compiler):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    print 'Build Tool: ' + buildtool
    excludeDirs = ['lib']
    print 'Exclude Dirs: '
    print excludeDirs
    excludeFiles = ['.html', '.txt']
    print 'Exclude Files: '
    print excludeFiles
    output = dir + '-build'
    print 'Output: ' + output
    # create ouput folder if it doesn't exist
    if not os.path.exists(output): os.makedirs(output)

    #compile all files
    if(namespace == 'X'):
        for root, dirs, files in os.walk(dir):
            
            removeDirs = list(set(excludeDirs) & set(dirs))
            for i in removeDirs:
                dirs.remove(i)
            
            for name in files:
                if not os.path.splitext(name)[1] in excludeFiles:
                    command = buildtool
                    command += ' --input ' + os.path.join(root, name)
                    command += ' --root=' + xtkdir
                    command += ' --output_mode=compiled'
                    command += ' --compiler_jar=' + compiler
                    command += ' -f "--warning_level=VERBOSE"'
                    command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
                    command += ' > ' + output + os.sep + name
                    
                    #
                    # run, forest, run
                    #
                    os.system( command )

    
    # compile project
    else:
        command = buildtool
        command += ' --root=' + xtkdir
        command += ' --root=' + dir
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
