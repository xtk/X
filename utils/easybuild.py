import sys
import os
import string

xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )
xtkDir = os.path.normpath( xtkUtilsDir + os.sep + '..' + os.sep )
compilerJar = os.path.normpath( os.path.join( xtkDir, 'lib/closure-library/compiler-latest/compiler.jar' ) )
closureBuilder = os.path.normpath( os.path.join( xtkDir, 'lib/closure-library/closure/bin/build/closurebuilder.py' ) )

# grab the closure python utilities
sys.path.append( xtkDir + '/lib/closure-library/closure/bin/build' )
import treescan
import jscompiler
import depstree

# ignore these files
excludePaths = ['lib', 'testing', 'deps']

# scan for .js files
jsFilesGenerator = treescan.ScanTreeForJsFiles( xtkDir )

# list of final .js files to compile
jsFiles = []

# apply ignores
for j in jsFilesGenerator:

  ignore = False

  for e in excludePaths:
    if string.count( j, e ) > 0:
      # ignore this guy
      ignore = True

  if not ignore:
    # add this guy to the valid files
    jsFiles.append( j )

# now compile
command = closureBuilder
for j in jsFiles:
  command += ' -i ' + j
command += ' --root=' + os.path.join( xtkDir )
command += ' --output_mode=compiled'
command += ' --compiler_jar ' + compilerJar

os.system( command )
