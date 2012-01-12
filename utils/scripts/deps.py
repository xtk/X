#
# imports
#
import os, sys

def calculate( namespace, dir, buildtool ):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    output = dir + os.sep + namespace + '-deps.js'
    print 'Output: ' + output
    excludeDirs = ['closure-library', 'jsdoc-toolkit', 'selenium', 'css', 'doc', 'testing', '.git', 'utils']
    print 'Exclude Dirs: '
    print excludeDirs
    excludeFiles = ['.html', '.txt', '-deps.js', '.DS_Store', '.gitignore', '.project', 'LICENSE', 'README']
    print 'Exclude Files: '
    print excludeFiles
    print 'Build Tool: ' + buildtool

    commandArgs = ''

    for root, dirs, files in os.walk( dir ):

        removeDirs = list( set( excludeDirs ) & set( dirs ) )
        for i in removeDirs:
            dirs.remove( i )

        for name in files:
            # check sanity of file
            compile = True
            for eName in excludeFiles:
                if eName in name:
                    compile = False

            if compile:
                commandArgs += ' --path_with_depspath="' + os.path.join( root, name )
                # relative path to goog.base
                # /bin/tool
                # /goog.base
                # so we have to do as follow:
                googbase = os.path.dirname( os.path.dirname( buildtool ) )
                real_path = os.path.relpath( os.path.join( root, name ), googbase );
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
