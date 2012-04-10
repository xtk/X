from easyprocess import EasyProcess
from pyvirtualdisplay.abstractdisplay import AbstractDisplay
import logging

log = logging.getLogger(__name__)

PROGRAM = 'Xvfb'
URL = None
PACKAGE = 'xvfb'


class XvfbDisplay(AbstractDisplay):
    '''
    Xvfb wrapper
    
    Xvfb is an X server that can run on machines with no display
    hardware and no physical input devices. It emulates a dumb
    framebuffer using virtual memory.
    '''
    def __init__(self, size=(1024, 768), color_depth=24, bgcolor='black'):
        '''
        :param bgcolor: 'black' or 'white'
        '''
        self.screen = 0
        self.size = size
        self.color_depth = color_depth
        self.process = None
        self.bgcolor = bgcolor
        self.display = None
        
    @classmethod
    def check_installed(cls):
        EasyProcess([PROGRAM, '-help'], url=URL, ubuntu_package=PACKAGE).check_installed()
        
    @property
    def _cmd(self):
        cmd = [PROGRAM ,
               dict(black='-br', white='-wr')[self.bgcolor],
                '-screen',
                str(self.screen),
                'x'.join(map(str, list(self.size) + [self.color_depth])),
                self.new_display_var,
                 ]
        return cmd
               
        
        
        
        
