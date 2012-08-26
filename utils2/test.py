#!/usr/bin/env python

#
# The XBUILD tester.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys
from _core import *


#
# entry point
#
if __name__ == "__main__":
  entrypoint = Entrypoint( description='Perform a test of ' + SOFTWARE_SHORT + '.' )

  # add testing flags
  entrypoint.add( 'c', 'chrome', 'test using the Chrome browser, DEFAULT', True )
  entrypoint.add( 'f', 'firefox', 'test using the Firefox browser', False )
  entrypoint.add( 'b', 'build', 'test against the built', False )
  entrypoint.add( 'nv', 'novisual', 'skip visual testing', False )

  options = entrypoint.parse( sys.argv )

  tester = Tester()
  tester.run( options )

