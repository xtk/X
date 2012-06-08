import pprint
import os
import sys
import string

xtkDir = '../'

sys.path.append( xtkDir + '/lib/closure-library/closure/bin/build' )
import treescan

JSDOCSTART = '/**'
JSDOCEND = '*/'
CONSTRUCTORJSDOC = '@constructor'
EXTENDSJSDOC = '@extends'
MIXINJSDOC = '@mixin'
GOOGEXPORT = 'goog.exportSymbol('
THIS = 'this'
PROTOTYPE = 'prototype'
DEFINESETTER = '__defineSetter__'
DEFINEGETTER = '__defineGetter__'
NAMESPACE = 'X'
TYPES = {'constructor':0, 'static':1, 'function':2, 'getter':3, 'setter':4, 'property':5}
PRIVACY = {'private':0, 'public':1}

#
# Loop through all files and create symbol table
# 

totalSymbols = 0

files = {}
inheritances = {}
#files = {'':['', {}, []]}
#classes = {'classname':{'name': [privacy, type, jsdoc]], []}

# ignore these files
excludePaths = ['lib', 'testing', 'deps', 'utils']

# scan for .js files
jsFilesGenerator = treescan.ScanTreeForJsFiles( xtkDir )

# list of final .js files to compile
jsFiles = []

# apply excludes
for j in jsFilesGenerator:

  ignore = False

  for e in excludePaths:
    if string.count( j, e ) > 0:
      # ignore this guy
      ignore = True

  if not ignore:
    # add this guy to the valid files
    jsFiles.append( j )


for j in jsFiles:

  classes = {}

  filename = j

  with open( filename, 'r' ) as f:

    # read the whole file
    lines = f.readlines()

  # state switches
  jsdocActive = False
  queryIdentifier = False
  jsdocBuffer = ''

  # class information
  classname = ''
  inherits = []
  exports = []

  # symbol information
  type = -1
  privacy = 0 # by default private


  # forward loop through file
  for line in lines:

    line = line.strip()
    if line:
      # ignore blank lines

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

        # check for special jsdoc tags inside the comments

        # @extends
        extends = line.find( EXTENDSJSDOC )
        if extends != -1:
          inheritsClass = line[extends + len( EXTENDSJSDOC ):].strip()

          # strip the namespace
          inheritsClass = inheritsClass.replace( NAMESPACE + '.', '' )

          inherits.append( inheritsClass )

        # @mixin
        mixin = line.find( MIXINJSDOC )
        if mixin != -1:
          inheritsClass = line[mixin + len( MIXINJSDOC ):].strip()

          # strip the namespace
          inheritsClass = inheritsClass.replace( NAMESPACE + '.', '' )

          inherits.append( inheritsClass )

      if jsdocActive and line[0:len( JSDOCEND )] == JSDOCEND:
        # end of JSDOC
        jsdocActive = False
        queryIdentifier = True
        continue

      if queryIdentifier:
        # store the Identifier and the corresponding JSDOC

        identifier = line.split( ' ' )[0] # split by blank
        identifierSplitted = identifier.split( '.' ) # split by dot
        #classname = identifierSplitted[1] # should always be the classname      
        identifier = identifierSplitted[-1]

        # check for namespace
        if line[0] != NAMESPACE:

          # check if this is a public property
          if line[0:4] == THIS:

            # check if the property has a constant name aka. is defined with a string
            if line[4:6] == "['" or line[4:6] == '["':
              # this is a public property property
              privacy = 1
              # todo set correct identifier

            type = TYPES['property']

          else:
            # no namespace so we reset the buffer
            jsdocBuffer = ''
            queryIdentifier = False
            continue

        elif identifierSplitted[-2] != PROTOTYPE:

          # static method or constructor
          if jsdocBuffer.find( CONSTRUCTORJSDOC ) != -1:
            # this is a constructor
            type = TYPES['constructor']
            classname = identifier

            # check if we have parent classes, then update the inheritance table
            if len( inherits ) > 0:
              # add to inheritances
              if not inheritances.has_key( classname ):
                inheritances[classname] = []

              inheritances[classname].extend( inherits )
              inherits = [] # reset the inheritances


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
            privacy = PRIVACY['public']

          elif identifier[0:len( DEFINESETTER )] == DEFINESETTER:
            # a setter
            identifier = identifier[len( DEFINESETTER ):].split( "'" )[1]
            type = TYPES['setter']
            privacy = PRIVACY['public']

        if not classes.has_key( classname ):
          # no symbols for this class yet
          classes[classname] = {}

        # add the current symbol
        classes[classname][identifier] = {'privacy':privacy, 'type':type, 'doc':jsdocBuffer}

        totalSymbols += 1

        # clear the buffer and all other symbol specific data
        jsdocBuffer = ''
        type = -1
        privacy = 0
        # clear the state switches
        queryIdentifier = False

  # add to files
  filename = os.path.basename( filename )
  files[filename] = classes

  #
  # mark all exported symbols automatically as public
  #
  for c in files[filename].keys():
    # check all detected classes
    for s in files[filename][c].keys():
      # check all detected symbols

      for e in exports:
        # check all detected exports      
        if e == s:
          # this is an exported symbol, mark it as public
          files[filename][c][s]['privacy'] = 1

      # check if the symbol is public, else wise discard it
#      if files[filename][c][s]['privacy'] != 1:
#        del files[filename][c][s]



pp = pprint.PrettyPrinter( indent=2 )
pp.pprint( files )

pp.pprint( inheritances )

print
print 'Total Symbols Count:', totalSymbols


#  if jsdoc.has_key( e ):
#    print jsdoc[e]
#    print e
#    print
##    print 'could not find ' + e
