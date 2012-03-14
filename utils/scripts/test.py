import time
import platform
import sys
import os


def chromeDriverExecutable( xtkLibDir ):
  '''
  Find the chromedriver executable. If possible, use a bundled version else wise try to look in the path.
  '''
  chromedriverDir = xtkLibDir + os.sep + 'selenium' + os.sep + 'chromedrivers' + os.sep

  system = platform.system()

  # find the chromedriver executable
  chromedriverExecutable = 'chromedriver'

  # first, try to use the bundled chromedriver version
  # if this fails, try to look in the system path.. that's all we can do..
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


def calculate( xtkDir, xtkLibDir):
  '''
  '''

  if os.path.exists('xtk_test.log'): os.remove('xtk_test.log')

  # add selenium path
  sys.path.append( xtkLibDir + os.sep + 'selenium' )

  print

  print '======== GOOGLE CHROME RESULTS ========'
  chrome_results = runTests( xtkDir, xtkLibDir, 'chrome' )
  print chrome_results
  print

  print '======== FIREFOX RESULTS ========'
  firefox_results = runTests( xtkDir, xtkLibDir, 'firefox' )
  print firefox_results
  print

  # writee to logfile the results
  with open("xtk_test.log", "a") as f:
    # chrome
    f.write("chrome\n")
    if not chrome_results:
      f.write('chrome not found')
    else:
      f.write(chrome_results)
    # firefox
    f.write("\nfirefox\n")
    if not firefox_results:
      f.write('firefox not found')
    else:
      f.write(firefox_results)

  return True


def runTests( xtkDir, xtkLibDir, browser='chrome' ):

  import selenium
  from selenium import webdriver
  from selenium.common.exceptions import NoSuchElementException
  from selenium.webdriver.common.keys import Keys

  try:
    if browser == 'chrome':
      # find the chrome browser
      chromedriverExecutable = chromeDriverExecutable( xtkLibDir )
      browser = webdriver.Chrome( chromedriverExecutable )
    else:
      # use firefox
      browser = webdriver.Firefox()

  except:
    print 'Could not find browser ' + browser + '.. Skipping it'
    return

  # we don't need os.sep here since it's a url
  browser.get( "file://" + xtkDir + '/testing/xtk_tests.html' )

  time.sleep( 3 )

  result = browser.execute_script( 'return window.G_testRunner.getReport(true);' )

  browser.close()

  return result

