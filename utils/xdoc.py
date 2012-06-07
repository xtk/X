import pprint

JSDOCSTART = '/**'
JSDOCEND = '*/'
GOOGEXPORT = 'goog.exportSymbol('
GOOGINHERITS = 'goog.inherits('
THIS = 'this'
PROTOTYPE = 'prototype'
DEFINESETTER = '__defineSetter__'
DEFINEGETTER = '__defineGetter__'
NAMESPACE = 'X'
TYPES = {'constructor':0, 'static':1, 'function':2, 'getter':3, 'setter':4}
HIDINGFACTORS = {'private':0, 'public':1}

#
# Loop through all files and create symbol table
# [filename, classname, symbols{name,hidingFactor,type,jsdoc}, lookup{})
# 

files = {}
classes = {}
#files = {'':['', {}, []]}
#classes = {'classname':{'name': [hidingFactor, type, jsdoc]], []}

filename = 'renderer3D.js'

with open( '../visualization/' + filename, 'r' ) as f:

  # read the whole file
  lines = f.readlines()

# state switches
jsdocActive = False
queryIdentifier = False
jsdocBuffer = ''

# class information
inherits = ''
exports = []

# symbol information
type = -1
hidingFactor = 0 # by default private


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
      jsdocBuffer += line[0:len( JSDOCSTART )]
      jsdocActive = True
      continue

    if jsdocActive:
      # this is part of the JSDOC
      jsdocBuffer += '\n' + line

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

          # check if the property has a constant name aka. is defined with a string
          if line[4:6] == "['" or line[4:6] == '["':
            # this is a constant property
            print 'constant', line
            continue

        else:
          # no namespace so we reset the buffer
          jsdocBuffer = ''
          queryIdentifier = False
          continue

        continue

      identifier = line.split( ' ' )[0] # split by blank
      identifierSplitted = identifier.split( '.' ) # split by dot
      #classname = identifierSplitted[1] # should always be the classname      
      identifier = identifierSplitted[-1]

      if identifierSplitted[-2] != PROTOTYPE:

        # static method or constructor
        if len( identifierSplitted ) == 2:
          # this is a constructor
          type = TYPES['constructor']
          classname = identifier

        else:
          # this is a static method
          type = TYPES['static']

      else:
        # a prototype method
        type = TYPES['function']

        # check for getters/setters
        if identifier[0:len( DEFINEGETTER )] == DEFINEGETTER:
          # a getter
          identifier = identifier[len( DEFINEGETTER ):].split( "'" )[1]
          type = TYPES['getter']
          hidingFactor = HIDINGFACTORS['public']

        elif identifier[0:len( DEFINESETTER )] == DEFINESETTER:
          # a setter
          identifier = identifier[len( DEFINESETTER ):].split( "'" )[1]
          type = TYPES['setter']
          hidingFactor = HIDINGFACTORS['public']

      if not classes.has_key( classname ):
        # no symbols for this class yet
        classes[classname] = {}

      # add the current symbol
      classes[classname][identifier] = [hidingFactor, type, jsdocBuffer]

      # clear the buffer and all other symbol specific data
      jsdocBuffer = ''
      type = -1
      hidingFactor = 0
      # clear the state switches
      queryIdentifier = False


# add to files
files[filename] = classes

pp = pprint.PrettyPrinter( indent=2 )

print 'Inherits: ', inherits



for c in files[filename].keys():
  # check all detected classes
  for s in files[filename][c].keys():
    # check all detected symbols

    for e in exports:
      # check all detected exports      
      if e == s:
        # this is an exported symbol, mark it as public
        files[filename][c][s][0] = 1

    # check if the symbol is public, else wise discard it
    if files[filename][c][s][0] != 1:
      del files[filename][c][s]


pp.pprint( files )

#  if jsdoc.has_key( e ):
#    print jsdoc[e]
#    print e
#    print
##    print 'could not find ' + e
