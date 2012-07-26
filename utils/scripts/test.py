import time
import platform
import sys
import os
import tempfile
from datetime import datetime


import paths
sys.path.append( paths.xtkLibDir + '/EasyProcess/build/lib.linux-x86_64-2.7/' )
sys.path.append( paths.xtkLibDir + '/PyVirtualDisplay/build/lib.linux-x86_64-2.7/' )
sys.path.append( paths.xtkLibDir + '/pypng-0.0.9/code' )
sys.path.append( paths.xtkLibDir + os.sep + 'selenium' )

# virtual buffer to run tests on a virtual frame buffer!
from pyvirtualdisplay import Display

# selenium
import selenium
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains


def chromeDriverExecutable( xtkLibDir ):
  '''
  Find the chromedriver executable. If possible, use a bundled version else wise try to look in the path.
  '''
  chromedriverDir = xtkLibDir + os.sep + 'selenium' + os.sep + 'chromedrivers' + os.sep

  system = platform.system()

  # find the chromedriver executable
  chromedriverExecutable = 'chromedriver'

  if system == 'Darwin':
    chromedriverExecutable = chromedriverDir + 'chromedriver_mac'
  elif system == 'Windows':
    chromedriverExecutable = chromedriverDir + 'chromedriver_win.exe'
  elif system == 'Linux':
    is_64bits = sys.maxsize > 2 ** 32
    if is_64bits:
      chromedriverExecutable = chromedriverDir + 'chromedriver_linux64'
    else:
      chromedriverExecutable = chromedriverDir + 'chromedriver_linux32'

  return chromedriverExecutable


def calculate( xtkTestFile, xtkLibDir ):
  '''
  '''

  if os.path.exists( 'xtk_test.log' ): os.remove( 'xtk_test.log' )

  print

  print '======== GOOGLE CHROME RESULTS ========'
  browserString = 'chrome'
  #display = Display( visible=0, size=( 1024, 768 ) )
  #display.start()
  chrome_results = runTests( xtkTestFile, xtkLibDir, browserString )
  #display.stop()
  if chrome_results[0]:
    visualization_test_results = chrome_results[1]#testVisualization( xtkLibDir, browserString, xtkTestFile.find( 'build' ) != -1 )
    if visualization_test_results:
      # merge the outputs
      chrome_results_array = chrome_results[0].split( '\n' )
      chrome_results_array_without_done = chrome_results_array[0:-2]
      chrome_results_array_without_done.extend( visualization_test_results.split( '\n' ) )
      chrome_results = "\n".join( chrome_results_array_without_done )
    else:
      print 'Could not run visual tests!\n'
    print chrome_results
  else:
    print 'Could not run any ' + browserString + ' tests!'
  print

  a = """
  print '======== FIREFOX RESULTS ========'
  browserString = 'firefox'
  display = Display( visible=0, size=( 1024, 768 ) )
  display.start()
  firefox_results = runTests( xtkTestFile, xtkLibDir, browserString )
  display.stop()
  if firefox_results:
    visualization_test_results = testVisualization( xtkLibDir, browserString, xtkTestFile.find( 'build' ) != -1 )
    if visualization_test_results:
      # merge the outputs
      firefox_results_array = firefox_results.split( '\n' )
      firefox_results_array_without_done = firefox_results_array[0:-2]
      firefox_results_array_without_done.extend( visualization_test_results.split( '\n' ) )
      firefox_results = "\n".join( firefox_results_array_without_done )
    else:
      print 'Could not run visual tests!\n'
    print firefox_results
  else:
    print 'Could not run any ' + browserString + ' tests!'
  print
"""

  # write to logfile the results
  with open( "xtk_test.log", "a" ) as f:
    # chrome
    f.write( "chrome\n" )
    if not chrome_results:
      f.write( 'chrome not found\n' )
    else:
      f.write( chrome_results )

  return True
"""
    # firefox
    f.write( "\nfirefox\n" )
    if not firefox_results:
      f.write( 'firefox not found\n' )
    else:
      f.write( firefox_results )

  return True
"""

def getBrowser( xtkLibDir, browserString ):

  try:
    if browserString == 'chrome':
      # find the chrome browser
      chromedriverExecutable = chromeDriverExecutable( xtkLibDir )
      browser = webdriver.Chrome( chromedriverExecutable )
    elif browserString == 'firefox':
      # use firefox
      browser = webdriver.Firefox()

  except Exception as e:
    print 'Could not start ' + browserString
    print e.msg
    browser = None

  return browser

