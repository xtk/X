#
# imports
#

# system imports
import os, sys, argparse

# xtk imports
# to be renamed...?
import paths

    
parser = argparse.ArgumentParser(description='This the XTK build tool')

# define some mutual exclusive groups
# i.e. cannot call xtk_only and app_only at the same time
target_group = parser.add_mutually_exclusive_group()
option_group = parser.add_mutually_exclusive_group()
style_group = parser.add_mutually_exclusive_group()
deps_group = parser.add_mutually_exclusive_group()
jsdoc_group = parser.add_mutually_exclusive_group()

# verbose
parser.add_argument('-v', '--verbose',
                    action='store_true',
                    dest='verbose',
                    default=False,
                    help='More verbose.')

# target project
target_group.add_argument('-xo', '--xtk_only',
                    action='store_true',
                    dest='xtk_only',
                    default=False,
                    help='Build only XTK. A new folder \'xtk-build\'will be created.')

target_group.add_argument('-ao', '--app_only',
                    action='store_true',
                    dest='app_only',
                    default=False,
                    help='Build only the application. A new folder \'application-build\'will be created.')

parser.add_argument('-a', '--appDir',
                    action='store',
                    dest=paths.appDir,
                    default=paths.appDir,
                    help='Location of the xtk-based applicatoion you want to build. A new folder \'application-build\' will be created.')

# style
parser.add_argument('-s', '--style',
                    action='store_true',
                    dest='style',
                    default=False,
                    help='Check the style of the target projects.')

option_group.add_argument('-so', '--style_only',
                    action='store_true',
                    dest='style_only',
                    default=False,
                    help='Only check the style of the target project.')

# dependencies
parser.add_argument('-d', '--deps',
                    action='store_true',
                    dest='deps',
                    default=False,
                    help='Generate goog dependencies of the target projects.')

option_group.add_argument('-do', '--deps_only',
                    action='store_true',
                    dest='deps_only',
                    default=False,
                    help='Only generate dependencies of the target projects.')

# documentation
parser.add_argument('-j', '--jsdoc',
                    action='store_true',
                    dest='doc',
                    default=False,
                    help='Generate documentation of the target projects.')

option_group.add_argument('-jo', '--jsdoc_only',
                    action='store_true',
                    dest='doc_only',
                    default=False,
                    help='Only generate documentation of the target projects.')

options = parser.parse_args()

if (options.verbose):
    print '___________>T<___________'
    print ' ' + parser.description
    print '*-----------------------*'
    print '*'
    print '* xtk_only..........: ' + str(options.xtk_only)
    print '* app_only..........: ' + str(options.app_only)
    print '*'
    print '* compiler file path: ' + paths.compilerFilePath
    print '* xtkDir............: ' + paths.xtkDir
    print '* compilation level.: '
    print '*'
    print '* projectName.......: ' + paths.projectName
    print '* appDir............: ' + paths.appDir
    print '*'
    print '* style.............: ' + str(options.style)
    print '* style_only........: ' + str(options.style_only)
    print '* style file path...: '
    print '*'
    print '* deps..............: ' + str(options.deps)
    print '* deps_only.........: ' + str(options.deps_only)
    print '* deps file path....: ' + paths.closureDepsFilePath
    print '*'
    print '* doc...............: ' + str(options.doc)
    print '* doc_only..........: ' + str(options.doc_only)
    print '* jdoc file path....: '
    print '*'
    print '*-----------------------*'

#
# generate the deps files
#
if( options.deps or options.deps_only ):
    if (options.verbose):
        print '*-----------------------*'
        print ' Generating dependencies '
    
    

    if (options.deps_only):
        print 'Enjoy XTK'
        sys.exit()
#
# run, forest, run
#
#os.system( command )

#
# generate the documentation
#
if( options.doc or options.doc_only ):
    if (options.verbose):
        print '*-----------------------*'
        print ' Generating Documentation '

    if( options.doc_only ):
        print 'Enjoy XTK'
        sys.exit()
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