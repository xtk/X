# imports
#
import os, sys
import time

def calculate( namespace, dir, xtkdir, buildtool, compiler):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    print 'Build Tool: ' + buildtool
    excludeDirs = ['lib', 'testing', 'doc',  'css']
    print 'Exclude Dirs: '
    print excludeDirs
    excludeFiles = ['.html', '.txt', '-deps.js']
    print 'Exclude Files: '
    print excludeFiles
    output = dir + '-build'
    print 'Output: ' + output
    # create ouput folder if it doesn't exist
    if not os.path.exists(output): os.makedirs(output)

    # remove file if exists
    if os.path.exists('temp_build.log'): os.remove( 'temp_build.log' )

    # start compilation time
    start = time.clock()
    
    #compile all files
    if(namespace == 'X'):
        for root, dirs, files in os.walk(dir):
            
            removeDirs = list(set(excludeDirs) & set(dirs))
            for i in removeDirs:
                dirs.remove(i)
            
            relative_path = os.path.relpath(root, dir)
            real_output = output + os.sep + relative_path
            if not os.path.exists(real_output): os.makedirs(real_output)
            
            for name in files:
                # check sanity of file
                compile = True
                for eName in excludeFiles:
                    if eName in name:
                        compile = False
                        
                if compile:
                    command = buildtool
                    command += ' --input ' + os.path.join(root, name)
                    command += ' --root=' + xtkdir
                    command += ' --output_mode=compiled'
                    command += ' --compiler_jar=' + compiler
                    command += ' -f "--warning_level=VERBOSE"'
                    command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
                    command += ' > ' + real_output + os.sep + name
# &> test.file.xml                    
                    #
                    # run, forest, run
                    #
                    os.system( command + ' 2> temp' )
                    # get current location
                    os.system( 'bash scripts/readtemp.sh temp' )
                    os.system( 'cat temp >> temp_build.log' )
                    if os.path.exists('temp'): os.remove( 'temp' )
    
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
        os.system( command + ' &> temp' )
        os.system( 'bash readtemp.sh temp' )
        os.system( 'cat temp >> temp_build.log' )
        if os.path.exists('temp'): os.remove( 'temp' )

    # end compilation time
    end = time.clock()
    processingTime = end - start

    if(namespace == 'X'):
        os.system( 'echo ' + str(start) + ' > xtk_build.log')
        os.system( 'echo ' + str(end) + ' >> xtk_build.log')
        os.system( 'echo ' + str(processingTime) + ' >> xtk_build.log')
        os.system( 'cat temp_build.log >> xtk_build.log')
    else:
        os.system( 'echo ' + str(start) + ' > project_build.log')
        os.system( 'echo ' + str(end) + ' >> project_build.log')
        os.system( 'echo ' + str(processingTime) + ' >> project_build.log')
        os.system( 'cat temp_build.log >> project_build.log')

    if os.path.exists('temp_build.log'): os.remove( 'temp_build.log' )
    print '>> OUTPUT: ' + output + os.sep + namespace + '.js'
