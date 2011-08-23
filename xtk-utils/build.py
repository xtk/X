#
# imports
# all option, routine to go through dirs not good enough
#

# system imports
import os, sys, argparse

# xtk imports
# to be renamed...?
import paths
import deps
import style
import doc
import compile
    
parser = argparse.ArgumentParser(description='This the XTK build tool')

# define some mutual exclusive groups
# i.e. cannot call xtk_only and app_only at the same time
target_group = parser.add_mutually_exclusive_group()
option_group = parser.add_mutually_exclusive_group()

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

target_group.add_argument('-a', '--all',
                          action='store_true',
                          dest='all',
                          default=False,
                          help='Check style, build doc, build deps and compile code')

parser.add_argument('-ad', '--appDir',
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
                    dest='jsdoc',
                    default=False,
                    help='Generate documentation of the target projects.')

option_group.add_argument('-jo', '--jsdoc_only',
                    action='store_true',
                    dest='jsdoc_only',
                    default=False,
                    help='Only generate documentation of the target projects.')

options = parser.parse_args()

# sanity check, in case we turn on deps and style_only at the same time
value_list = [options.style_only, options.deps_only, options.jsdoc_only]
name_list = ['style_only', 'deps_only', 'jsdoc_only']

if( True in value_list ):
    index = value_list.index(True)
    
    if(options.all):
        print '>> WARNING: using \'--all\', \'--' + str(name_list[index]) + '\' will have no effect'
        options.style = True
        options.deps = True
        options.jsdoc = True
        options.style_only = False
        options.deps_only = False
        options.jsdoc_only = False
    
    else:
        if(options.style):
            options.style = False
            print '>> WARNING: using \'--' + str(name_list[index]) + '\': --style will have no effect'
        if(options.deps):
            options.deps = False
            print '>> WARNING: using \'--' + str(name_list[index]) + '\': --deps will have no effect'
        if(options.jsdoc):
            options.jsdoc = False
            print '>> WARNING: using \'--' + str(name_list[index]) + '\': --jsdoc will have no effect'

if (options.verbose):
    print '___________>T<___________'
    print ' ' + parser.description
    print '*-----------------------*'
    print '*'
    print '* xtk_only..........: ' + str(options.xtk_only)
    print '* app_only..........: ' + str(options.app_only)
    print '*'
    print '* build tool........: ' + paths.compilerFilePath
    print '* compiler file path: ' + paths.closureBuilderFilePath
    print '* xtkDir............: ' + paths.xtkDir
    print '*'
    print '* projectName.......: ' + paths.projectName
    print '* appDir............: ' + paths.appDir
    print '*'
    print '* style.............: ' + str(options.style)
    print '* style_only........: ' + str(options.style_only)
    print '* style file path...: ' + paths.closureLinterFilePath
    print '*'
    print '* deps..............: ' + str(options.deps)
    print '* deps_only.........: ' + str(options.deps_only)
    print '* deps file path....: ' + paths.closureDepsFilePath
    print '*'
    print '* jsdoc.............: ' + str(options.jsdoc)
    print '* jsdoc_only........: ' + str(options.jsdoc_only)
    print '* jsdoc dir.........: ' + paths.jsdocDir
    print '*'
    print '*-----------------------*'

#
# check the style
# passing this step is important for a good style consistency,
# a good documentation and a better compilation
#
if( options.style or options.style_only ):
    print '*-----------------------*'
    print 'Checking style '
    
    if(options.xtk_only):
        # inputs: namespace, project dir, build tool
        style.calculate('xtk', paths.xtkDir, paths.closureLinterFilePath)
    elif(options.app_only):
        # inputs: namespace, project dir, build tool
        style.calculate(paths.projectName, paths.appDir, paths.closureLinterFilePath)
    else:
        # inputs: namespace, project dir, build tool
        style.calculate('xtk', paths.xtkDir, paths.closureLinterFilePath)
        style.calculate(paths.projectName, paths.appDir, paths.closureLinterFilePath)

    print 'Style checked'
    print '*-----------------------*'

    if (options.style_only):
        print 'Enjoy XTK'
        sys.exit()
#
# generate the deps files
# target-deps.js will be generated wrote in the target's
# source directory
# deps are useful if you want to use the non compiled target with goog
#
if( options.deps or options.deps_only ):
    print '*-----------------------*'
    print 'Generating dependencies '
    
    if(options.xtk_only):
        # inputs: namespace, project dir, build tool
        deps.calculate('xtk', paths.xtkDir, paths.closureDepsFilePath)
    elif(options.app_only):
        # inputs: namespace, project dir, build tool
        deps.calculate(paths.projectName, paths.appDir, paths.closureDepsFilePath)
    else:
        # inputs: namespace, project dir, build tool
        deps.calculate('xtk', paths.xtkDir, paths.closureDepsFilePath)
        deps.calculate(paths.projectName, paths.appDir, paths.closureDepsFilePath)

    print 'Dependencies generated'
    print '*-----------------------*'

    if (options.deps_only):
        print 'Enjoy XTK'
        sys.exit()

#
# generate the documentation
# the documentation will be generated in the target-build/doc folder
#
if( options.jsdoc or options.jsdoc_only ):
    print '*-----------------------*'
    print 'Generating Documentation '
    
    if(options.xtk_only):
        # inputs: namespace, project dir, build tool
        doc.calculate('xtk', paths.xtkDir, paths.jsdocDir)
    elif(options.app_only):
        # inputs: namespace, project dir, build tool
        doc.calculate(paths.projectName, paths.appDir, paths.jsdocDir)
    else:
        # inputs: namespace, project dir, build tool
        doc.calculate('xtk', paths.xtkDir, paths.jsdocDir)
        doc.calculate(paths.projectName, paths.appDir, paths.jsdocDir)
    
    print 'Documentation generated'
    print '*-----------------------*'

    if( options.jsdoc_only ):
        print 'Enjoy XTK'
        sys.exit()

#
# Compile the project
#

print '*-----------------------*'
print 'Compiling Code'

if(options.xtk_only):
    # inputs: namespace, project dir, build tool
    compile.calculate('X', paths.xtkDir, paths.xtkDir, paths.closureBuilderFilePath, paths.compilerFilePath)
elif(options.app_only):
    # inputs: namespace, project dir, build tool
    compile.calculate(paths.projectName, paths.appDir, paths.xtkDir, paths.closureBuilderFilePath, paths.compilerFilePath)
else:
    # inputs: namespace, project dir, build tool
    compile.calculate('X', paths.xtkDir, paths.xtkDir, paths.closureBuilderFilePath, paths.compilerFilePath)
    compile.calculate(paths.projectName, paths.appDir, paths.xtkDir, paths.closureBuilderFilePath, paths.compilerFilePath)

print 'Code Compiled'
print '*-----------------------*'