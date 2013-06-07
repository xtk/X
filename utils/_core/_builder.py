#
# The XBUILD builder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import datetime
import os
import stat
import sys
import subprocess

import config
from _cdash import CDash
from _colors import Colors
from _jsfilefinder import JSFileFinder
from _licenser import Licenser

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

    print 'Building ' + config.SOFTWARE_SHORT + '...'

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
    arguments.extend( ['-f', '--summary_detail_level=3'] ) # always show summary
    arguments.extend( [ '-f', '--define=goog.DEBUG=false'] ) # turn of closure library debugging

    # add the goog/deps.js file from closure according to
    # https://code.google.com/p/closure-library/wiki/FrequentlyAskedQuestions#When_I_compile_with_type-checking_on,_I_get_warnings_about_unkno
    arguments.extend( [ '-f', '--js=' + config.CLOSURELIBRARY_DEPS_PATH] )

    # if enabled, set debug options
    if options.debug:
      arguments.extend( ['-f', '--debug'] )
      arguments.extend( ['-f', '--formatting=PRETTY_PRINT'] )


    #
    # call the compiler (through the closure builder)
    #
    
    # make sure the closurebuilder is executable
    st = os.stat( config.CLOSUREBUILDER_PATH )
    os.chmod( config.CLOSUREBUILDER_PATH, st.st_mode | stat.S_IEXEC )
    
    command = ['python', config.CLOSUREBUILDER_PATH]
    command.extend( arguments )

    process = subprocess.Popen( command, bufsize=0, stdout=subprocess.PIPE, stderr=subprocess.STDOUT )

    # ignore the next X lines
    ignoreNext = 0

    # save warnings and errors in a log
    logActive = False
    log = []

    # fancy displaying using ANSI colors
    for line in process.stdout:

      if ignoreNext > 0:
        # we ignore this line
        ignoreNext -= 1
        continue

      line = line.strip( '\n' )
      color = Colors._CLEAR # default is no color

      # colorize depending on line content
      if line.find( 'Scanning' ) != -1:
        color = Colors.YELLOW
      elif line.find( 'scanned' ) != -1:
        color = Colors.YELLOW
      elif line.find( 'Building' ) != -1:
        color = Colors.PURPLE
      elif line.find( 'Compiling' ) != -1:
        color = Colors.PURPLE
        # start logging now
        logActive = True
      elif line.find( 'ERROR' ) != -1:
        color = Colors.RED
      elif line.find( 'WARNING' ) != -1:
        # this is a warning, only display these if verbose mode is on
        if not options.verbose:
          ignoreNext = 3 # and ignore the next 2 lines
          continue

        color = Colors.ORANGE

      if logActive:
        # log this line if we are in logging mode
        log.append( line )

      # print colored line
      print color + line + Colors._CLEAR

    # we have errors and warnings logged now
    log = log[1:-1] # remove first and last log entries since they are additional information

    # now we create a dashboard submission file
    cdasher = CDash()
    xmlfile = cdasher.run( ['Build', log, True] )

    with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Build.xml' ), 'w' ) as f:
      f.write( xmlfile )

    # and add a timestamp to the compiled file
    with open( config.BUILD_OUTPUT_PATH, 'r' ) as f:

      content = f.read() # read everything in the file
      now = datetime.datetime.now()
      content_with_timestamp = content.replace( '###TIMESTAMP###', now.strftime( '%Y-%m-%d %H:%M:%S' ) )

    with open( config.BUILD_OUTPUT_PATH, 'w' ) as f:

      f.write( content_with_timestamp ) # write the new stuff

    # and attach the license
    licenser = Licenser()
    licenser.run()

    print Colors.ORANGE + 'Compiled file ' + Colors.CYAN + config.BUILD_OUTPUT_PATH + Colors.ORANGE + ' written. ' + Colors._CLEAR
