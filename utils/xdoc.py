JSDOCSTART = '/**'
JSDOCEND = '*/'
GOOGEXPORT = 'goog.exportSymbol('
GOOGINHERITS = 'goog.inherits('
NAMESPACE = 'X'

#
# Loop through all files and create symbol table
# [filename, classname, symbols{name,type,jsdoc}, lookup{})
# 

with open( '../visualization/renderer3D.js', 'r' ) as f:

  lines = f.readlines()

jsdocActive = False
queryIdentifier = False
tmpBuffer = ''

inherits = ''
exports = []
jsdoc = {}

# forward loop through file
for line in lines:

  line = line.strip()
  if line:
    # ignore blank lines

    # check for GOOGINHERITS
    if line[0:len( GOOGINHERITS )] == GOOGINHERITS:
      inherits = line[len( GOOGINHERITS ):].split( ',' )[1].rstrip( ');' ).strip()

    # check for GOOGEXPORT
    if line[0:len( GOOGEXPORT )] == GOOGEXPORT:
      exports.append( line[len( GOOGEXPORT ):].split( ',' )[0].strip( "'" ) )
      continue

    # check for JSDOC
    if line[0:len( JSDOCSTART )] == JSDOCSTART:
      #found start of JSDOC
      tmpBuffer += line[0:len( JSDOCSTART )]
      jsdocActive = True
      continue

    if jsdocActive:
      # this is part of the JSDOC
      tmpBuffer += '\n' + line

    if jsdocActive and line[0:len( JSDOCEND )] == JSDOCEND:
      # end of JSDOC
      jsdocActive = False
      queryIdentifier = True
      continue

    if queryIdentifier:
      # store the Identifier and the corresponding JSDOC
      identifier = line.split( ' ' )[0]
      jsdoc[identifier] = tmpBuffer
      # clear the buffer
      tmpBuffer = ''
      queryIdentifier = False

print 'Inherits: ', inherits

for e in exports:
  if jsdoc.has_key( e ):
    print jsdoc[e]
    print e
    print
  else:
    print 'could not find ' + e
