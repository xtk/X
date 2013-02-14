#
# The XBUILD documenter.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import sys
import subprocess
import shutil

import config
from _colors import Colors
from _jsfilefinder import JSFileFinder

#
#
#
class Documenter( object ):
  '''
  Generate HTML documentation for all classes in a project.
  '''
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
  NAMESPACE = config.NAMESPACE
  REPO_URL = config.REPOSITORY_URL
  TYPES = {'undefined':-1, 'constructor':0, 'static':5, 'function':3, 'gettersetter':2, 'property':1}
  PRIVACY = {'private':0, 'public':1}

  def __init__( self ):
    '''
    '''
    # create global dictionaries to track all files, classes and symbols

    self.__totalSymbols = 0

    self.__files = {}
    self.__allclasses = []  # we only need a list here
    self.__inheritances = {}
    self.__exportations = {}

    self.__leftMenu = {}


  def run( self, options=None ):
    '''
    Performs the action.
    '''
    print 'Documenting ' + config.SOFTWARE_SHORT + '...'

    if options.remove:
      # remove old documentation, if requested
      print Colors.ORANGE + 'Removing existing documentation.. ' + Colors.PURPLE + 'Done!' + Colors._CLEAR
      shutil.rmtree( config.DOC_OUTPUT_PATH )

    if os.path.exists( config.DOC_OUTPUT_PATH ):
      # output folder exists, we can not continue
      print Colors.RED + 'Output folder ' + Colors.CYAN + config.DOC_OUTPUT_PATH + Colors.RED + ' exists.' + Colors._CLEAR
      print Colors.ORANGE + 'Try the ' + Colors.RED + '-r' + Colors.ORANGE + ' option to remove any existing documentation.'
      sys.exit( 2 )

    # lookup the symbols
    self.findSymbols()
    # write the documentation to disk
    self.createContent()

    # all done
    print Colors.CYAN + 'Total Symbols Documented: ' + str( self.__totalSymbols ) + Colors._CLEAR
    print Colors.ORANGE + 'Documentation written to ' + Colors.PURPLE + config.DOC_OUTPUT_PATH + Colors.ORANGE + '!' + Colors._CLEAR


  def findSymbols( self ):
    '''
    Find and lookup symbols including inheritance relations.
    '''

    # grab all js files
    filefinder = JSFileFinder()
    jsfiles = filefinder.run()


    #    jsfiles = ['/chb/users/daniel.haehn/Projects/X/math/matrix.js']

    # .. and loop through them
    for filename in jsfiles:

      # classes for this file
      classes = {}

      with open( filename, 'r' ) as f:

        # read the whole file
        lines = f.readlines()

      # state switches
      jsdocActive = False
      queryIdentifier = False
      jsdocBuffer = ''

      # class information (use the filename by default)
      classname = os.path.splitext( os.path.split( filename )[1] )[0]
      inherits = []
      exports = []

      # symbol information
      type = self.TYPES['undefined']
      privacy = self.PRIVACY['private']  # by default private
      params = []  # store the parameters of functions
      returns = []  # and if the function has a return value

      # forward loop through file
      for line in lines:

        line = line.strip()
        if line:
          # ignore blank lines

          # check for GOOGEXPORT
          if line[0:len( self.GOOGEXPORT )] == self.GOOGEXPORT:
            exports.append( line[len( self.GOOGEXPORT ):].split( ',' )[0].strip( "'" ).split( '.' )[-1] )
            continue

          # check for JSDOC
          if line[0:len( self.JSDOCSTART )] == self.JSDOCSTART:
            # found start of JSDOC
            jsdocBuffer += line[0:len( self.JSDOCSTART )]
            jsdocActive = True
            continue

          if jsdocActive:
            # this is part of the JSDOC

            # remove possible <pre></pre> tags since we don't use them
            jsdocBuffer += '\n' + line.replace( '<pre>', '' ).replace( '</pre>', '' )

            #
            # check for special jsdoc tags inside the comments
            #

            # @param
            param = line.find( self.PARAMJSDOC )
            if param != -1:
              paramName = line[param + len( self.PARAMJSDOC ):].strip().split( ' ' )[1]
              params.append( '$' + paramName )

            # @return
            return_ = line.find( self.RETURNJSDOC )
            if return_ != -1:
              returns.append( True )

            # @extends
            extends = line.find( self.EXTENDSJSDOC )
            if extends != -1:
              inheritsClass = line[extends + len( self.EXTENDSJSDOC ):].strip()

              # strip the namespace
              inheritsClass = inheritsClass.replace( self.NAMESPACE + '.', '' )

              inherits.append( inheritsClass )

            # @mixin
            mixin = line.find( self.MIXINJSDOC )
            if mixin != -1:
              inheritsClass = line[mixin + len( self.MIXINJSDOC ):].strip()

              # strip the namespace
              inheritsClass = inheritsClass.replace( self.NAMESPACE + '.', '' )

              inherits.append( inheritsClass )

          if jsdocActive and line[0:len( self.JSDOCEND )] == self.JSDOCEND:
            # end of JSDOC
            jsdocActive = False
            queryIdentifier = True
            continue

          if queryIdentifier:
            # store the Identifier and the corresponding JSDOC

            identifier = line.split( ' ' )[0]  # split by blank
            identifierSplitted = identifier.split( '.' )  # split by dot
            # classname = identifierSplitted[1] # should always be the classname
            identifier = identifierSplitted[-1]

            # check for namespace
            if line[0] != self.NAMESPACE:

              # check if this is a public property
              if line[0:4] == self.THIS:

                # check if the property has a constant name aka. is defined with a string
                if line[4:6] == "['" or line[4:6] == '["':
                  # this is a public property property
                  privacy = 1
                  # todo set correct identifier

                type = self.TYPES['property']

              else:
                # no namespace so we reset the buffer
                jsdocBuffer = ''
                queryIdentifier = False
                continue

            elif identifierSplitted[-2] != self.PROTOTYPE:

              # static method or constructor
              if jsdocBuffer.find( self.CONSTRUCTORJSDOC ) != -1:
                # this is a constructor
                type = self.TYPES['constructor']
                classname = identifier

                # check if we have parent classes, then update the inheritance table
                if len( inherits ) > 0:
                  # add to inheritances
                  if not self.__inheritances.has_key( classname ):
                    self.__inheritances[classname] = []

                  self.__inheritances[classname].extend( inherits )
                  inherits = []  # reset the inheritances

                # always add to classes
                self.__allclasses.append( classname )

              else:
                # this is a static method
                type = self.TYPES['static']

            else:
              # a prototype method
              type = self.TYPES['function']

              # check for getters/setters
              if identifier[0:len( self.DEFINEGETTER )] == self.DEFINEGETTER:
                # a getter
                identifier = identifier[len( self.DEFINEGETTER ):].split( "'" )[1] + '_get'
                type = self.TYPES['gettersetter']
                privacy = self.PRIVACY['public']

              elif identifier[0:len( self.DEFINESETTER )] == self.DEFINESETTER:
                # a setter
                identifier = identifier[len( self.DEFINESETTER ):].split( "'" )[1] + '_set'
                type = self.TYPES['gettersetter']
                privacy = self.PRIVACY['public']

            if not classes.has_key( classname ):
              # no symbols for this class yet
              classes[classname] = {}

            # grab the subfolder name
            subfolder = os.path.dirname( filename ).split( os.sep )[-1]

            # ignore toplevel files and also the NAMESPACE declaration
            if not subfolder == '..' and not classname == self.NAMESPACE:

              # check if we have already files from this subfolder
              if not self.__leftMenu.has_key( subfolder ):
                self.__leftMenu[subfolder] = []

              # add this file if it does not exist
              if self.__leftMenu[subfolder].count( classname ) == 0:
                self.__leftMenu[subfolder].append( classname )

            # add the current symbol
            classes[classname][identifier] = {'public':privacy, 'type':type, 'doc':jsdocBuffer, 'params':params, 'returns':returns}

            self.__totalSymbols += 1

            # clear the buffer and all other symbol specific data
            jsdocBuffer = ''
            type = -1
            privacy = 0
            returns = []
            params = []
            # clear the state switches
            queryIdentifier = False

      # add to files
      # filename = os.path.basename( filename )
      self.__files[filename] = classes
      self.__exportations[classname] = exports

      #
      # mark all exported symbols automatically as public
      #
      for c in classes.keys():
        # check all detected classes
        self.__updatePrivacy( c )

    #
    # now all files have been parsed
    #

    # map symbols along the inheritance tree
    for i in self.__inheritances:
      self.inherit( i )



  def createContent( self ):
    '''
    Create the HTML content and write the output files. 
    '''

    # create the output folder
    os.mkdir( config.DOC_OUTPUT_PATH )

    # copy templates over
    shutil.copy( os.path.join( config.DOC_TEMPLATES_PATH, 'doc.css' ), config.DOC_OUTPUT_PATH )
    shutil.copy( os.path.join( config.DOC_TEMPLATES_PATH, 'doc.png' ), config.DOC_OUTPUT_PATH )

    # path to the html template file
    templateFile = os.path.join( config.DOC_TEMPLATES_PATH, 'doc.html' )

    #
    # create the left menu
    #
    leftMenuContent = ''
    for folder in sorted( self.__leftMenu.iterkeys() ):
      leftMenuContent += '<b>' + folder.upper() + '</b><br>'
      for classname in sorted( self.__leftMenu[folder], key=str.lower ):
        leftMenuContent += '<span class="menuitem"><a href="' + classname + '.html">' + self.NAMESPACE + '.' + classname + '</a></span><br>'
      leftMenuContent += '<br>'


    #
    # main content loop
    #
    for f in self.__files:

      for c in self.__files[f]:

        if not c:
          # skip empty classnames
          continue

        symbols = self.__files[f][c]

        # load the template
        with open( templateFile, 'r' ) as t:
          output = t.read()

        title = config.SOFTWARE + ' API'
        classname = c  # the classname
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

          for symb in self.__allclasses:

            jsdoc = jsdoc.replace( self.NAMESPACE + '.' + symb, '<a href="' + symb + '.html">' + self.NAMESPACE + '.' + symb + '</a>' )

          content += '<pre>' + jsdoc + '</pre>' + '\n'

          identifier = s
          # prefix = NAMESPACE + '.'
          identifierCode = identifier

          # check different types
          if symbols[s]['type'] == self.TYPES['constructor']:
            identifierCode = 'var ' + classname[0] + ' = new <span class="identifier">' + self.NAMESPACE + '.' + identifier + '()</span>;'

            constructors += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + self.NAMESPACE + '.' + identifier + '</a><br></span>'

          elif symbols[s]['type'] == self.TYPES['static']:
            _returnVar = ''
            if symbols[s]['returns']:
              _returnVar = 'var ' + identifier + ' = ';

            identifierCode = _returnVar + self.NAMESPACE + '.' + classname + '.<span class="identifier">' + identifier + '</span>(' + ', '.join( map( str.upper, symbols[s]['params'] ) ) + ');';

            static += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

          elif symbols[s]['type'] == self.TYPES['function']:

            _returnVar = ''
            if symbols[s]['returns']:
              _returnVar = 'var ' + identifier + ' = ';

            identifierCode = _returnVar + classname[0] + '.<span class="identifier">' + identifier + '</span>(' + ', '.join( map( str.upper, symbols[s]['params'] ) ) + ');';

            functions += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

          elif symbols[s]['type'] == self.TYPES['gettersetter'] and s.find( '_get' ) != -1:
            identifierCode = 'var _' + identifier + ' = ' + classname[0] + '.<span class="identifier">' + identifier + '</span>;'

            getterssetters += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier.replace( '_get', '' ).replace( '_set', '' ) + '</a><br></span>'

          elif symbols[s]['type'] == self.TYPES['gettersetter'] and s.find( '_set' ) != -1:
            identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = ' + map( str.upper, symbols[s]['params'] )[0] + ';';

          elif symbols[s]['type'] == self.TYPES['property']:
            identifierCode = classname[0] + '.<span class="identifier">' + identifier + '</span> = $' + identifier.upper() + ';';

            properties += '<span class="' + privacy + '_quicklink"><a href="#' + s + '">' + identifier + '</a><br></span>'

          identifierCode = identifierCode.replace( '_get', '' ).replace( '_set', '' )

          content += '<span class="code">' + identifierCode + '</span><br>'
          content += '</div>'

        # modify template
        output = output.replace( '${TITLE}', title )
        output = output.replace( '${CLASSNAME}', self.NAMESPACE + '.' + classname )
        output = output.replace( '${SOURCELINK}', self.REPO_URL + os.path.relpath( f, config.SOFTWARE_PATH ) )

        diagram = self.inheritanceChart( classname )
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

        with open( os.path.join( config.DOC_OUTPUT_PATH, c + '.html' ), 'w' ) as outputf:

          outputf.write( output )


    # create index.html

    # load the template
    with open( templateFile, 'r' ) as t:
      output = t.read()

    # modify template
    output = output.replace( '${TITLE}', title )
    output = output.replace( '${CLASSNAME}', '' )
    output = output.replace( '${SOURCELINK}', self.REPO_URL )

    diagram = self.inheritanceChart( classname )
    output = output.replace( '${DIAGRAM}', '' )

    # right menu
    output = output.replace( '${CONSTRUCTORS}', '' )
    output = output.replace( '${PROPERTIES}', '' )
    output = output.replace( '${GETTERSSETTERS}', '' )
    output = output.replace( '${FUNCTIONS}', '' )
    output = output.replace( '${STATIC}', '' )

    output = output.replace( '${MENU}', leftMenuContent )

    content = '<center><br><br><br><br><img src="doc.png"><br><br>'
    content += config.SOFTWARE_DESCRIPTION + '<br><br><a href="' + config.SOFTWARE_HOMEPAGE + '" target="_blank">' + config.SOFTWARE_HOMEPAGE + '</a></center>'

    output = output.replace( '${CONTENT}', content )

    with open( os.path.join( config.DOC_OUTPUT_PATH, 'index.html' ), 'w' ) as outputf:

      outputf.write( output )


  def __findClass( self, classname ):
    '''
    Find a class with the given name.
    '''
    for f in self.__files:
      if self.__files[f].has_key( classname ):

        return self.__files[f][classname]


  def __updatePrivacy( self, classname ):
    '''
    Mark all exported symbols of a class as public.
    '''
    objectclass = self.__findClass ( classname )

    if self.__exportations.has_key( classname ):
      for e in self.__exportations[classname]:

        for s in objectclass.keys():

          if e == s:
            # this is an exported symbol, mark it as public
            objectclass[s]['public'] = 1


  def __inheritSymbols( self, classname1, classname2 ):
    '''
    Inherit symbols from classname2 to classname1.
    '''
    dic1 = self.__findClass( classname1 )
    dic2 = self.__findClass( classname2 )

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


  def inherit( self, classname, level=0 ):
    '''
    Recursively inherit symbols for a classname according to the inheritance table.
    '''
    if self.__inheritances.has_key( classname ):

      for i in self.__inheritances[classname]:

        # start recursion
        self.inherit( i, level + 1 )

        self.__inheritSymbols( classname, i )
        self.__updatePrivacy( classname )


  def inheritanceChart( self, classname, level=0 ):
    '''
    Creates a list for the Google Charts API to plot a inheritance diagram for a given classname.
    '''
    output = ""

    # attach namespace
    classnameString = classname
    if classname.find( '.' ) == -1:
      classnameString = self.NAMESPACE + '.' + classname

    if self.__inheritances.has_key( classname ):

      for i in self.__inheritances[classname]:

        # start recursion
        output += self.inheritanceChart( i, level + 1 )

        # attach namespace
        iString = i
        if i.find( '.' ) == -1:
          iString = self.NAMESPACE + '.' + i

        output += '["' + classnameString + '","' + iString + '",' + 'null],\n'

    else:

      output += '[{v:"' + classnameString + '",f:"<font color=green>' + classnameString + '</font>"},null,null],\n'

    return output
