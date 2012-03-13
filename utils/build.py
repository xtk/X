#
# imports
# all option, routine to go through dirs not good enough
#

# system imports
import os, sys, argparse, datetime

# xtk imports
# to be renamed...?
import paths

import xupdate_parser
import xconf_parser
import xbuild_parser
import xtest_parser

import scripts.deps
import scripts.style
import scripts.doc
import scripts.test

parser = argparse.ArgumentParser( description='This the XTK build tool' )

# define some mutual exclusive groups
# i.e. cannot call xtk_only and app_only at the same time
# testing is also separate
target_group = parser.add_mutually_exclusive_group()
option_group = parser.add_mutually_exclusive_group()

# verbose
parser.add_argument( '-v', '--verbose',
                    action='store_true',
                    dest='verbose',
                    default=False,
                    help='More verbose.' )

# target project
target_group.add_argument( '-a', '--all',
                          action='store_true',
                          dest='all',
                          default=False,
                          help='Check style, build doc, build deps and compile code' )
# style
parser.add_argument( '-s', '--style',
                    action='store_true',
                    dest='style',
                    default=False,
                    help='Check the style of the target projects.' )

option_group.add_argument( '-so', '--style_only',
                    action='store_true',
                    dest='style_only',
                    default=False,
                    help='Only check the style of the target project.' )

# dependencies
parser.add_argument( '-d', '--deps',
                    action='store_true',
                    dest='deps',
                    default=False,
                    help='Generate goog dependencies of the target projects.' )

option_group.add_argument( '-do', '--deps_only',
                    action='store_true',
                    dest='deps_only',
                    default=False,
                    help='Only generate dependencies of the target projects.' )

# documentation
parser.add_argument( '-j', '--jsdoc',
                    action='store_true',
                    dest='jsdoc',
                    default=False,
                    help='Generate documentation of the target projects.' )

option_group.add_argument( '-jo', '--jsdoc_only',
                    action='store_true',
                    dest='jsdoc_only',
                    default=False,
                    help='Only generate documentation of the target projects.' )
# testing
option_group.add_argument( '-t', '--test',
                    action='store_true',
                    dest='test',
                    default=False,
                    help='Run all tests in Chrome and Firefox.' )

option_group.add_argument( '-to', '--test_only',
                    action='store_true',
                    dest='test_only',
                    default=False,
                    help='Only run all tests in Chrome and Firefox.' )

# experimental build
option_group.add_argument( '-e', '--experimental',
                    action='store_true',
                    dest='experimental',
                    default=False,
                    help='Experimental build. Reports to cdash.xtk.org' )

# nightly build
option_group.add_argument( '-n', '--nightly',
                    action='store_true',
                    dest='nightly',
                    default=False,
                    help='Nightly build. Reports to cdash.xtk.org' )

# continuous build
option_group.add_argument( '-c', '--continuous',
                    action='store_true',
                    dest='continuous',
                    default=False,
                    help='Continuous build. Reports to cdash.xtk.org' )

options = parser.parse_args()

# sanity check, in case we turn on deps and style_only at the same time
value_list = [options.style_only, options.deps_only, options.jsdoc_only]
name_list = ['style_only', 'deps_only', 'jsdoc_only', 'test_only']

if( True in value_list ):
    index = value_list.index( True )

    if( options.all ):
        print '>> WARNING: using \'--all\', \'--' + str( name_list[index] ) + '\' will have no effect'
        options.style = True
        options.deps = True
        options.jsdoc = True
        options.test = True
        options.style_only = False
        options.deps_only = False
        options.jsdoc_only = False
        options.test_only = False
        # build type
        options.experimental = True
        options.nightly = True
        options.continuous = True
    else:
        if( options.style ):
            options.style = False
            print '>> WARNING: using \'--' + str( name_list[index] ) + '\': --style will have no effect'
        if( options.deps ):
            options.deps = False
            print '>> WARNING: using \'--' + str( name_list[index] ) + '\': --deps will have no effect'
        if( options.jsdoc ):
            options.jsdoc = False
            print '>> WARNING: using \'--' + str( name_list[index] ) + '\': --jsdoc will have no effect'
        if( options.test ):
            options.test = False
            print '>> WARNING: using \'--' + str( name_list[index] ) + '\': --test will have no effect'

