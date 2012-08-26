#
# The XBUILD ansi color collection.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

class Colors( object ):
  '''
  ANSI colors.
  '''
  YELLOW = '\033[33m'
  PURPLE = '\033[35m'
  RED = '\033[31m'
  ORANGE = '\033[93m'
  CYAN = '\033[36m'
  _CLEAR = '\033[0m'

  @staticmethod
  def strip( text ):
    '''
    Strips all color codes from a text.
    '''
    members = [attr for attr in Colors.__dict__.keys() if not attr.startswith( "__" ) and not attr == 'strip']

    for c in members:

      text = text.replace( vars( Colors )[c], '' )

    return text
