#
# The XBUILD license adder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import config

#
#
#
class Licenser( object ):
  '''
  Attaches a license to the output file.
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''
    with open( config.BUILD_OUTPUT_PATH, 'r+' ) as f:

      old = f.read() # read everything in the file
      f.seek( 0 ) # rewind
      f.write( config.LICENSE_HEADER + '\n' + old ) # write the license before
