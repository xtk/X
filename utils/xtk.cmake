set(CTEST_PROJECT_NAME         "xtk")
set(CTEST_NIGHTLY_START_TIME   "01:00:00 CET")
set(CTEST_DROP_METHOD "http")
set(CTEST_DROP_SITE "cdash.goxtk.com")
set(CTEST_DROP_LOCATION "/submit.php?project=xtk")
set(CTEST_DROP_SITE_CDASH TRUE)


set(CTEST_SOURCE_DIRECTORY "/Users/nr52/projectX/xtk")
set(CTEST_BINARY_DIRECTORY ".")
set(CTEST_COMMAND "command")

ctest_submit(FILES XTKUpdate.xml XTKConf.xml XTKBuild.xml XTKTest.xml)
