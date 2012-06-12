#
# The XBUILD builder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import config
from _jsfilefinder import JSFileFinder

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
    filefinder = JSFileFinder()
    jsfiles = filefinder.run()

