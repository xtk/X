from easyprocess import EasyProcess
from pyvirtualdisplay import Display
 
Display(visible=1, size=(320, 240)).start()
EasyProcess('gnumeric').start()

