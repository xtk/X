#
# The XBUILD JS File finder.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import sys

import config

#
#
#
class JSFileFinder( object ):
  '''
  Finds JS Files in directory.
  '''

  def run( self, options=None ):
    '''
    Performs the action.
    '''

    # we need to import some closure python classes here
    sys.path.append( config.CLOSURELIBRARY_PYTHON_PATH )
    import treescan

    # scan for .js files
    jsFilesGenerator = treescan.ScanTreeForJsFiles( config.SOFTWARE_PATH )

    # list of final .js files to compile    
    jsFiles = []

    # apply ignores
    for j in jsFilesGenerator:

      ignore = False

      for e in config.EXCLUDES_PATH:
        if j.find( e ) != -1:
          # ignore this guy
          ignore = True

      if options and options[0] == 'USE_INCLUDES':
        for i in config.INCLUDES_PATH:
          if j.find( i ) != -1:
            # force inclusion for this guy
            ignore = False

      if not ignore:
        # add this guy to the valid files
        jsFiles.append( j )

    # return filtered list
    return jsFiles
