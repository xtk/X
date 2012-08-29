#!/usr/bin/env python

#
# The XBUILD dependency generator.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys
from _core import *


#
# entry point
#
if __name__ == "__main__":
  entrypoint = Entrypoint( description='Generate dependencies of ' + SOFTWARE_SHORT + '.' )
  options = entrypoint.parse( sys.argv )

  depsgenerator = DepsGenerator()
  depsgenerator.run( options )

