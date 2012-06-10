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




def __findClass( classname ):
  '''
  '''
  for f in files:
    if files[f].has_key( classname ):

      return files[f][classname]

def __updatePrivacy( classname ):
  '''
  '''
  objectclass = __findClass ( classname )

  if exportations.has_key( classname ):
    for e in exportations[classname]:

      for s in objectclass.keys():

        if e == s:
          # this is an exported symbol, mark it as public
          objectclass[s]['public'] = 1

def __inheritSymbols( classname1, classname2 ):
  '''
  '''
  dic1 = __findClass( classname1 )
  dic2 = __findClass( classname2 )

  if not dic1 or not dic2:
    return

  extendingDic = dic2.copy()
  for s in dic2:
    if dic2[s]['type'] == 0:
      # we don't want to inherit constructors
      del extendingDic[ s ]

  dic1.update( extendingDic )

def inherit( classname, level=0 ):
  '''
  '''
  if inheritances.has_key( classname ):

    for i in inheritances[classname]:

      # start recursion
      inherit( i, level + 1 )

      __inheritSymbols( classname, i )
      __updatePrivacy( classname )




#
# Loop through all files and create symbol table
# 

totalSymbols = 0

files = {}
inheritances = {}
exportations = {}
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
            identifier = identifier[len( DEFINEGETTER ):].split( "'" )[1] + '_get'
            type = TYPES['getter']
            privacy = PRIVACY['public']

          elif identifier[0:len( DEFINESETTER )] == DEFINESETTER:
            # a setter
            identifier = identifier[len( DEFINESETTER ):].split( "'" )[1] + '_set'
            type = TYPES['setter']
            privacy = PRIVACY['public']

        if not classes.has_key( classname ):
          # no symbols for this class yet
          classes[classname] = {}

        # add the current symbol
        classes[classname][identifier] = {'public':privacy, 'type':type, 'doc':jsdocBuffer}

        totalSymbols += 1

        # clear the buffer and all other symbol specific data
        jsdocBuffer = ''
        type = -1
        privacy = 0
        # clear the state switches
        queryIdentifier = False

  # add to files
  #filename = os.path.basename( filename )
  files[filename] = classes
  exportations[classname] = exports

  #
  # mark all exported symbols automatically as public
  #
  for c in classes.keys():
    # check all detected classes
    __updatePrivacy( c )


#
# now all files have been parsed
#

# map symbols along the inheritance tree
for i in inheritances:
  inherit( i )

#pp = pprint.PrettyPrinter( indent=2 )
#pp.pprint( __findClass( 'renderer3D' ) )

import shutil
shutil.rmtree( '/tmp/xdoc' )
outputDir = '/tmp/xdoc'
os.mkdir( outputDir )

shutil.copy( 'xdoc.css', outputDir )

for f in files:

  for c in files[f]:

    symbols = files[f][c]

    # load the template
    with open( 'xdoc.html', 'r' ) as t:
      output = t.read()

    title = 'The X Toolkit API'
    classname = c # the classname
    content = ''

    for s in symbols:

      jsdoc = symbols[s]['doc']
      #jsdoc = jsdoc.replace( '\n', '<br>' )
      public = symbols[s]['public']

      if public:
        # this is a public symbol
        content += '<div class="public">\n'
      else:
        # this is a private symbol
        content += '<div class="private">\n'

      content += '<pre>' + jsdoc + '</pre>' + '\n'

      identifier = s.replace( '_get', '' ).replace( '_set', '' )
      #prefix = NAMESPACE + '.'
      identifierCode = identifier

      # TYPES = {'constructor':0, 'static':1, 'function':2, 'getter':3, 'setter':4, 'property':5}
      if symbols[s]['type'] == 0:
        identifierCode = 'var ' + classname[0] + ' = new <span class="identifier">' + NAMESPACE + '.' + identifier + '();</span>;'

      elif symbols[s]['type'] == 1:
        identifierCode = NAMESPACE + '.' + classname + '.<span class="identifier">' + identifier + '();</span>'

      elif symbols[s]['type'] == 2:
        identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span>();';

      elif symbols[s]['type'] == 3:
        identifierCode = 'var _' + identifier + ' = ' + classname[0] + '.<span class="identifier">' + identifier + ';</span>'

      elif symbols[s]['type'] == 4:
        identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = ' + '$SOMEVALUE;';

      elif symbols[s]['type'] == 5:
        identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = ' + '$SOMEVALUE;';

      content += '<span class="code">' + identifierCode + '</span><br>'
      content += '</div>'

    # modify template
    output = output.replace( '${TITLE}', title )
    output = output.replace( '${CLASSNAME}', classname )
    output = output.replace( '${CONTENT}', content )

    with open( outputDir + os.sep + c + '.html', 'w' ) as outputf:

      outputf.write( output )




print
print 'Total Symbols Count:', totalSymbols

print sorted( files.keys() )
