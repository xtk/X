# imports
import os, sys
from socket import getfqdn
# WRITE XML
from xml.dom import minidom
# GET DATE
import datetime
from time import time, gmtime, strftime
#from cElementTree.SimpleXMLWriter import XMLWriter
import string

# xtk-utils dir
def calculate( buildtype, filename, buildtime ):
  # if no tests don't try to parse the file
  if(os.path.exists('xtk_build.log') == False): return

  xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

  f = open( xtkUtilsDir + os.sep + filename, 'r' );
  f1 = open( xtkUtilsDir + os.sep + filename, 'r' );

  count = 0
  data = f.readlines()

  xml = minidom.Document()

  system_info = os.uname()

  siteElement = xml.createElement( 'Site' )
  systeminfo = os.uname()
  siteElement.setAttribute( 'BuildName', system_info[0] + '-' + system_info[2] )

  hostname = getfqdn()

  buildtype = buildtype
  buildstamp = buildtime + '-' + buildtype
  siteElement.setAttribute( 'BuildStamp', buildstamp )
  siteElement.setAttribute( 'Name', hostname )
  siteElement.setAttribute( 'Hostname', hostname )

  xml.appendChild( siteElement )


  buildElement = xml.createElement( 'Build' )
  siteElement.appendChild( buildElement )

  f1.readline();
  f1.readline();
  f1.readline();

  fillxml( xml, buildElement, 'StartDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, buildElement, 'StartBuildTime', str( time() ) )
  # to correct
  fillxml( xml, buildElement, 'BuildCommand', 'this is a build command' )
  fillxml( xml, buildElement, 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, buildElement, 'EndBuildTime', str( time() ) )
  # to correct
  fillxml( xml, buildElement, 'ElapsedMinutes', '0' )

  parsefile( f1, count, len( data ) - 14, buildElement, xml )

  f2 = open( 'XTKBuild.xml', 'w' )
  f2.write( xml.toxml() )
  f2.close()

# read first builded file, then create method to loop
#for line in f:
#        print line,
def parsefile( f, count, numberoflines, buildElement, xml ):
  #base case
  if( count >= numberoflines ):
    return

  f.readline();
  f.readline()
  f.readline();
  count += 3

  #build command
  line = f.readline()
  count += 1

  #succeed or warnings!
  successline = f.readline()
  success = successline.find( "succeeded" )
  count += 1

  if ( success < 0 ) :
    while ( successline.find( "error(s)" ) < 0 ) :
      print successline
      warning = successline.find( 'WARNING' )
      error1 = successline.find( 'ERROR' )
      googclosurewarning = successline.find( "closure-library/closure/goog" )

      if( warning > 0 or error1 > 0 ):
        if( googclosurewarning <= 0 ):
          error = successline
          if( warning > 0 ):
            errorElement = xml.createElement( 'Warning' )
          else:
            errorElement = xml.createElement( 'Error' )
          buildElement.appendChild( errorElement )

          fillxml( xml, errorElement, 'BuildLogLine', str( count ) )
          fillxml( xml, errorElement, 'Text', error )
          fillxml( xml, errorElement, 'SourceFile', error.split( ':' )[0] )
          fillxml( xml, errorElement, 'SourceLineNumber', error.split( ':' )[1].split( ':' )[0] )

        successline = f.readline()
        count += 1
        successline2 = f.readline()
        count += 1

        if( googclosurewarning <= 0 ):
          # how does it know "error element"?
          fillxml( xml, errorElement, 'PostContext', successline + '\n' + successline2 )

        successline = f.readline()
        count += 1

      successline = f.readline()
      count += 1

    successline = f.readline()
    count += 1

  #recursive call
  parsefile( f, count, numberoflines, buildElement, xml )

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )
