'''
Example for Xvnc backend
'''

from easyprocess import EasyProcess
from entrypoint2 import entrypoint
from pyvirtualdisplay.display import Display

@entrypoint
def main(rfbport=5904):
    with Display(backend='xvnc', rfbport=rfbport) as disp:
        with EasyProcess('xmessage hello') as proc:
            proc.wait()
