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

    # now we create a dashboard submission file
    cdasher = CDash()

    print Colors.CYAN + 'Loading Build Report..' + Colors._CLEAR

    if os.path.isfile( path )

    #
    # build
    cdasher.run( ['Build', log] )

    #
    # test
