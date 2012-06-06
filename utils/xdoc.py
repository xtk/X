JSDOCSTART = '/**'
JSDOCEND = '*/'
GOOGEXPORT = 'goog.exportSymbol('
GOOGINHERITS = 'goog.inherits('
THIS = 'this'
PROTOTYPE = 'prototype'
DEFINESETTER = '__defineSetter__'
DEFINEGETTER = '__defineGetter__'
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
      exports.append( line[len( GOOGEXPORT ):].split( ',' )[0].strip( "'" ).split( '.' )[-1] )
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

      # check for namespace
      if line[0] != NAMESPACE:

        # check if this is a public property
        if line[0:4] == THIS:

          # check if 

        else:
          # no namespace so we reset the buffer
          tmpBuffer = ''
          queryIdentifier = False
          continue

      identifier = line.split( ' ' )[0] # split by blank
      identifierSplitted = identifier.split( '.' ) # split by dot
      identifier = identifierSplitted[-1]

      if identifierSplitted[-2] != PROTOTYPE:

        # static method or constructor
        print 'Found static method or constructor: ' + identifier

      else:
        # a prototype method

        # check for getters/setters
        if identifier[0:len( DEFINEGETTER )] == DEFINEGETTER:
          # a getter
          identifier = identifier[len( DEFINEGETTER ):].split( "'" )[1]

        elif identifier[0:len( DEFINESETTER )] == DEFINESETTER:
          # a setter
          identifier = identifier[len( DEFINEGETTER ):].split( "'" )[1]


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
