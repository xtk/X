#
# The XBUILD tester.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
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
class Tester( object ):
  '''
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''

    print 'Testing ' + config.SOFTWARE_SHORT + '...'

    # TODO run tests and parse output

    log = []
    log.append( ['Test1', 'passed', 'All worked!Yay!', 200, None, None] )
    log.append( ['Test2', 'failed', 'Failure :( :( :(Failure!', 123, None, None] )


    # now we create a dashboard submission file
    cdasher = CDash()
    xmlfile = cdasher.run( ['Testing', log] )

    with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Test.xml' ), 'w' ) as f:
      f.write( xmlfile )

    print Colors.ORANGE + 'Testing done.'
