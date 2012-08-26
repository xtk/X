#
# The XBUILD tester.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import platform
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

    # start the jscoverage server
    os.system( self.getCoverageServer() + config.JSCOVERAGE_ARGUMENTS )

    self.__browser = self.getBrowser( name )

    # use a fixed window size
    self.__browser.set_window_size( 800, 600 )


  def teardownEnvironment( self, browser ):
    '''
    Tear down the testing environment.
    '''
    self.__browser.quit()

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

    actions = ActionChains( self.__browser )
    actions.click( canvas )

    #
    # mouse
    #

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


  def run( self, options=None ):
    '''
    Performs the action.
    '''

    log = []

    print 'Testing ' + config.SOFTWARE_SHORT + '...'

    browser = 'chrome'
    if options.firefox:
      browser = 'firefox'

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

    log = self.parse_unit_results( result_unit )

    if options.verbose:
      # print the results with errors in red
      print result_unit.replace( 'ERROR', Colors.RED + 'ERROR' + Colors._CLEAR )

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
        result_image = self.compare_images( screenshot_file, baseline_file )

        #
        # add log entry
        #
        end_time = time.time()
        execution_time = end_time - start_time

        test_result = Colors.RED + 'FAILED' + Colors._CLEAR
        test_log = 'Comparison of ' + screenshot_file + ' and ' + baseline_file + ' failed!'

        if result_image:
          # this means the test passed
          test_result = 'PASSED'
          test_log = ''

        log.append( ['Visualization' + testFileId, Colors.strip( test_result ).lower(), test_log, execution_time, screenshot_file, baseline_file] )

        # in verbose mode, directly print the result
        if options.verbose:
          print 'Visualization' + testFileId + ': ' + test_result


        # use the mouse but only in chrome (firefox might crash)
        # this is just to increase testing coverage of interactors
        if browser == 'chrome':
          self.interact_mouse()


    # teardown environment
    self.teardownEnvironment( browser )


    return









    log = []
    log.append( ['Test1', 'passed', 'All worked!Yay!', 200, None, None] )
    log.append( ['Test2', 'failed', 'Failure :( :( :(Failure!', 123, None, None] )


    # now we create a dashboard submission file
    cdasher = CDash()
    xmlfile = cdasher.run( ['Testing', log] )

    with open( os.path.join( config.TEMP_PATH, config.SOFTWARE_SHORT + '_Test.xml' ), 'w' ) as f:
      f.write( xmlfile )

    print Colors.ORANGE + 'Testing done.' + Colors._CLEAR