def coverageServer( xtkLibDir, action='start' ):

  system = platform.system()

  if system == 'Darwin':
    jsCoverageExecutable = xtkLibDir + os.sep + 'jscoverage/mac' + os.sep + 'jscoverage-server'
  elif system == 'Windows':
    jsCoverageExecutable = xtkLibDir + os.sep + 'jscoverage/windows' + os.sep + 'jscoverage-server'
  elif system == 'Linux':
    jsCoverageExecutable = xtkLibDir + os.sep + 'jscoverage/linux' + os.sep + 'jscoverage-server'

  if action == 'stop':
    # stop the server
    os.system( jsCoverageExecutable + " --shutdown" )
  else:
    # start the server
    xtkDir = xtkLibDir + os.sep + ".." + os.sep
    os.system( jsCoverageExecutable + " --document-root=" + xtkDir + " --no-instrument=/lib/ --no-instrument=/testing/ --no-instrument=/utils/ --no-instrument=/core/testing/ --no-instrument=/math/testing/ --no-instrument=xtk-deps.js &" )


def runTests( xtkTestFile, xtkLibDir, browserString ):

  print 'RUNNING OFFSCREEN TESTING..'

  browser = getBrowser( xtkLibDir, browserString )

  if not browser:
    return None

  if xtkTestFile.find( 'build' ) == -1:
    # this is against the DEV tree

    # start coverage server
    coverageServer( xtkLibDir )
    browser.get( "http://localhost:8080/jscoverage.html" )

    # now some selenium fun
    locationfield = browser.find_element_by_id( 'location' )
    locationfield.clear()

    # fill in url
    actions = ActionChains( browser )
    actions.click( locationfield )
    actions.send_keys( 'testing/xtk_tests.html' )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.RETURN )
    actions.perform()

    browser.switch_to_window( browser.window_handles[-1] )

    #browser.switch_to_frame( browser.find_elements_by_tag_name( "iframe" )[0] )

  else:
    # we don't need os.sep here since it's a url
    browser.get( "file://" + xtkTestFile )

  time.sleep( 3 )

  result_unit = browser.execute_script( 'return window.G_testRunner.getReport(true);' )

  time.sleep( 1 )
  browser.switch_to_window( browser.window_handles[0] )

  #browser.close()

  print 'RUNNING OFFSCREEN TESTING.. DONE!'

 # if xtkTestFile.find( 'build' ) == -1:
    # this is against the DEV tree

    # stop coverage server
    #coverageServer( xtkLibDir, 'stop' )

  #return result

