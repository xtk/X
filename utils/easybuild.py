import sys
import os
import string
import time

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


# remove file if exists
if os.path.exists( 'temp_build.log' ): os.remove( 'temp_build.log' )
# start compilation time
start = time.clock()

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
command += ' -f "--debug"'
#command += ' -f "--output_wrapper=(function() {%output%})();"'
#command += ' -f "--source_map_format=V2"'
#command += ' -f "--create_source_map=./mymap"'
command += ' -f "--warning_level=VERBOSE"'
#command += ' -f "--compilation_level=ADVANCED_OPTIMIZATIONS"'
command += ' -f "--formatting=PRETTY_PRINT"'
command += ' > xtk.js'

os.system( command + ' 2> temp' )
# get current location
os.system( 'bash scripts/colorPrompt.sh temp' )
os.system( 'cat temp >> temp_build.log' )
if os.path.exists( 'temp' ): os.remove( 'temp' )

# end compilation time
end = time.clock()
processingTime = end - start

os.system( 'echo ' + str( start ) + ' > xtk_build.log' )
os.system( 'echo ' + str( end ) + ' >> xtk_build.log' )
os.system( 'echo ' + str( processingTime ) + ' >> xtk_build.log' )
os.system( 'cat temp_build.log >> xtk_build.log' )

if os.path.exists( 'temp_build.log' ): os.remove( 'temp_build.log' )

license = '''/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */'''

with open( "xtk.js", "r+" ) as f:
     old = f.read() # read everything in the file
     f.seek( 0 ) # rewind
     f.write( license + '\n' + old ) # write the new line before

print '>> OUTPUT: xtk.js'
