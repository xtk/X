f = open( '/Users/d/Documents/Datasets/tissue.stl', 'r' );

output = "var object3 = new X.object();\n"

for line in f:

  a = line.strip().split( " " )

  if a[0] == 'vertex':

    x = a[1]
    y = a[2]
    z = a[3]

    output += "object3.points().add([" + x + "," + y + "," + z + "]);\n"

'''
  if len( a ) >= 3:

    x = a[0]
    y = a[1]
    z = a[2]

    output += "object3.points().add([" + x + "," + y + "," + z + "]);\n"

  if len( a ) >= 6:

    x = a[3]
    y = a[4]
    z = a[5]

    output += "object3.points().add([" + x + "," + y + "," + z + "]);\n"

  if len( a ) >= 9:

    x = a[6]
    y = a[7]
    z = a[8]

    output += "object3.points().add([" + x + "," + y + "," + z + "]);\n"
'''


print output
