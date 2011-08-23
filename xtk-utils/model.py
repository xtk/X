f = open( '/Users/d/Documents/Datasets/avf.vtk', 'r' );

output = "var object3 = new X.object();\n"

for line in f:

  a = line.strip().split( " " )

  if len( a ) >= 3:

    x = a[0]
    y = a[1]
    z = a[2]

    output += "object3.addPoint([" + x + "," + y + "," + z + "]);\n"
    output += "object3.addColor(new X.color(1,0,0));\n"

  if len( a ) >= 6:

    x = a[3]
    y = a[4]
    z = a[5]

    output += "object3.addPoint([" + x + "," + y + "," + z + "]);\n"
    output += "object3.addColor(new X.color(1,0,0));\n"

  if len( a ) >= 9:

    x = a[6]
    y = a[7]
    z = a[8]

    output += "object3.addPoint([" + x + "," + y + "," + z + "]);\n"
    output += "object3.addColor(new X.color(1,0,0));\n"



print output
