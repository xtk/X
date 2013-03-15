#
# The XBUILD depenceny generator.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import stat
import sys
import subprocess

import config
from _cdash import CDash
from _colors import Colors
from _jsfilefinder import JSFileFinder

#
#
#
class DepsGenerator( object ):
  '''
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''

    print 'Generating dependency file for ' + config.SOFTWARE_SHORT + '...'

    # grab all js files
    filefinder = JSFileFinder()
    jsfiles = filefinder.run( ['USE_INCLUDES'] )

    arguments = []

    # closure base path
    basepath = os.path.dirname( os.path.dirname( config.CLOSUREDEPSWRITER_PATH ) )

    # set the output file
    arguments.extend( ['--output_file=' + config.DEPS_OUTPUT_PATH] )

    # add js files
    for j in jsfiles:
      arguments.extend( ['--path_with_depspath=' + j + ' ' + os.path.relpath( j, basepath )] )

    #
    # call the closure depswriter
    #
    
    # make sure the depswriter is executable
    st = os.stat( config.CLOSUREDEPSWRITER_PATH )
    os.chmod( config.CLOSUREDEPSWRITER_PATH, st.st_mode | stat.S_IEXEC )    
    
    command = [config.CLOSUREDEPSWRITER_PATH]
    command.extend( arguments )

    process = subprocess.Popen( command, bufsize=0, stdout=subprocess.PIPE, stderr=subprocess.STDOUT )

    # no output is good
    noOutput = True

    # print any output in red since it probably indicates an error
    for line in process.stdout:
      line = line.strip( '\n' )
      print Colors.RED + line + Colors._CLEAR
      noOutput = False

    if noOutput:

      # all good and done
      print Colors.ORANGE + 'Dependency file ' + Colors.PURPLE + config.DEPS_OUTPUT_PATH + Colors.ORANGE + ' generated. ' + Colors._CLEAR
      print Colors.ORANGE + 'Usage:' + Colors._CLEAR
      print Colors.CYAN + '  <script type="text/javascript" src="' + os.path.relpath( config.CLOSUREGOOGBASE_PATH, os.path.join( config.SOFTWARE_PATH, '../' ) ) + '"></script>' + Colors._CLEAR
      print Colors.CYAN + '  <script type="text/javascript" src="' + os.path.relpath( config.DEPS_OUTPUT_PATH, os.path.join( config.SOFTWARE_PATH, '../' ) ) + '"></script>' + Colors._CLEAR

    else:

      # maybe an error
      print Colors.ORANGE + 'Could not generate dependency file.' + Colors._CLEAR
