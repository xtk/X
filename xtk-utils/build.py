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
                    dest='appDir',
                    default=paths.appDir,
                    help='Location of the xtk-based applicatoion you want to build. A new folder \'application-build\' will be created.')

parser.add_argument('--doc',
                    action='store_true',
                    dest='doc',
                    default=False,
                    help='Generate documentation for the project which will be built.')

options = parser.parse_args()

if (options.verbose):
    print 'xtk building tool using the following options:'
    print 'xtk_only:' + str(options.xtk_only)
    print 'appDir:' + options.appDir
    print 'doc:' + str(options.doc)



