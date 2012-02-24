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
def calculate( buildtype, filename ):
  xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

  xml = minidom.Document()

  system_info = os.uname()

  siteElement = xml.createElement( 'Site' )
  systeminfo = os.uname()
  siteElement.setAttribute( 'BuildName', system_info[0] + '-' + system_info[2] )

  hostname = getfqdn()

  now = datetime.datetime.now()
  buildtime = str( now.year ) + str( now.month ) + str( now.day ) + "-" + str( now.minute ) + str( now.second )
  buildtype = buildtype
  buildstamp = buildtime + '-' + buildtype
  siteElement.setAttribute( 'BuildStamp', buildstamp )
  siteElement.setAttribute( 'Name', hostname )
  siteElement.setAttribute( 'Hostname', hostname )

  xml.appendChild( siteElement )

  f3 = open( 'xtk_test.log', 'r' );
  f4 = open( 'xtk_test.log', 'r' );
  count3 = 1;
  data3 = f4.readlines();

  testingElement = xml.createElement( 'Testing' )
  siteElement.appendChild( testingElement )


  fillxml( xml, testingElement, 'StartDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, testingElement, 'StartTestTime', str( time() ) )

  testListElement = xml.createElement('TestList');
  testingElement.appendChild(testListElement);

  parsefile2(f3, count3, len(data3), testingElement, testListElement, xml)

  fillxml( xml, testingElement, 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, testingElement, 'EndTestTime', str( time() ) )
  fillxml( xml, testingElement, 'ElapsedMinutes', '0' )

  f2 = open( 'XTKTest.xml', 'w' )
  f2.write( xml.toxml() )
  f2.close()

# read first builded file, then create method to loop
#for line in f:
#        print line,
def parsefile2( f3, count3, numberoflines, testingElement, testListElement, xml ):
  #base case
  if( count3 >= numberoflines ):
    return

  browser = string.capwords(f3.readline(), ' ');
  browserfound = string.capwords(f3.readline(), ' ');

  count3 +=2;

  if(browserfound.find(browser) < 0):
    f3.readline();
    f3.readline();
    f3.readline();
    f3.readline();
    f3.readline();
    count3 += 5;

    start = f3.readline();
    nexttest = f3.readline();
    count3 += 2;

    # loop through tests
    while(nexttest.find('Done') < 0):
      # get name
      name = nexttest.split(' ');
      fillxml( xml, testListElement, 'Test', name[2])
      
      # write content of error message if any
      element = xml.createElement( 'Test' )
      testingElement.appendChild( element )
         
      if(nexttest.find('FAILED') < 0):
        element.setAttribute('Status', 'passed')
        fillxml( xml, element, 'Name', name[2])
        count3 += 1;
        
      else:
        element.setAttribute('Status', 'failed')
        nexttest = f3.readline();
        nexttest = f3.readline();
        nexttest = f3.readline();
        nexttest = f3.readline();
        nexttest = f3.readline();
        count3 += 6;

      nexttest = f3.readline();
  else:
    print 'browser not found'
  # recursive call - should write error message in tests results
  parsefile2( f3, count3, numberoflines, testingElement, testListElement, xml )

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )
