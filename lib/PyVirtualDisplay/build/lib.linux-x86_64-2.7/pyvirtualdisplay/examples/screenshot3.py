'''
using :keyword:`with` statement
'''

from easyprocess import EasyProcess
from pyvirtualdisplay.smartdisplay import SmartDisplay

with SmartDisplay(visible=0, bgcolor='black') as disp:
    with EasyProcess('xmessage hello'):
        img = disp.waitgrab()


img.show()
