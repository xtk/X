import Image
import sys

print("start")

img = Image.new('RGB', (33, 33))
if (sys.argv+[''])[1] != '--hide':
    print("show")
    img.show()

print("exit program")
