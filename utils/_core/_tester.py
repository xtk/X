#
# The XBUILD tester.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import json
import os
import platform
import re
import shutil
import sys
import subprocess
import tempfile
import time

import config
from _cdash import CDash
from _colors import Colors
from _jsfilefinder import JSFileFinder
from _licenser import Licenser

# we also need selenium specific stuff
sys.path.append( config.SELENIUM_PATH )
import selenium
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
# and pypng
sys.path.append( config.PYPNG_PATH )


#
#
#
class Tester( object ):
  '''
  '''

  def __init__( self ):
    '''
    '''
    self.__browser = None
    self.__jscoverage_loaded = False

  def getBrowser( self, name ):
    '''
    Return the current browser instance which is driven by selenium.
    
    Right now, Chrome and Firefox are supported.
    '''
    try:
      if name == 'chrome':
        # find the chrome browser
        chromedriverExecutable = ''

        # .. in here maybe?
        chromedriverDir = config.SELENIUM_CHROMEDRIVER_PATH + os.sep

        # this depends on the platform
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

        browser = webdriver.Chrome( chromedriverExecutable )
      elif name == 'firefox':
        # use firefox which is built-in
        browser = webdriver.Firefox()

    except Exception as e:
      print 'ERROR: Could not start ' + browserString
      browser = None

    return browser

  def getCoverageServer( self ):
    '''
    Return the JSCoverage server command. This does not execute yet.
    '''
    system = platform.system()

    if system == 'Darwin':
      jsCoverageExecutable = config.JSCOVERAGE_PATH + '/mac' + os.sep + 'jscoverage-server'
    elif system == 'Windows':
      jsCoverageExecutable = config.JSCOVERAGE_PATH + '/windows' + os.sep + 'jscoverage-server'
    elif system == 'Linux':
      jsCoverageExecutable = config.JSCOVERAGE_PATH + '/linux' + os.sep + 'jscoverage-server'

    return jsCoverageExecutable


  def setupEnvironment( self, name ):
    '''
    Setup the testing environment. This includes Selenium and the JSCoverage server.
    '''

    # remove all old coverage output
    if os.path.exists( config.JSCOVERAGE_OUTPUT_PATH ):
      shutil.rmtree( config.JSCOVERAGE_OUTPUT_PATH )

    # start the jscoverage server
    os.system( self.getCoverageServer() + config.JSCOVERAGE_ARGUMENTS )

    self.__browser = self.getBrowser( name )

    # use a fixed window size
    self.__browser.set_window_size( 800, 600 )


  def teardownEnvironment( self, browser ):
    '''
    Tear down the testing environment.
    '''

    # save jscoverage results
    self.__browser.switch_to_window( self.__browser.window_handles[0] )
    self.__browser.execute_script( 'jscoverage_storeButton_click();' )

    time.sleep( 1 )

    # quit browser
    self.__browser.quit()

    # shutdown coverage server
    os.system( self.getCoverageServer() + " --shutdown" )


  def visit( self, url ):
    '''
    '''

    if self.__jscoverage_loaded:

      self.__browser.switch_to_window( self.__browser.window_handles[0] )

    else:

      # load JSCoverage
      self.__browser.get( "http://localhost:8080/jscoverage.html" )
      self.__jscoverage_loaded = True


    # clear the jscoverage location field
    locationfield = self.__browser.find_element_by_id( 'location' )
    locationfield.clear()

    # fill in url
    actions = ActionChains( self.__browser )
    actions.click( locationfield )
    actions.send_keys( url )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.TAB )
    actions.send_keys( Keys.RETURN )
    actions.perform()

    # switch to the new window
    self.__browser.switch_to_window( self.__browser.window_handles[-1] )


  def interact_keyboard( self ):
    '''
    Perform some keyboard interaction in the current active browser window.
    '''
    canvas = self.__browser.find_element_by_tag_name( 'canvas' )

    actions = ActionChains( self.__browser )
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

    actions.perform()


  def interact_mouse( self ):
    '''
    Perform some mouse interaction in the current active browser window.
    '''
    canvas = self.__browser.find_element_by_tag_name( 'canvas' )

    canvas_width = canvas.get_attribute('width')
    canvas_height = canvas.get_attribute('height')

    # move to canvas center to trigger a caption
    actions = ActionChains( self.__browser )
    actions.click( canvas )    
    actions.move_to_element_with_offset( canvas, int(canvas_width)/2, int(canvas_height)/2 )
    actions.perform()
    time.sleep(3)

    #
    # rotate, pan, zoom
    #
    
    actions = ActionChains( self.__browser )
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

    # zoom (not possible right now since the scrollwheel can't be triggered)

    # pan
    for i in range( 10 ):
      actions.key_down( Keys.LEFT_SHIFT )
      actions.click_and_hold( None )
      actions.move_to_element_with_offset( canvas, 0, 10 );
      actions.release( canvas )

    actions.perform()


  def compare_images( self, image1, image2 ):
    '''
    Check if 2 images are identical. Return TRUE if they are, FALSE otherwise.
    
    We use RMS comparison.
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


  def screenshot( self, testFileId ):
    '''
    Take a screenshot of the browser and return it's filename.
    '''

    # create a screenshot file in the tmp dir
    tmpfile = tempfile.mkstemp( suffix='.png', prefix='xtk_' + testFileId )[1]

    # .. and now capture!!
    self.__browser.save_screenshot( tmpfile )

    return tmpfile


  def baseline( self, testFileId ):
    '''
    Return the filename of a baseline for a test.
    '''

    # grab the baseline
    baseline = os.path.join( config.VISUAL_BASELINES_PATH, testFileId + '_baseline.png' )

    return baseline


  def parse_unit_results( self, results ):
    '''
    Parse a Closure Unit test report and return a proper log.
    '''

    log = []

    error_in_test = False
    _log = ''

    for l in results.split( '\n' ):

      if error_in_test:
        # this is part of an error
        if l == '':
          # this is the last line of the log
          error_in_test = False # reset the flag
          continue
        else:
          log[-1][2] += l + '\n'

      l_arr = l.split( ' ' )

      if len( l_arr ) == 5 and l_arr[4] == 'PASSED':
        # this is a passed test
        log.append( [l_arr[2], 'passed', '', 1, None, None, None, None] )
      elif len( l_arr ) == 5 and l_arr[4] == 'FAILED':
        # this is a failed test
        error_in_test = True
        log.append( [l_arr[2], 'failed', '', 1, None, None, None, None] )

    return log


  def print_log( self, log ):
    '''
    Print the log nicely.
    '''

    for t in log:

      test_result = t[1].upper()
      if test_result == 'FAILED':
        test_result = Colors.RED + test_result + Colors._CLEAR
        test_result += '\n' + Colors.PURPLE + t[2] + Colors._CLEAR

      print Colors.ORANGE + t[0] + ': ' + Colors._CLEAR + test_result


  def print_summary( self, log ):
    '''
    Print a nice summary.
    '''

    no_passed = 0
    no_failed = 0

    for t in log:

      test_result = t[1].upper()
      if test_result == 'FAILED':
        no_failed += 1
      else:
        no_passed += 1

    no_total = no_passed + no_failed
    print
    print Colors.ORANGE + 'TOTAL: '
    print Colors._CLEAR + '   ' + str( no_passed ) + '/' + str( no_total ) + ' PASSED'
    print Colors.RED + '   ' + str( no_failed ) + '/' + str( no_total ) + ' FAILED'
    print Colors._CLEAR


  def parse_coverage( self ):
    '''
    Parse the json output of the coverage server and return a list containing
    all important information.
    
    This is very restrictive and rather doesn't count than counts coverage.
    '''

    # log format:
    # filepath | lines_tested | lines_untested | percent_covered | lines
    # lines is a sublist, structured like this
    #  line_number | count (-1 for ignored) | code
    log = []

    with open( os.path.join( config.JSCOVERAGE_OUTPUT_PATH, 'jscoverage.json' ) ) as f:

      json_content = json.loads( f.read() )


    for j in json_content:

      # grab each file and parse the coverage information
      f = json_content[j]

      _lines_tested = 0
      _lines_untested = 0
      _percent_coverage = 0

      _lines = f['source']
      _count = f['coverage']

      lines = []

      # loop through lines
      for i, l in enumerate( _lines ):

        # strip html from http://stackoverflow.com/a/4869782/1183453
        l = re.sub( '<[^<]+?>', '', l )

        # there can be a case were the last line was not counted
        # when nothing was exported
        if i > len( _count ) - 1:
          hits = None
        else:
          hits = _count[i]

        if hits == None:
          # ignored (comment etc.)
          hits = -1
        elif hits == 0:
          # not tested
          _lines_untested += 1
        else:
          # tested
          _lines_tested += 1

        lines.append( [i, hits, l] )

      percent_covered = _lines_tested / ( _lines_tested + _lines_untested )
      percent_covered = round( percent_covered * 100 )

      # now we can attach to the log
      log.append( [j, _lines_tested, _lines_untested, percent_covered, lines] )

    return log


  def run( self, options=None ):
    '''
    Performs the action.
    '''

    print 'Testing ' + config.SOFTWARE_SHORT + '...'

    browser = 'chrome'
    if options.firefox:
      browser = 'firefox'

    # sanity check when testing against the build
    if options.build:
      # make sure there is xtk.js
      if not os.path.exists(config.BUILD_OUTPUT_PATH):
        print Colors.RED + 'Could not find ' + Colors.ORANGE + 'xtk.js' + Colors.RED + '!'
        print Colors.RED + 'Make sure to run ' + Colors.CYAN + './build.py' + Colors.RED + ' before!' + Colors._CLEAR
        sys.exit(2)

    # setup environment
    self.setupEnvironment( browser )

    #
    # UNIT TESTS
    #

    # run the unit tests
    if options.build:
      # against the build
      self.visit( config.UNIT_TESTS_BUILD )
    else:
      # against the dev tree
      self.visit( config.UNIT_TESTS )

    # wait for unit tests
    time.sleep( 3 )

    # .. grab the result
    result_unit = self.__browser.execute_script( 'return window.G_testRunner.getReport(true);' )
    # .. and fill our log
    log = self.parse_unit_results( result_unit )

    #
    # VISUAL TESTS
    #
    if not options.novisual:

      for t in config.VISUAL_TESTS:

        _test = config.VISUAL_TESTS_BASEPATH + t

        testId = os.path.splitext( t )[0]
        testFileId = testId + '_' + browser

        # clock it
        start_time = time.time()

        if options.build:
          # if we test against the build tree, append ?build to the url
          self.visit( _test + '?build' )
        else:
          self.visit( _test )

        # wait until loading fully completed
        timer = 0
        while not self.__browser.execute_script( 'return test_renderer.loadingCompleted' ) and timer < 5:
          time.sleep( 1 ) # loading did not complete yet
          timer += 1
        time.sleep( 1 )

        #
        # perform some interaction

        # press some keys
        self.interact_keyboard()

        # compare a screenshot vs. the baseline
        screenshot_file = self.screenshot( testFileId )
        baseline_file = self.baseline( testFileId )
        
        # check if the baseline exists
        if not os.path.exists(baseline_file):
          # if not, copy the current screnshot over
          shutil.copy(screenshot_file, baseline_file);
        
        result_image = self.compare_images( screenshot_file, baseline_file )

        # grab the FPS and the startup time
        fps = self.__browser.execute_script( 'return 1000/frameTime;' )
        startup_time = self.__browser.execute_script( 'return startup;' )

        #
        # add log entry
        #
        end_time = time.time()
        execution_time = end_time - start_time

        test_result = 'failed'
        test_log = 'Comparison of ' + screenshot_file + ' and ' + baseline_file + ' failed!'

        if result_image:
          # this means the test passed
          test_result = 'passed'
          test_log = ''

        log.append( ['Visualization' + testFileId, test_result, test_log, execution_time, screenshot_file, baseline_file, startup_time, fps] )

        # use the mouse but only in chrome (firefox might crash)
        # this is just to increase testing coverage of interactors
        if browser == 'chrome':
          self.interact_mouse()

    # teardown environment
    self.teardownEnvironment( browser )

    # print the results in verbose mode
    if options.verbose:
      self.print_log( log )

    # but always print the summary
    self.print_summary( log )

    # parse the coverage analysis
    coverage_log = self.parse_coverage()

    # now we create a dashboard submission file
    cdasher = CDash()
    xmlfile = cdasher.run( ['Testing', log, options.build] )

    with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Test.xml' ), 'w' ) as f:
      f.write( xmlfile )

    # .. and two coverage submission files, but only in dev mode

    if not options.build:
      # first is the summary
      cdasher = CDash()
      xmlfile = cdasher.run( ['Coverage', coverage_log, options.build] )
  
      with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Coverage.xml' ), 'w' ) as f:
        f.write( xmlfile )
  
      # second is the log for each LOC
      cdasher = CDash()
      xmlfile = cdasher.run( ['CoverageLog', coverage_log, options.build] )
  
      with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_CoverageLog.xml' ), 'w' ) as f:
        f.write( xmlfile )

    print Colors.ORANGE + 'Testing done.' + Colors._CLEAR
