#!/usr/bin/env python

#
# The XBUILD documenter.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys
from _core import *


#
# entry point
#
if __name__ == "__main__":
  entrypoint = Entrypoint( description='Generate documentation for ' + SOFTWARE_SHORT + '.' )

  # add debug flag
  entrypoint.add( 'r', 'remove', 'remove any existing documentation' )

  options = entrypoint.parse( sys.argv )

  documenter = Documenter()
  documenter.run( options )
