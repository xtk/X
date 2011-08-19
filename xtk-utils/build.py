#
# imports
#

# system imports
import os, sys, argparse

# xtk imports
# to be renamed...?
import paths

    
parser = argparse.ArgumentParser(description='This the XTK build tool')
parser.add_argument('--xtk_only',
                    action='store_true',
                    dest='xtk_only',
                    default=False,
                    help='Build only XTK. A new folder \'xtk-build\'will be created.')

parser.add_argument('--verbose',
                    action='store_true',
                    dest='verbose',
                    default=False,
                    help='More verbose.')

parser.add_argument('-v',
                    action='store_true',
                    dest='verbose',
                    default=False,
                    help='More verbose.')

parser.add_argument('--appDir',
                    action='store',
                    dest=paths.appDir,
                    default=paths.appDir,
                    help='Location of the xtk-based applicatoion you want to build. A new folder \'application-build\' will be created.')

parser.add_argument('--deps',
                    action='store_true',
                    dest='deps',
                    default=False,
                    help='Generate goog dependencies for the projects which will be built.')

parser.add_argument('--doc',
                    action='store_true',
                    dest='doc',
                    default=False,
                    help='Generate documentation for the projects which will be built.')

options = parser.parse_args()

if (options.verbose):
    print '___________>T<___________'
    print ' ' + parser.description
    print '*-----------------------*'
    print '*'
    print '* compiler file path: ' + paths.compilerFilePath
    print '* xtkDir............: ' + paths.xtkDir
    print '* compilation level.: '
    print '* xtk_only..........: ' + str(options.xtk_only)
    print '*'
    print '* projectName.......: ' + paths.projectName
    print '* appDir............: ' + paths.appDir
    print '*'
    print '* deps..............: ' + str(options.deps)
    print '* deps file path....: ' + paths.closureDepsFilePath
    print '*'
    print '* doc...............: ' + str(options.doc)
    print '* jdoc file path....: '
    print '*'
    print '*-----------------------*'

#
# generate the deps files
#

#
# run, forest, run
#
#os.system( command )

#
# generate build command
#
command = paths.closureBuilderFilePath
command += ' --root=' + paths.xtkDir
command += ' --root=' + paths.appDir
command += ' --namespace=' + paths.projectName
command += ' --output_mode=compiled'
command += ' --compiler_jar=' + paths.compilerFilePath
command += ' -f "--warning_level=VERBOSE"'
command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
#command += ' -f "--externs=' + appDir + os.sep + projectName + '-externs.js"'
command += ' > ' + paths.outputFilePath

#
# run, forest, run
#
os.system( command )