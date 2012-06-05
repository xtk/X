set(CTEST_PROJECT_NAME "XTK")
set(CTEST_NIGHTLY_START_TIME "01:00:00 UTC")

set(CTEST_DROP_METHOD "http")
set(CTEST_DROP_SITE "x.babymri.org")
set(CTEST_DROP_LOCATION "/cdash/submit.php?project=XTK")
set(CTEST_DROP_SITE_CDASH TRUE)

set(CTEST_SOURCE_DIRECTORY ".")
set(CTEST_BINARY_DIRECTORY ".")
set(CTEST_COMMAND "/usr/bin/ctest")

SET(filestosubmit "")

if(EXISTS "XTKUpdate.xml")
  SET(filestosubmit ${filestosubmit} "XTKUpdate.xml")
endif(EXISTS "XTKUpdate.xml")

if(EXISTS "XTKConf.xml")
  SET(filestosubmit ${filestosubmit} "XTKConf.xml")
endif(EXISTS "XTKConf.xml")

if(EXISTS "XTKBuild.xml")
  SET(filestosubmit ${filestosubmit} "XTKBuild.xml")
endif(EXISTS "XTKBuild.xml")

if(EXISTS "XTKTest.xml")
  SET(filestosubmit ${filestosubmit} "XTKTest.xml")
endif(EXISTS "XTKTest.xml")

if(EXISTS "XTKCoverage.xml")
  SET(filestosubmit ${filestosubmit} "XTKCoverage.xml")
endif(EXISTS "XTKCoverage.xml")

ctest_submit(FILES ${filestosubmit})
