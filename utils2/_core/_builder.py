#
# The XBUILD builder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import sys
import subprocess

import config
from _jsfilefinder import JSFileFinder


class ColorPrompt( object ):
  '''
  This color prompt colorizes text depending on its content.
  '''
  YELLOW = '\033[33m'
  PURPLE = '\033[35m'
  RED = '\033[31m'
  ORANGE = '\033[93m'
  _CLEAR = '\033[0m'

  def write( self, line ):
    '''
    '''
    line = line.strip( '\n' )
    color = ''

    # colorize depending on line content
    if line.find( 'Scanning' ) != -1:
      color = self.YELLOW
    elif line.find( 'scanned' ) != -1:
      color = self.YELLOW
    elif line.find( 'Building' ) != -1:
      color = self.PURPLE
    elif line.find( 'Compiling' ) != -1:
      color = self.PURPLE
    elif line.find( 'ERROR' ) != -1:
      color = self.RED
    elif line.find( 'WARNING' ) != -1:
      color = self.ORANGE

    print color + line + self._CLEAR


#
#
#
class Builder( object ):
  '''
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''
    # grab all js files
    filefinder = JSFileFinder()
    jsfiles = filefinder.run()

    arguments = []

    # add js files
    for j in jsfiles:
      arguments.extend( ['-i', j] )

    # add the project root
    arguments.extend( ['--root', config.SOFTWARE_PATH] )

    # set the output mode to compiled
    arguments.extend( ['-o', 'compiled'] )

    # configure the compiler path
    arguments.extend( ['-c', config.CLOSURECOMPILER_PATH] )

    # configure the output file
    arguments.extend( ['--output_file', config.BUILD_OUTPUT_PATH] )

    # configure additional compiler arguments
    arguments.extend( [ '-f', '--warning_level=VERBOSE'] ) # verbose
    arguments.extend( [ '-f', '--compilation_level=ADVANCED_OPTIMIZATIONS'] ) # advanced compilation
    arguments.extend( [ '-f', '--jscomp_warning=missingProperties'] ) # enable strict mode 1
    arguments.extend( [ '-f', '--jscomp_warning=checkTypes'] ) # enable strict mode 2
    arguments.extend( [ '-f', '--define=goog.DEBUG=false'] ) # turn of closure library debugging

    # if enabled, set debug options
    if options.debug:
      arguments.extend( ['-f', '--debug'] )
      arguments.extend( ['-f', '--formatting=PRETTY_PRINT'] )


    #
    # call the compiler (through the closure builder)
    #
    command = [config.CLOSUREBUILDER_PATH]
    command.extend( arguments )

    process = subprocess.Popen( command, bufsize=0, stdout=subprocess.PIPE, stderr=subprocess.STDOUT )

    # fancy displaying using the color prompt
    colorPrompt = ColorPrompt()

    for line in process.stdout:
      colorPrompt.write( line )
