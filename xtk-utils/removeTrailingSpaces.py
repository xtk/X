#
#
#

#
# configuration
#
projectName = 'sampleApp'


#
# imports
#
import os, sys

#
# find folders
#

# xtk-utils dir
xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

# project root dir
projectRootDir = os.path.normpath( xtkUtilsDir + os.sep + '..' + os.sep )

# xtk dir
xtkDir = os.path.normpath( projectRootDir + os.sep + 'xtk' )

# xtk dir excludes for whitespace removal
xtkDirExcludes = ['.DS_Store', 'xtk_tests.html', 'xtk-deps.js', 'lib', '.svn', 'git']

# list of files
files = []

# method to list files in directory
def listFiles( dir ):

  global xtkDirExcludes
  global files

  for f in os.listdir( dir ):

    if any( e == f for e in xtkDirExcludes ):
      continue

    if os.path.isdir( dir + os.sep + f ):
      listFiles( dir + os.sep + f )
    elif os.path.isfile( dir + os.sep + f ):
      files.append( os.path.normpath( dir + os.sep + f ) )


# now walk through xtkDir and collect the files
listFiles( xtkDir )

for file in files:

  foundTrailingSpaces = False
  newLines = []

  f = open( file, 'r' )
  for line in f:

    strippedLine = line.rstrip()
    line = line.rstrip( '\n' )

    newLines.append( strippedLine )

    oldLen = len( line )
    newLen = len( strippedLine )

    if oldLen != newLen:

      foundTrailingSpaces = True

      print
      print '------- file: ' + file + '-------'
      print 'OLD: ' + line + '<'
      print 'NEW: ' + strippedLine + '<'
      print '--------------'

  f.close()

  if foundTrailingSpaces:

    # append new empty line
    newLines.append( '' )

    f = open ( file, 'w' )
    f.write( "\n".join( newLines ) )
    f.close()

    print '*** written ' + file

print
print 'All done.'
