#!/usr/bin/env python

#
# The XBUILD builder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys
from _core import *


#
# entry point
#
if __name__ == "__main__":
  entrypoint = Entrypoint( description='Perform a build of ' + SOFTWARE_SHORT + '.' )
  options = entrypoint.parse( sys.argv )

  builder = Builder()
  builder.run( options )