#def testVisualization( xtkLibDir, browserString, againstBuild=False ):

  print 'RUNNING VISUAL TESTING..'

  #browser = getBrowser( xtkLibDir, browserString )

  if not browser:
    return None

  # list of tests
  tests = ['test_trk.html', 'test_vtk.html', 'test_nrrd.html', 'test_vr.html', 'test_labelmap.html', 'test_shapes.html', 'test_mgh.html', 'test_mgz.html', 'test_stl.html', 'test_binstl.html']

  #testURL = "file://" + xtkLibDir + "/../testing/visualization/"
  testURL = "testing/visualization/"
  baselineDir = os.path.abspath( xtkLibDir + "/../testing/visualization/baselines/" )

  # we test the visualization with a fixed window size
  browser.set_window_size( 800, 600 )

  output = ''

  # loop through the tests
  for t in tests:

    # open the test
    url = testURL + t
    #if againstBuild:
    #  url += '?build'

    #browser.get( testURL + t )
    browser.switch_to_default_content()


    # now some selenium fun
    locationfield = browser.find_element_by_id( 'location' )
    locationfield.clear()

    # fill in url
    actions = ActionChains( browser )
    actions.click( locationfield )
    actions.send_keys( url )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.RETURN )
    actions.perform()

    browser.switch_to_window( browser.window_handles[-1] )

    #browser.switch_to_frame( browser.find_elements_by_tag_name( "iframe" )[0] )

    # wait until loading fully completed
    timer = 0
    while not browser.execute_script( 'return test_renderer.loadingCompleted' ) and timer < 5:
      time.sleep( 1 ) # loading did not complete yet
      timer += 1
    time.sleep( 1 )

    # perform interaction tests, if we are using chrome
    if  browserString == 'chrome':
      canvas = browser.find_element_by_tag_name( 'canvas' )

      actions = ActionChains( browser )
      actions.click( canvas )

      #
      # keyboard events
      #

      # rotate      
      for i in range( 30 ):
        actions.send_keys( Keys.ARROW_RIGHT )
      for i in range( 30 ):
        actions.send_keys( Keys.ARROW_UP )
      for i in range( 30 ):
        actions.send_keys( Keys.ARROW_LEFT )
      for i in range( 30 ):
        actions.send_keys( Keys.ARROW_DOWN )

      # zoom
      for i in range( 50 ):
        actions.key_down( Keys.LEFT_ALT )
        actions.send_keys( Keys.ARROW_LEFT )

      for i in range( 25 ):
        actions.key_down( Keys.LEFT_ALT )
        actions.send_keys( Keys.ARROW_RIGHT )

      # pan
      actions.key_down( Keys.LEFT_SHIFT )
      actions.send_keys( Keys.ARROW_RIGHT, Keys.ARROW_RIGHT, Keys.ARROW_RIGHT )
      actions.key_down( Keys.LEFT_SHIFT )
      actions.send_keys( Keys.ARROW_LEFT, Keys.ARROW_LEFT, Keys.ARROW_LEFT )
      actions.key_down( Keys.LEFT_SHIFT )
      actions.send_keys( Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP )
      actions.key_down( Keys.LEFT_SHIFT )
      actions.send_keys( Keys.ARROW_DOWN, Keys.ARROW_DOWN )

      #
      # mouse
      #
      actions.click( canvas )

      # rotate
      for i in range( 30 ):
        actions.click_and_hold( None )
        actions.move_to_element_with_offset( canvas, 10, 0 );
        actions.release( canvas )
      for i in range( 30 ):
        actions.click_and_hold( None )
        actions.move_to_element_with_offset( canvas, 0, -10 );
        actions.release( canvas )

      # zoom      

      # pan
      for i in range( 10 ):
        actions.key_down( Keys.LEFT_SHIFT )
        actions.click_and_hold( None )
        actions.move_to_element_with_offset( canvas, 0, 10 );
        actions.release( canvas )

      actions.perform()



    # create a screenshot and save it to a temp. file
    testId = os.path.splitext( t )[0]
    testFileId = testId + '_' + browserString
    tmpfile = tempfile.mkstemp( suffix='.png', prefix='xtk_' + testFileId )[1]
    browser.save_screenshot( tmpfile )

    # baseline
    baseline = os.path.join( baselineDir, testFileId + '_baseline.png' )

    # compare temp. file vs. baseline
    testPassed = compareImages( tmpfile, baseline )
    _now = datetime.now()
    timestamp = str( _now.hour ).zfill( 2 ) + ':' + str( _now.minute ).zfill( 2 ) + ':' + str( _now.second ).zfill( 2 ) + '.' + str( _now.microsecond / 1000 ).zfill( 3 )

    if testPassed:
      testPassed = "PASSED : " + tmpfile + " : " + baseline + " : "
    else:
      testPassed = "FAILED : " + tmpfile + " : " + baseline + " : "
      testPassed += "\n" + timestamp + "  ERROR in Visualization" + testId + '\nComparison against baseline failed.\n'

    output += timestamp + "  Visualization" + testId + ' : ' + testPassed + '\n'

    browser.switch_to_window( browser.window_handles[0] )

  #browser.close()

  _now = datetime.now()
  timestamp = str( _now.hour ).zfill( 2 ) + ':' + str( _now.minute ).zfill( 2 ) + ':' + str( _now.second ).zfill( 2 ) + '.' + str( _now.microsecond / 1000 ).zfill( 3 )
  result = output + timestamp + '  Done\n'

  print output

  print 'RUNNING VISUAL TESTING.. DONE!'

  browser.switch_to_window( browser.window_handles[0] )
  browser.execute_script( 'jscoverage_storeButton_click();' )

  time.sleep( 1 )

  browser.execute_script( 'jscoverage_recalculateSummaryTab();' )

  summaryTable = browser.execute_script( 'return document.getElementById("summaryTable").innerHTML;' )

  # parse the summary table
  data = summaryTable.replace( '\n', '' ).split( '</tr>' )
  secondLine = data[1]
  totalNumberOfFiles = secondLine.split( '<span>' )[1].split( '</span>' )[0]
  totalLines = secondLine.split( '"numeric">' )[1].split( '</td>' )[0]
  totalTestedLines = secondLine.split( '"numeric">' )[2].split( '</td>' )[0]
  totalCoverage = secondLine.split( '"pct">' )[1].split( '%' )[0]

  covFiles = []

  for i in range( 2, len( data ) - 1 ):

    line = data[i]
    fileName = line.split( '"#">' )[1].split( '</a>' )[0]
    lines = int( line.split( '"numeric">' )[1].split( '</td>' )[0] )
    testedLines = int( line.split( '"numeric">' )[2].split( '</td>' )[0] )
    untestedLines = lines - testedLines
    coveragePercent = line.split( '"pct">' )[1].split( '%' )[0]

    covFiles.append( [fileName, lines, testedLines, untestedLines, coveragePercent] )

  # create XML
  from socket import getfqdn
  # WRITE XML
  from xml.dom import minidom
  # GET DATE
  #from cElementTree.SimpleXMLWriter import XMLWriter
  import string

  xml = minidom.Document()

  system_info = os.uname()

  siteElement = xml.createElement( 'Site' )
  systeminfo = os.uname()
  siteElement.setAttribute( 'BuildName', system_info[0] + '-' + system_info[2] )

  hostname = getfqdn()

  buildtype = 'Experimental'
  now = datetime.now()
  buildtime = str( now.year ) + str( now.month ) + str( now.day ) + "-" + str( now.minute ) + str( now.second )


  #buildstamp = '20120603-0100-Nightly'# + '-' + buildtype
  buildstamp = buildtime + '-' + buildtype
  siteElement.setAttribute( 'BuildStamp', buildstamp )
  siteElement.setAttribute( 'Name', hostname )
  siteElement.setAttribute( 'Hostname', hostname )

  xml.appendChild( siteElement )

  buildElement = xml.createElement( 'Coverage' )
  siteElement.appendChild( buildElement )

  fillxml( xml, buildElement, 'StartDateTime', time.strftime( "%b %d %H:%M %Z", time.gmtime() ) )
  fillxml( xml, buildElement, 'EndDateTime', time.strftime( "%b %d %H:%M %Z", time.gmtime() ) )

  for f in covFiles:

    fileName = f[0]
    lines = f[1]
    testedLines = f[2]
    untestedLines = f[3]
    coveragePercent = f[4]

    fileElement = xml.createElement( 'File' )
    fileElement.setAttribute( 'Name', os.path.split( fileName )[1] )
    fileElement.setAttribute( 'FullPath', fileName )
    fileElement.setAttribute( 'Covered', 'true' )
    buildElement.appendChild( fileElement )

    fillxml( xml, fileElement, 'LOCTested', str( testedLines ) )
    fillxml( xml, fileElement, 'LOCUntested', str( untestedLines ) )
    fillxml( xml, fileElement, 'PercentCoverage', str( coveragePercent ) )


  fillxml( xml, buildElement, 'LOCTested', str( totalTestedLines ) )
  fillxml( xml, buildElement, 'LOCUntested', str( int( totalLines ) - int( totalTestedLines ) ) )
  fillxml( xml, buildElement, 'LOC', str( int( totalLines ) ) )
  fillxml( xml, buildElement, 'PercentCoverage', str( totalCoverage ) )

  f2 = open( 'XTKCoverage.xml', 'w' )
  f2.write( xml.toxml() )
  f2.close()

  browser.quit()

  return [result_unit, result]

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )

