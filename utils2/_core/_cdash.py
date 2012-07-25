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
import config

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
    el.appendChild( self.__xml.createTextNode( str( value ) ) )
    return el


  def run( self, options=None ):
    '''
    options
      [type, log]
    '''
    # create the CDash XML elements

    # .. the <Site> element
    siteElement = self.createSiteElement()

    # .. the nested element of a certain type
    nestedElement = self.createNestedElement( options[0] )

    if options[0] == 'Build':
      nestedElement = self.fillBuildElement( nestedElement, options[1] )
    elif options[0] == 'Testing':
      nestedElement = self.fillTestingElement( nestedElement, options[1] )

    # now attach the nested element to the site element
    siteElement.appendChild( nestedElement )

    # and attach the site element to the xml document
    self.__xml.appendChild( siteElement )

    return self.__xml.toxml()


  def submit( self, _data, type='Experimental' ):
    '''
    Submit data to CDash via HTTP PUT.
    '''

    # set the ${BUILDTYPE} in _data
    _data = _data.replace( '${BUILDTYPE}', type )

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
      sys.exit( 2 )


  def fillBuildElement( self, buildElement, log ):
    '''
    Checks for build warnings or errors in the error log and creates the proper XML elements.
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
        element = xml.createElement( 'Error' )

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


  def fillTestingElement( self, testingElement, tests ):
    '''
    Parses tests and creates the proper XML elements.
    
    'tests' is a list in this format:
    
     [
     
      # The name, Passed/Failed, Testlog, Execution Time [ms], ResultImage, BaselineImage
      ['Testname 1', 'passed', 'Testlog\n\nDone', 200, None, None],
      ['Testname 2', 'failed', 'Testlog\n\nblabla', 5599, None, None]
     
     ]
    '''
    xml = self.__xml

    # create the test list
    test_list_element = xml.createElement( 'TestList' )

    # create entries for each test
    for t in tests:

      test_name = t[0]
      test_status = t[1]
      test_log = t[2]
      test_execution_time = t[3]
      test_result_image = t[4]
      test_baseline_image = t[5]


      # now parse each test
      test_element = xml.createElement( 'Test' )

      # passed/failed
      test_element.setAttribute( 'Status', test_status )

      # name      
      test_element.appendChild( self.createXMLNode( 'Name', test_name ) )

      # results

      # first the test log
      results_element = xml.createElement( 'Results' )
      log_element = xml.createElement( 'Measurement' )
      log_element.appendChild( self.createXMLNode( 'Value', test_log ) )

      results_element.appendChild( log_element )

      # then the execution time
      execution_time_element = xml.createElement( 'NamedMeasurement' )
      execution_time_element.setAttribute( 'name', 'Execution Time' )
      execution_time_element.setAttribute( 'type', 'numeric/double' )
      execution_time_element.appendChild( self.createXMLNode( 'Value', test_execution_time ) )

      results_element.appendChild( execution_time_element )

      # TODO images

      accurate_time_element = xml.createElement( 'NamedMeasurement' )
      accurate_time_element.setAttribute( 'name', 'Accurate Execution Time' )
      accurate_time_element.setAttribute( 'type', 'text/string' )
      accurate_time_element.appendChild( self.createXMLNode( 'Value', test_execution_time ) )

      # .. append the results
      test_element.appendChild( results_element )

      # .. add it to 'Testing'
      testingElement.appendChild( test_element )

      # .. add to the overall list
      test_list_element.appendChild( self.createXMLNode( 'Test', test_name ) )

    testingElement.appendChild( test_list_element )

    return testingElement


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
    siteElement.setAttribute( 'BuildStamp', buildtime + '-${BUILDTYPE}' )
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
    # <EndDateTime>
    nestedElement.appendChild( self.createXMLNode( 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) ) )

    if type == 'Build':
      #
      # <StartBuildTime>
      nestedElement.appendChild( self.createXMLNode( 'StartBuildTime', str ( time() ) ) )

      #
      # <BuildCommand>
      nestedElement.appendChild( self.createXMLNode( 'BuildCommand', ' '.join( sys.argv ) ) )

      #
      # <EndBuildTime>
      nestedElement.appendChild( self.createXMLNode( 'EndBuildTime', str ( time() ) ) )

    if type == 'Testing':
      #
      # <StartTestTime>
      nestedElement.appendChild( self.createXMLNode( 'StartTestTime', str ( time() ) ) )

      #
      # <EndTestTime>
      nestedElement.appendChild( self.createXMLNode( 'EndTestTime', str ( time() ) ) )

    #
    # <ElapsedMinutes>
    nestedElement.appendChild( self.createXMLNode( 'ElapsedMinutes', '0' ) )

    return nestedElement
