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
PARAMJSDOC = '@param'
RETURNJSDOC = '@return'
TYPEJSDOC = '@type'
GOOGEXPORT = 'goog.exportSymbol('
THIS = 'this'
PROTOTYPE = 'prototype'
DEFINESETTER = '__defineSetter__'
DEFINEGETTER = '__defineGetter__'
NAMESPACE = 'X'
REPO_URL = 'https://github.com/xtk/X/blob/master/X/'
TYPES = {'constructor':0, 'static':5, 'function':3, 'gettersetter':2, 'property':1}
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

    elif dic1.has_key( s ) and dic1[s]['doc'].find( '@inheritDoc' ) == -1:
      # if we re-comment the method, do not inherit it
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

def inheritanceChart( classname, level=0 ):
  '''
  '''
  output = ""

  # attach namespace  
  classnameString = classname
  if classname.find( '.' ) == -1:
    classnameString = NAMESPACE + '.' + classname

  if inheritances.has_key( classname ):

    for i in inheritances[classname]:

      # start recursion
      output += inheritanceChart( i, level + 1 )

      # attach namespace
      iString = i
      if i.find( '.' ) == -1:
        iString = NAMESPACE + '.' + i

      output += '["' + classnameString + '","' + iString + '",' + 'null],\n'

  else:

    output += '[{v:"' + classnameString + '",f:"<font color=green>' + classnameString + '</font>"},null,null],\n'

  return output

#
# Loop through all files and create symbol table
# 

totalSymbols = 0

files = {}
allclasses = [] # we only need a list here
inheritances = {}
exportations = {}

# holding all files which have constructors
leftMenu = {}

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
  params = []
  returns = []


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
        jsdocBuffer += '\n' + line.replace( '<pre>', '' ).replace( '</pre>', '' )

        # check for special jsdoc tags inside the comments

        # @param
        param = line.find( PARAMJSDOC )
        if param != -1:
          paramName = line[param + len( PARAMJSDOC ):].strip().split( ' ' )[1]
          params.append( '$' + paramName )

        # @return
        return_ = line.find( RETURNJSDOC )
        if return_ != -1:
          returns.append( True )

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

            # we have the current filename here as j
            subfolder = os.path.dirname( j ).split( os.sep )[-1]

            # ignore toplevel files
            if not subfolder == '..':

              # check if we have already files from this subfolder
              if not leftMenu.has_key( subfolder ):
                leftMenu[subfolder] = []

              # add this file if it does not exist
              if leftMenu[subfolder].count( classname ) == 0:
                leftMenu[subfolder].append( classname )

            # check if we have parent classes, then update the inheritance table
            if len( inherits ) > 0:
              # add to inheritances
              if not inheritances.has_key( classname ):
                inheritances[classname] = []

              inheritances[classname].extend( inherits )
              inherits = [] # reset the inheritances

            # always add to classes
            allclasses.append( classname )

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
            type = TYPES['gettersetter']
            privacy = PRIVACY['public']

          elif identifier[0:len( DEFINESETTER )] == DEFINESETTER:
            # a setter
            identifier = identifier[len( DEFINESETTER ):].split( "'" )[1] + '_set'
            type = TYPES['gettersetter']
            privacy = PRIVACY['public']

        if not classes.has_key( classname ):
          # no symbols for this class yet
          classes[classname] = {}

        # add the current symbol
        classes[classname][identifier] = {'public':privacy, 'type':type, 'doc':jsdocBuffer, 'params':params, 'returns':returns}

        totalSymbols += 1

        # clear the buffer and all other symbol specific data
        jsdocBuffer = ''
        type = -1
        privacy = 0
        returns = []
        params = []
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
shutil.copy( 'xdoc.png', outputDir )


# left menu
leftMenuContent = ''
for folder in sorted( leftMenu.iterkeys() ):
  leftMenuContent += '<b>' + folder.upper() + '</b><br>'
  for classname in sorted( leftMenu[folder], key=str.lower ):
    leftMenuContent += '<span class="menuitem"><a href="' + classname + '.html">' + NAMESPACE + '.' + classname + '</a></span><br>'
  leftMenuContent += '<br>'

