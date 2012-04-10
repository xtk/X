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
  display = Display( visible=0, size=( 1024, 768 ) )
  display.start()
  chrome_results = runTests( xtkTestFile, xtkLibDir, browserString )
  display.stop()
  if chrome_results:
    visualization_test_results = testVisualization( xtkLibDir, browserString, xtkTestFile.find( 'build' ) != -1 )
    if visualization_test_results:
      # merge the outputs
      chrome_results_array = chrome_results.split( '\n' )
      chrome_results_array_without_done = chrome_results_array[0:-2]
      chrome_results_array_without_done.extend( visualization_test_results.split( '\n' ) )
      chrome_results = "\n".join( chrome_results_array_without_done )
    else:
      print 'Could not run visual tests!\n'
    print chrome_results
  else:
    print 'Could not run any ' + browserString + ' tests!'
  print

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


  # write to logfile the results
  with open( "xtk_test.log", "a" ) as f:
    # chrome
    f.write( "chrome\n" )
    if not chrome_results:
      f.write( 'chrome not found\n' )
    else:
      f.write( chrome_results )
    # firefox
    f.write( "\nfirefox\n" )
    if not firefox_results:
      f.write( 'firefox not found\n' )
    else:
      f.write( firefox_results )

  return True


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

def runTests( xtkTestFile, xtkLibDir, browserString ):

  print 'RUNNING OFFSCREEN TESTING..'

  browser = getBrowser( xtkLibDir, browserString )

  if not browser:
    return None

  # we don't need os.sep here since it's a url
  browser.get( "file://" + xtkTestFile )

  time.sleep( 3 )

  result = browser.execute_script( 'return window.G_testRunner.getReport(true);' )

  browser.close()

  print 'RUNNING OFFSCREEN TESTING.. DONE!'

  return result

def testVisualization( xtkLibDir, browserString, againstBuild=False ):

  print 'RUNNING VISUAL TESTING..'

  browser = getBrowser( xtkLibDir, browserString )

  if not browser:
    return None

  # list of tests
  tests = ['test_trk.html']
  tests_build = ['test_trk_build.html']

  # distinguish between build and dev tree
  if againstBuild:
    real_tests = tests_build
  else:
    real_tests = tests

  testURL = "file://" + xtkLibDir + "/../testing/visualization/"
  baselineDir = os.path.abspath( xtkLibDir + "/../testing/visualization/baselines/" )

  # we test the visualization with a fixed window size
  browser.set_window_size( 800, 600 )

  output = ''

  # loop through the tests
  for t in real_tests:

    # open the test
    browser.get( testURL + t )

    # wait until loading fully completed
    timer = 0
    while not browser.execute_script( 'return test_renderer._initialLoadingCompleted' ) and timer < 5:
      time.sleep( 1 ) # loading did not complete yet
      timer += 1

    # create a screenshot and save it to a temp. file
    testId = os.path.splitext( t )[0]
    testFileId = testId + '_' + browserString
    tmpfile = tempfile.mkstemp( suffix='.png', prefix='xtk_' + testFileId )[1]
    browser.save_screenshot( tmpfile )

    # baseline
    baseline = os.path.join( baselineDir, testFileId.replace( '_build', '' ) + '_baseline.png' )

    # compare temp. file vs. baseline
    testPassed = compareImages( tmpfile, baseline )
    _now = datetime.now()
    timestamp = str( _now.hour ).zfill( 2 ) + ':' + str( _now.minute ).zfill( 2 ) + ':' + str( _now.second ).zfill( 2 ) + '.' + str( _now.microsecond / 1000 ).zfill( 3 )

    if testPassed:
      testPassed = "PASSED"
    else:
      testPassed = "FAILED"
      testPassed += "\n" + timestamp + "  ERROR in Visualization" + testId.replace( '_build', '' ) + '\nComparison against baseline failed.\n'

    output += timestamp + "  Visualization" + testId.replace( '_build', '' ) + ' : ' + testPassed + '\n'

  browser.close()

  _now = datetime.now()
  timestamp = str( _now.hour ).zfill( 2 ) + ':' + str( _now.minute ).zfill( 2 ) + ':' + str( _now.second ).zfill( 2 ) + '.' + str( _now.microsecond / 1000 ).zfill( 3 )
  result = output + timestamp + '  Done\n'

  print 'RUNNING VISUAL TESTING.. DONE!'

  return result


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

  # the pixels from png are iterators, so we just compare them
  from itertools import izip_longest, tee
  sentinel = object()
  pixels1 = i1.read()
  pixels2 = i2.read()
  # return true if identical, false otherwise
  #return all( a == b for a, b in izip_longest( pixels1[2], pixels2[2], fillvalue=sentinel ) )

  sum1 = 0
  sum2 = 0

  for p in list( pixels1[2] ):
    cnt = 0
    for rgba in p:

      if cnt % 4 != 0:
        # skip every 4th
        sum1 += rgba

      cnt += 1


  for p in list( pixels2[2] ):
    cnt = 0
    for rgba in p:

      if cnt % 4 != 0:
        # skip every 4th
        sum2 += rgba

      cnt += 1

  print 'sum1', sum1
  print 'sum2', sum2
  return sum1 == sum2
