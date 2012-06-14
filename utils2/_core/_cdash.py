#
# The XBUILD CDash XML Generator.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import hashlib
import os
import sys
from socket import getfqdn
from xml.dom import minidom
from datetime import datetime
from time import time, gmtime, strftime

import _colors

#
#
#
class CDash( object ):
  '''
  '''

  def __init__( self ):
    '''
    '''
    # create a new xml structure
    self.__xml = minidom.Document()


  def createXMLNode( self, name, value ):
    '''
    Returns an xml node with the given name, containing the given value
    '''
    el = self.__xml.createElement( name )
    el.appendChild( self.__xml.createTextNode( value ) )
    return el


  def run( self, options=None ):
    '''
    options
      ['type', log]
    '''
    # create the CDash XML elements

    # .. the <Site> element
    siteElement = self.createSiteElement()

    # .. the nested element of a certain type
    nestedElement = self.createNestedElement( options[0] )

    if options[0] == 'Build':
      nestedElement = self.fillBuildElement( nestedElement, options[1] )

    # now attach the nested element to the site element
    siteElement.appendChild( nestedElement )

    # and attach the site element to the xml document
    self.__xml.appendChild( siteElement )

    self.submit( self.__xml.toxml() )


  def submit( self, _data ):
    '''
    Submit data to CDash via HTTP PUT.
    '''

    # md5 hash the _data
    md5 = hashlib.md5( _data ).hexdigest()

    import urllib2
    opener = urllib2.build_opener( urllib2.HTTPHandler )
    request = urllib2.Request( config.CDASH_SUBMIT_URL + '&MD5=' + md5, data=_data )
    request.get_method = lambda: 'PUT'
    url = opener.open( request )
    response = url.read()

    # check if the submission was successful
    if response.find( '<status>OK</status>' ) == -1:
      print Colors.RED + 'Error: Could not upload to CDash.' + Colors._CLEAR


  def fillBuildElement( self, buildElement, log ):
    '''
    Checks for build warnings or errors and creates the proper elements.
    '''

    xml = self.__xml

    for i, l in enumerate( log ):

      if l.find( 'WARNING' ) != -1:

        #
        # create <Warning>
        #
        element = xml.createElement( 'Warning' )

      elif l.find( 'ERROR' ) != -1:

        #
        # create <Error>
        #
        element = xml.createElement( 'Warning' )

      else:
        # no error or warning here
        continue

      # fill the element

      # the build log line number
      element.appendChild( self.createXMLNode( 'BuildLogLine', str( i ) ) )

      # the text
      element.appendChild( self.createXMLNode( 'Text', l ) )

      # the source file
      element.appendChild( self.createXMLNode( 'SourceFile', l.split( ':' )[0] ) )

      # the source line number
      element.appendChild( self.createXMLNode( 'SourceLineNumber', l.split( ':' )[1].split( ':' )[0] ) )

      # and append it to the <Build> element
      buildElement.appendChild( element )

    return buildElement


  def createSiteElement( self ):
    '''
    Creates the top level CDash Site Element.
    
    Returns the <Site> element.
    '''

    # grab the current xml structure
    xml = self.__xml

    #
    # create <Site>
    #

    # grab the system information
    os_platform = os.uname()[0]
    os_version = os.uname()[2]
    hostname = getfqdn()

    # grab the current buildtime
    buildtime = datetime.now().strftime( "%Y%m%d-%H%M" )

    siteElement = xml.createElement( 'Site' )
    # .. and the attributes for it
    siteElement.setAttribute( 'BuildName', os_platform + '-' + os_version )
    siteElement.setAttribute( 'BuildStamp', buildtime + '-Nightly' )
    siteElement.setAttribute( 'Hostname', hostname )
    siteElement.setAttribute( 'Name', hostname )

    return siteElement


  def createNestedElement( self, type ):
    '''
    Creates a nested element of a certain type.
    
    Returns the nested element.    
    '''

    xml = self.__xml

    #
    # create <Build> or <Testing> or <Coverage>
    #
    nestedElement = xml.createElement( type )

    #
    # <StartDateTime>
    nestedElement.appendChild( self.createXMLNode( 'StartDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) ) )

    #
    # <StartBuildTime>
    nestedElement.appendChild( self.createXMLNode( 'StartBuildTime', str ( time() ) ) )

    #
    # <BuildCommand>
    nestedElement.appendChild( self.createXMLNode( 'BuildCommand', ' '.join( sys.argv ) ) )

    #
    # <EndDateTime>
    nestedElement.appendChild( self.createXMLNode( 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) ) )

    #
    # <EndBuildTime>
    nestedElement.appendChild( self.createXMLNode( 'EndBuildTime', str ( time() ) ) )

    #
    # <ElapsedMinutes>
    nestedElement.appendChild( self.createXMLNode( 'ElapsedMinutes', '0' ) )

    return nestedElement