if ( options.verbose ):
    print '___________>T<___________'
    print ' ' + parser.description
    print '*-----------------------*'
    print '*'
    print '* build tool........: ' + paths.compilerFilePath
    print '* compiler file path: ' + paths.closureBuilderFilePath
    print '* xtkDir............: ' + paths.xtkDir
    print '*'
    print '* style.............: ' + str( options.style )
    print '* style_only........: ' + str( options.style_only )
    print '* style file path...: ' + paths.closureLinterFilePath
    print '*'
    print '* deps..............: ' + str( options.deps )
    print '* deps_only.........: ' + str( options.deps_only )
    print '* deps file path....: ' + paths.closureDepsFilePath
    print '*'
    print '* jsdoc.............: ' + str( options.jsdoc )
    print '* jsdoc_only........: ' + str( options.jsdoc_only )
    print '* jsdoc dir.........: ' + paths.jsdocDir
    print '*'
    print '* test..............: ' + str( options.test )
    print '* test_only.........: ' + str( options.test_only )
    print '* test dir..........: ' + '!!! to be added !!!'
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

    # inputs: namespace, project dir, build tool
    scripts.style.calculate( 'xtk', paths.xtkDir, paths.closureLinterFilePath )

    print 'Style checked'
    print '*-----------------------*'

    if ( options.style_only ):
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

    # inputs: namespace, project dir, build tool
    scripts.deps.calculate( 'xtk', paths.xtkDir, paths.closureDepsFilePath )

    print 'Dependencies generated'
    print '*-----------------------*'

    if ( options.deps_only ):
        print 'Enjoy XTK'
        sys.exit()

#
# generate the documentation
# the documentation will be generated in the target-build/doc folder
#
if( options.jsdoc or options.jsdoc_only ):
    print '*-----------------------*'
    print 'Generating Documentation '

    # inputs: namespace, project dir, build tool
    scripts.doc.calculate( 'xtk', paths.xtkDir, paths.jsdocDir )

    print 'Documentation generated'
    print '*-----------------------*'

    if( options.jsdoc_only ):
        print 'Enjoy XTK'
        sys.exit()


if( options.test_only ):
    print '*-----------------------*'
    print 'Testing WITHOUT compilation...'
    scripts.test.calculate( paths.xtkDir, paths.xtkLibDir)
    print 'Testing done.'
    print '*-----------------------*'
    print 'Enjoy XTK'
    sys.exit()

#
# Compile the project
#

print '*-----------------------*'
print 'Compiling Code'

#os.system('python easybuild.py')

if( options.test ):
    print '*-----------------------*'
    print 'Testing WITH compilation...'
    print 'Should give path to xtb-build and update log file'
    scripts.test.calculate( paths.xtkDir, paths.xtkLibDir)
    print 'Testing done.'
    print '*-----------------------*'
    print 'Enjoy XTK'

# report to cdash
# need timing info

now = datetime.datetime.now()
buildtime = str( now.year ) + str( now.month ) + str( now.day ) + "-" + str( now.minute ) + str( now.second )

if( options.experimental):
    xupdate_parser.calculate('Experimental', '', buildtime);
    xconf_parser.calculate('Experimental', '', buildtime);
    xbuild_parser.calculate('Experimental', 'xtk_build.log', buildtime)
    xtest_parser.calculate('Experimental', '', buildtime)
    command = "ctest -S xtk.cmake -V"
    os.system(command)

if(options.nightly):
    xupdate_parser.calculate('Nightly', '', buildtime);
    xconf_parser.calculate('Nightly', '', buildtime);
    xbuild_parser.calculate('Nightly', 'xtk_build.log', buildtime)
    xtest_parser.calculate('Nightly', '', buildtime)
    command = "ctest -S xtk.cmake -V"
    os.system(command)

if(options.continuous):
    xupdate_parser.calculate('Continuous', '', buildtime);
    xconf_parser.calculate('Continuous', '', buildtime);
    xbuild_parser.calculate('Continuous', 'xtk_build.log', buildtime)
    xtest_parser.calculate('Continuous', '', buildtime)
    command = "ctest -S xtk.cmake -V"
    os.system(command)


# delete temp output file

print 'Code Compiled'
print '*-----------------------*'
