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
    excludeDirs = ['lib', 'css', 'doc']
    print 'Exclude Dirs: '
    print excludeDirs
    excludeFiles = ['.html', '.txt']
    print 'Exclude Files: '
    print excludeFiles
    print 'Build Tool: ' + buildtool
    
    commandArgs = ''
    
    for root, dirs, files in os.walk(dir):
        
        removeDirs = list(set(excludeDirs) & set(dirs))
        for i in removeDirs:
            dirs.remove(i)
        
        for name in files:
            if not os.path.splitext(name)[1] in excludeFiles:
                print os.path.join(root, name)
                commandArgs += ' --path_with_depspath="' + os.path.join(root, name)
                # relative path to goog.base
                # /bin/tool
                # /goog.base
                # so we have to do as follow:
                googbase = os.path.dirname(os.path.dirname(buildtool))
                print buildtool
                print googbase
                real_path = os.path.relpath(os.path.join(root, name), googbase);
                commandArgs += ' ' + real_path + '"'

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

    print '>> OUTPUT: ' + output