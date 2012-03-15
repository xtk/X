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
  xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

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

  # if no tests don't try to parse the file
  if(os.path.exists('xtk_test.log') == False): return

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

    starttime = start.split(' ')[0];

    nexttest = f3.readline();
    count3 += 2;

    # loop through tests
    while(nexttest.find('Done') < 0):
      # get name
      name = nexttest.split(' ');
      fillxml( xml, testListElement, 'Test', browser +'- '+ name[2])

      endtime = name[0]

      # write content of error message if any
      element = xml.createElement( 'Test' )
      testingElement.appendChild( element )
         
      if(nexttest.find('FAILED') < 0):
        element.setAttribute('Status', 'passed')
        fillxml( xml, element, 'Name', browser +'- '+ name[2])
        
        resultsElement = xml.createElement( 'Results' )
        element.appendChild( resultsElement )
          
        nexttest = f3.readline();
        
        count3 += 1;
        
      else:
        element.setAttribute('Status', 'failed')
        fillxml( xml, element, 'Name', browser + '- ' + name[2])
        nexttest = f3.readline();
        error = ''
        error1 = 'still some log for the error'
        
        while(error1 != '\n'):
          error1 = f3.readline();
          error += error1;
          count3 += 1;
 
        resultsElement = xml.createElement( 'Results' )
        element.appendChild( resultsElement )

        measurementElement = xml.createElement( 'Measurement' )
        resultsElement.appendChild( measurementElement )
        
        fillxml(xml, measurementElement, 'Value', error)

        nexttest = f3.readline();
        count3 += 2;


      # time
      namedmeasurementElement = xml.createElement( 'NamedMeasurement' )
      resultsElement.appendChild( namedmeasurementElement )
        
      year = datetime.date.today().year
      month = datetime.date.today().month
      day = datetime.date.today().day
      enddatetime = datetime.datetime(int(year), int(month), int(day), int(endtime[0:2]), int(endtime[3:5]), int(endtime[6:8]), 1000*int(endtime[9:12]))
      startdatetime = datetime.datetime(int(year), int(month), int(day), int(starttime[0:2]), int(starttime[3:5]), int(starttime[6:8]), 1000*int(starttime[9:12]))

      namedmeasurementElement.setAttribute('name', 'Execution Time')

      fillxml(xml, namedmeasurementElement, 'Value', str(enddatetime - startdatetime))

      starttime = endtime;

      # command

  else:
    print 'browser not found'
  # recursive call - should write error message in tests results
  f3.readline();
  count3 += 1
  parsefile2( f3, count3, numberoflines, testingElement, testListElement, xml )

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )
