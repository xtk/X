#
# The XBUILD CDash XML Generator.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import base64
import hashlib
import os
import platform
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
    # check if are running something against the build tree
    if len( options ) > 2:
      against_build = options[2]


    # create the CDash XML elements

    # .. the <Site> element
    siteElement = self.createSiteElement( against_build )

    # .. the nested element of a certain type
    nestedElement = self.createNestedElement( options[0] )

    if options[0] == 'Build':
      nestedElement = self.fillBuildElement( nestedElement, options[1] )
    elif options[0] == 'Testing':
      nestedElement = self.fillTestingElement( nestedElement, options[1] )
    elif options[0] == 'Coverage':
      nestedElement = self.fillCoverageElement( nestedElement, options[1] )
    elif options[0] == 'CoverageLog':
      nestedElement = self.fillCoverageLogElement( nestedElement, options[1] )

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
     
      # The name, Passed/Failed, Testlog, Execution Time [ms], ResultImage, BaselineImage, StartupTime [ms], FPS
      ['Testname 1', 'passed', 'Testlog\n\nDone', 200, None, None, 616, 57.7],
      ['Testname 2', 'failed', 'Testlog\n\nblabla', 5599, None, None, None]
     
     ]
    '''
    xml = self.__xml

    # create the test list
    test_list_element = xml.createElement( 'TestList' )

    for t in tests:
      # .. add to the overall list
      test_list_element.appendChild( self.createXMLNode( 'Test', t[0] ) )

    testingElement.appendChild( test_list_element )

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
      execution_time_element.setAttribute( 'name', 'Execution Time [s]' )
      execution_time_element.setAttribute( 'type', 'numeric/double' )
      execution_time_element.appendChild( self.createXMLNode( 'Value', test_execution_time ) )

      results_element.appendChild( execution_time_element )

      # then the result and baseline images, if there are any
      if t[4]:
        # convert to base64
        imageResultPath = t[4]
        imageResultBase64 = None
        with open( imageResultPath, "rb" ) as im1:
          imageResultBase64 = base64.b64encode( im1.read() )

        namedImageResultElement = xml.createElement( 'NamedMeasurement' )
        namedImageResultElement.setAttribute( 'type', 'image/png' )
        namedImageResultElement.setAttribute( 'name', 'Result Image' )
        namedImageResultElement.appendChild( self.createXMLNode( 'Value', str( imageResultBase64 ) ) )
        results_element.appendChild( namedImageResultElement )

      if t[5]:
        # convert to base64
        imageBaselinePath = t[5]
        imageBaselineBase64 = None
        with open( imageBaselinePath, "rb" ) as im2:
          imageBaselineBase64 = base64.b64encode( im2.read() )

        namedImageBaselineElement = xml.createElement( 'NamedMeasurement' )
        namedImageBaselineElement.setAttribute( 'type', 'image/png' )
        namedImageBaselineElement.setAttribute( 'name', 'Baseline Image' )
        namedImageBaselineElement.appendChild( self.createXMLNode( 'Value', str( imageBaselineBase64 ) ) )
        results_element.appendChild( namedImageBaselineElement )

      # if we have measurements for the startup time, add these
      if t[6]:
        startup_time_element = xml.createElement( 'NamedMeasurement' )
        startup_time_element.setAttribute( 'name', 'Start-up Time [s]' )
        startup_time_element.setAttribute( 'type', 'numeric/double' )
        startup_time_element.appendChild( self.createXMLNode( 'Value', str( float( t[6] ) / 1000.0 ) ) )
        results_element.appendChild( startup_time_element )

      # .. same for the FPS
      if t[7]:
        fps_element = xml.createElement( 'NamedMeasurement' )
        fps_element.setAttribute( 'name', 'FPS' )
        fps_element.setAttribute( 'type', 'numeric/double' )
        fps_element.appendChild( self.createXMLNode( 'Value', str( round( t[7], 1 ) ) ) )
        results_element.appendChild( fps_element )


      accurate_time_element = xml.createElement( 'NamedMeasurement' )
      accurate_time_element.setAttribute( 'name', 'Accurate Execution Time [s]' )
      accurate_time_element.setAttribute( 'type', 'text/string' )
      accurate_time_element.appendChild( self.createXMLNode( 'Value', test_execution_time ) )
      results_element.appendChild( accurate_time_element )

      # .. append the results
      test_element.appendChild( results_element )

      # .. add it to 'Testing'
      testingElement.appendChild( test_element )

    return testingElement

  def fillCoverageElement( self, coverageElement, cov_log ):
    '''
    Parses a coverage log and creates the proper XML elements.
    
    'cov_log' is a list in this format:
    
     [
     
      # filepath | lines_tested | lines_untested | percent_covered | lines
      ['/X.js', 10, 0, 100, lines],
      ['/X2.js', 21, 0, 100, lines],
     
     ]    

    # 
    # lines is a sublist, structured like this
    #  line_number | count (-1 for ignored) | code     
     
    '''
    xml = self.__xml

    total_lines_tested = 0
    total_lines_untested = 0
    total_lines = 0
    total_percentage = 0

    for c in cov_log:

      # add information for each file
      file_name = c[0]
      lines_tested = c[1]
      lines_untested = c[2]
      percentage = int( c[3] )

      # identification
      file_element = xml.createElement( 'File' )
      file_element.setAttribute( 'Name', os.path.split( file_name )[1] )
      file_element.setAttribute( 'FullPath', file_name )
      file_element.setAttribute( 'Covered', 'true' )

      # now the real values
      file_element.appendChild( self.createXMLNode( 'LOCTested', str( lines_tested ) ) )
      file_element.appendChild( self.createXMLNode( 'LOCUntested', str( lines_untested ) ) )
      file_element.appendChild( self.createXMLNode( 'PercentCoverage', str( percentage ) ) )

      # ..append this entry
      coverageElement.appendChild( file_element )

      # and update the total counters
      total_lines_tested += lines_tested
      total_lines_untested += lines_untested

    # and a summary for the whole submission
    total_lines = total_lines_tested + total_lines_untested
    total_percentage = ( total_lines_tested / total_lines ) * 100
    total_percentage = int( round( total_percentage ) )

    coverageElement.appendChild( self.createXMLNode( 'LOCTested', str( total_lines_tested ) ) )
    coverageElement.appendChild( self.createXMLNode( 'LOCUntested', str( total_lines_untested ) ) )
    coverageElement.appendChild( self.createXMLNode( 'LOC', str( total_lines ) ) )
    coverageElement.appendChild( self.createXMLNode( 'PercentCoverage', str( total_percentage ) ) )

    return coverageElement


  def fillCoverageLogElement( self, coverageLogElement, cov_log ):
    '''
    Parses a coverage log and creates the proper XML elements.
    
    'cov_log' is a list in this format:
    
     [
     
      # filepath | lines_tested | lines_untested | percent_covered | lines
      ['/X.js', 10, 0, 100, lines],
      ['/X2.js', 21, 0, 100, lines],
     
     ]    

    # 
    # lines is a sublist, structured like this
    #  line_number | count (-1 for ignored) | code     
     
    '''
    xml = self.__xml

    for c in cov_log:

      # add information for each file
      file_name = c[0]

      # identification
      file_element = xml.createElement( 'File' )
      file_element.setAttribute( 'Name', os.path.split( file_name )[1] )
      file_element.setAttribute( 'FullPath', file_name )

      # now for each LOC
      for l in c[4]:

        line_element = self.createXMLNode( 'Line', l[2] )
        line_element.setAttribute( 'Number', str( l[0] - 1 ) ) # there is the offset of 1
        line_element.setAttribute( 'Count', str( l[1] ) )

        file_element.appendChild( line_element )

      # ..append this entry
      coverageLogElement.appendChild( file_element )

    return coverageLogElement


  def createSiteElement( self, build ):
    '''
    Creates the top level CDash Site Element.
    
    Returns the <Site> element.
    '''

    # grab the current xml structure
    xml = self.__xml

    # check if we run against a build tree
    if build:
      type = 'build'
    else:
      type = 'dev'

    #
    # create <Site>
    #

    # grab the system information
    os_platform = platform.uname()[0]
    os_version = platform.uname()[2]
    hostname = getfqdn()

    # grab the current buildtime
    buildtime = datetime.now().strftime( "%Y%m%d-%H%M" )

    siteElement = xml.createElement( 'Site' )
    # .. and the attributes for it
    siteElement.setAttribute( 'BuildName', os_platform + '-' + os_version + '-' + type )
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