def testLessons( xtkLibDir, browserString='chrome' ):

  import selenium
  from selenium import webdriver
  from selenium.common.exceptions import NoSuchElementException
  from selenium.webdriver.common.keys import Keys

  try:
    if browserString == 'chrome':
      # find the chrome browser
      chromedriverExecutable = chromeDriverExecutable( xtkLibDir )
      browser = webdriver.Chrome( chromedriverExecutable )
    else:
      # use firefox
      browser = webdriver.Firefox()

  except:
    print 'Could not find browser ' + browser + '.. Skipping it'
    return

  lessons = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10']

  for l in lessons:

    browser.get( "http://lessons.goxtk.com/" + l + "/" )
    time.sleep( 3 )
    browser.save_screenshot( '/chb/tmp/lesson' + l + '_' + browserString + '.png' )

  browser.close()

  result = 'LESSONS TEST DONE'

  return result


def compareImages( image1, image2 ):
  '''
  Check if 2 images are identical. Return TRUE if they are, FALSE else
  '''
  import png
  i1 = png.Reader( image1 )
  i2 = png.Reader( image2 )

  import numpy
  import itertools

  pixelsIterator1 = i1.asRGBA()
  pixelsIterator2 = i2.asRGBA()

  # make 2d arrays
  image1 = numpy.vstack( itertools.imap( numpy.uint16, pixelsIterator1[2] ) )
  image2 = numpy.vstack( itertools.imap( numpy.uint16, pixelsIterator2[2] ) )

  rms1 = numpy.sqrt( numpy.mean( image1 ** 2 ) )
  rms2 = numpy.sqrt( numpy.mean( image2 ** 2 ) )

  return numpy.abs( rms1 - rms2 ) <= 0.1

  # return true if identical, false otherwise
  #return all( a == b for a, b in izip_longest( pixels1[2], pixels2[2], fillvalue=sentinel ) )
#
#  rs = []
#  gs = []
#  bs = []
#
#  sum1 = 0
#  sum2 = 0
#
#  for p in list( pixels1[2] ):
#    cnt = 1
#    for rgba in p:
#
#      if cnt % 4 != 0:
#         skip every 4th
#        sum1 += rgba
#
#      cnt += 1
#
#
#  for p2 in list( pixels2[2] ):
#    cnt = 1
#    for rgba in p2:
#      if cnt % 4 != 0:
#         skip every 4th
#        sum2 += rgba
#
#      cnt += 1
#
#  return ( ( float( sum1 ) / float( sum2 ) ) > 0.8 )
