#!/usr/bin/env python

#
# The XBUILD uploader.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys
from _core import *


#
# entry point
#
if __name__ == "__main__":
  entrypoint = Entrypoint( description='Upload build and test results of ' + SOFTWARE_SHORT + ' to the public dashboard.' )
  options = entrypoint.parse( sys.argv )

  uploader = Uploader()
  uploader.run( options )