#
# main content loop
#
for f in files:

  for c in files[f]:

    if not c:
      # skip empty classnames
      continue

    symbols = files[f][c]

    # load the template
    with open( 'xdoc.html', 'r' ) as t:
      output = t.read()

    title = 'The X Toolkit API'
    classname = c # the classname
    content = ''
    hasPublic = False

    # sort the symbols, first by type then by name
    symbolList = []
    symbolList = sorted( symbols.keys(), key=lambda x: ( symbols[x]['type'], x ) )

    # quicklinks
    constructors = ''
    properties = ''
    getterssetters = ''
    functions = ''
    static = ''


    for s in symbolList:

      jsdoc = symbols[s]['doc']
      public = symbols[s]['public']

      privacy = 'private'
      if public:
        # this is a public symbol
        content += '<div class="public" id="' + s + '">\n'
        privacy = 'public'
        hasPublic = True
      else:
        # this is a private symbol
        content += '<div class="private" id="' + s + '">\n'

      for symb in allclasses:

        jsdoc = jsdoc.replace( NAMESPACE + '.' + symb, '<a href="' + symb + '.html">' + NAMESPACE + '.' + symb + '</a>' )

      content += '<pre>' + jsdoc + '</pre>' + '\n'

      identifier = s
      #prefix = NAMESPACE + '.'
      identifierCode = identifier

      # check different types
      if symbols[s]['type'] == TYPES['constructor']:
        identifierCode = 'var ' + classname[0] + ' = new <span class="identifier">' + NAMESPACE + '.' + identifier + '()</span>;'

        constructors += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + NAMESPACE + '.' + identifier + '</a><br></span>'

      elif symbols[s]['type'] == TYPES['static']:
        _returnVar = ''
        if symbols[s]['returns']:
          _returnVar = 'var ' + identifier + ' = ';

        identifierCode = _returnVar + NAMESPACE + '.' + classname + '.<span class="identifier">' + identifier + '</span>(' + ', '.join( map( str.upper, symbols[s]['params'] ) ) + ');';

        static += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

      elif symbols[s]['type'] == TYPES['function']:

        _returnVar = ''
        if symbols[s]['returns']:
          _returnVar = 'var ' + identifier + ' = ';

        identifierCode = _returnVar + classname[0] + '.<span class="identifier">' + identifier + '</span>(' + ', '.join( map( str.upper, symbols[s]['params'] ) ) + ');';

        functions += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

      elif symbols[s]['type'] == TYPES['gettersetter'] and s.find( '_get' ) != -1:
        identifierCode = 'var _' + identifier + ' = ' + classname[0] + '.<span class="identifier">' + identifier + '</span>;'

        getterssetters += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier.replace( '_get', '' ).replace( '_set', '' ) + '</a><br></span>'

      elif symbols[s]['type'] == TYPES['gettersetter'] and s.find( '_set' ) != -1:
        identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = ' + map( str.upper, symbols[s]['params'] )[0] + ';';

      elif symbols[s]['type'] == TYPES['property']:
        identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = $' + identifier.upper() + ';';

        properties += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

      identifierCode = identifierCode.replace( '_get', '' ).replace( '_set', '' )

      content += '<span class="code">' + identifierCode + '</span><br>'
      content += '</div>'

    # modify template
    output = output.replace( '${TITLE}', title )
    output = output.replace( '${CLASSNAME}', NAMESPACE + '.' + classname )
    output = output.replace( '${SOURCELINK}', REPO_URL + f )

    diagram = inheritanceChart( classname )
    output = output.replace( '${DIAGRAM}', diagram )

    # right menu
    output = output.replace( '${CONSTRUCTORS}', constructors )
    output = output.replace( '${PROPERTIES}', properties )
    output = output.replace( '${GETTERSSETTERS}', getterssetters )
    output = output.replace( '${FUNCTIONS}', functions )
    output = output.replace( '${STATIC}', static )


    output = output.replace( '${MENU}', leftMenuContent )

    # print note if this class has nothing public
    if not hasPublic:
      content = '<i>This class has no public members.</i><br><br>' + content

    output = output.replace( '${CONTENT}', content )

    with open( outputDir + os.sep + c + '.html', 'w' ) as outputf:

      outputf.write( output )


# create index.html

# load the template
with open( 'xdoc.html', 'r' ) as t:
  output = t.read()

# modify template
output = output.replace( '${TITLE}', title )
output = output.replace( '${CLASSNAME}', '' )
output = output.replace( '${SOURCELINK}', REPO_URL )

diagram = inheritanceChart( classname )
output = output.replace( '${DIAGRAM}', '' )

# right menu
output = output.replace( '${CONSTRUCTORS}', '' )
output = output.replace( '${PROPERTIES}', '' )
output = output.replace( '${GETTERSSETTERS}', '' )
output = output.replace( '${FUNCTIONS}', '' )
output = output.replace( '${STATIC}', '' )

output = output.replace( '${MENU}', leftMenuContent )

content = '<center><br><br><br><br><img src="xdoc.png"><br><br>'
content += 'XTK is a WebGL framework providing an easy-to-use API to visualize scientific data on the web.<br>No background or knowledge in Computer Graphics is required.<br><br><a href="http://goXTK.com" target="_blank">http://goXTK.com</a></center>'

output = output.replace( '${CONTENT}', content )

with open( outputDir + os.sep + 'index.html', 'w' ) as outputf:

  outputf.write( output )


print 'Total Symbols Documented:', totalSymbols

#d = ''
#for x in inheritances:
#  d += inheritanceChart( x )
#print d
