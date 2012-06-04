#!/usr/bin/env python
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

# verbose
parser.add_argument( '-v', '--verbose',
                    action='store_true',
                    dest='verbose',
                    default=False,
                    help='More verbose.' )

# build
parser.add_argument( '-b', '--build',
                    action='store_true',
                    dest='build',
                    default=False,
                    help='Compile the XTK source code.' )

# style
parser.add_argument( '-s', '--style',
                    action='store_true',
                    dest='style',
                    default=False,
                    help='Check the style of the target projects.' )

# dependencies
parser.add_argument( '-d', '--deps',
                    action='store_true',
                    dest='deps',
                    default=False,
                    help='Generate goog dependencies of the target projects.' )

# documentation
parser.add_argument( '-j', '--jsdoc',
                    action='store_true',
                    dest='jsdoc',
                    default=False,
                    help='Generate documentation of the target projects.' )

parser.add_argument( '-t', '--test',
                    action='store_true',
                    dest='test',
                    default=False,
                    help='Run all tests in Chrome and Firefox.' )

# experimental build
parser.add_argument( '-e', '--experimental',
                    action='store_true',
                    dest='experimental',
                    default=False,
                    help='Experimental build. Reports to cdash.xtk.org' )

# nightly build
parser.add_argument( '-n', '--nightly',
                    action='store_true',
                    dest='nightly',
                    default=False,
                    help='Nightly build. Reports to cdash.xtk.org' )

# continuous build
parser.add_argument( '-c', '--continuous',
                    action='store_true',
                    dest='continuous',
                    default=False,
                    help='Continuous build. Reports to cdash.xtk.org' )

options = parser.parse_args()

if ( options.verbose ):
    print '___________>T<___________'
    print ' ' + parser.description
    print '*-----------------------*'
    print '*'
    print '* build.............: ' + str( options.build )
    print '* build tool........: ' + paths.compilerFilePath
    print '* compiler file path: ' + paths.closureBuilderFilePath
    print '* xtkDir............: ' + paths.xtkDir
    print '*'
    print '* style.............: ' + str( options.style )
    print '* style file path...: ' + paths.closureLinterFilePath
    print '*'
    print '* deps..............: ' + str( options.deps )
    print '* deps file path....: ' + paths.closureDepsFilePath
    print '*'
    print '* jsdoc.............: ' + str( options.jsdoc )
    print '* jsdoc dir.........: ' + paths.jsdocDir
    print '*'
    print '* test..............: ' + str( options.test )
    print '* test dir..........: ' + '!!! to be added !!!'
    print '*'
    print '* experimental......: ' + str( options.experimental )
    print '* nightly...........: ' + str( options.nightly )
    print '* continuous........: ' + str( options.continuous )
    print '*'
    print '*-----------------------*'

#
# check the style
# passing this step is important for a good style consistency,
# a good documentation and a better compilation
#
if( options.style ):
    print '*-----------------------*'
    print 'Checking style '

    # inputs: namespace, project dir, build tool
    scripts.style.calculate( 'xtk', paths.xtkDir, paths.closureLinterFilePath )

    print 'Style checked'
    print '*-----------------------*'

#
# generate the documentation
# the documentation will be generated in the target-build/doc folder
#
if( options.jsdoc ):
    print '*-----------------------*'
    print 'Generating Documentation '

    # inputs: namespace, project dir, build tool
    scripts.doc.calculate( 'xtk', paths.xtkDir, paths.jsdocDir )

    print 'Documentation generated'
    print '*-----------------------*'

#
# generate the deps files
# target-deps.js will be generated wrote in the target's
# source directory
# deps are useful if you want to use the non compiled target with goog
#
if( options.deps ):
    print '*-----------------------*'
    print 'Generating dependencies '

    # inputs: namespace, project dir, build tool
    scripts.deps.calculate( 'xtk', paths.xtkDir, paths.closureDepsFilePath )

    print 'Dependencies generated'
    print '*-----------------------*'

#
# Compile the project
#
if( options.build ):
    print '*-----------------------*'
    print 'Compiling Code'
    os.system( 'python easybuild.py' )
    print 'Code compiled'
    print '*-----------------------*'

if( options.test ):
    print '*-----------------------*'
    print 'Testing code'
    if( options.build ):
      scripts.test.calculate( paths.xtkDir + '/testing/xtk_tests_build.html', paths.xtkLibDir )
    else:
      scripts.test.calculate( paths.xtkDir + '/testing/xtk_tests.html', paths.xtkLibDir )
    print 'Code tested'
    print '*-----------------------*'

# report to cdash
# need timing info
now = datetime.datetime.now()
buildtime = str( now.year ) + str( now.month ) + str( now.day ) + "-" + str( now.minute ) + str( now.second )

if( options.experimental ):
    xupdate_parser.calculate( 'Experimental', '', buildtime );
    xconf_parser.calculate( 'Experimental', '', buildtime );
    xbuild_parser.calculate( 'Experimental', 'xtk_build.log', buildtime )
    xtest_parser.calculate( 'Experimental', '', buildtime )
    command = "ctest -S xtk.cmake -V"
    os.system( command )

if( options.nightly ):
    xupdate_parser.calculate( 'Nightly', '', buildtime );
    xconf_parser.calculate( 'Nightly', '', buildtime );
    xbuild_parser.calculate( 'Nightly', 'xtk_build.log', buildtime )
    xtest_parser.calculate( 'Nightly', '', buildtime )
    command = "ctest -S xtk.cmake -V"
    os.system( command )

if( options.continuous ):
    xupdate_parser.calculate( 'Continuous', '', buildtime );
    xconf_parser.calculate( 'Continuous', '', buildtime );
    xbuild_parser.calculate( 'Continuous', 'xtk_build.log', buildtime )
    xtest_parser.calculate( 'Continuous', '', buildtime )
    command = "ctest -S xtk.cmake -V"
    os.system( command )

# delete temp output file
# CDASH
#if os.path.exists( 'XTKUpdate.xml' ): os.remove( 'XTKUpdate.xml' )
#if os.path.exists( 'XTKConf.xml' ): os.remove( 'XTKConf.xml' )
#if os.path.exists( 'XTKBuild.xml' ): os.remove( 'XTKBuild.xml' )
#if os.path.exists( 'XTKTest.xml' ): os.remove( 'XTKTest.xml' )
# log files
#if os.path.exists( 'xtk_build.log' ): os.remove( 'xtk_build.log' )
#if os.path.exists( 'xtk_test.log' ): os.remove( 'xtk_test.log' )

print '*-----------------------*'
print 'Visit us at goxtk.com!!!'
print 'Contact us at: dev@goxtk.com'
print 'Enjoy XTK'
print '*-----------------------*'
