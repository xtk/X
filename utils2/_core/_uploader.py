#
# The XBUILD uploader.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import sys
import subprocess

import config
from _cdash import CDash
from _colors import Colors

#
#
#
class Uploader( object ):
  '''
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''

    print 'Uploading results for ' + config.SOFTWARE_SHORT + '...'

    # check which submission type
    submissiontype = 'Experimental'
    if options.continuous:
      submissiontype = 'Continuous'
    elif options.nightly:
      submissiontype = 'Nightly'


    # now we create a dashboard submission file
    cdasher = CDash()

    #
    # build
    #
    print Colors.CYAN + 'Loading Build Report..' + Colors._CLEAR
    buildReport = os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Build.xml' )

    if os.path.isfile( buildReport ):
      # found a build report
      print Colors.ORANGE + 'Found Build Report!' + Colors._CLEAR

      with open( buildReport, 'r' ) as f:
        cdasher.submit( f.read(), submissiontype )

      print Colors.ORANGE + '..Successfully uploaded as ' + Colors.CYAN + submissiontype + Colors.ORANGE + '.' + Colors._CLEAR

    else:
      # not found
      print Colors.ORANGE + 'Not Found!' + Colors._CLEAR
      buildReport = None

    #
    # test
    #
    print Colors.CYAN + 'Loading Testing Report..' + Colors._CLEAR
    testReport = os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Test.xml' )

    if os.path.isfile( testReport ):
      # found a build report
      print Colors.ORANGE + 'Found Testing Report!' + Colors._CLEAR

      with open( testReport, 'r' ) as f:
        cdasher.submit( f.read(), submissiontype )

      print Colors.ORANGE + '..Successfully uploaded as ' + Colors.CYAN + submissiontype + Colors.ORANGE + '.' + Colors._CLEAR

    else:
      # not found
      print Colors.ORANGE + 'Not Found!' + Colors._CLEAR
      testReport = None

    # delete old reports
    if buildReport:
      os.unlink( buildReport )

    if testReport:
      print testReport
      #os.unlink( testReport )
