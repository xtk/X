from easyprocess import EasyProcess
from pyvirtualdisplay.abstractdisplay import AbstractDisplay
import logging

log = logging.getLogger(__name__)

PROGRAM = 'Xvnc'
URL = None
PACKAGE = 'tightvncserver'

class XvncDisplay(AbstractDisplay):
    '''
    Xvnc wrapper
    '''
    def __init__(self, size=(1024, 768), color_depth=24, bgcolor='black', rfbport=5900):
        '''
        :param bgcolor: 'black' or 'white'
        :param rfbport: Specifies the TCP port on which Xvnc listens for connections from viewers (the protocol used in VNC is called RFB - "remote framebuffer"). The default is 5900 plus the display number. 
        '''
        self.screen = 0
        self.size = size
        self.color_depth = color_depth
        self.process = None
        self.bgcolor = bgcolor
        self.display = None
        self.rfbport = rfbport
        
    @classmethod
    def check_installed(cls):
        EasyProcess([PROGRAM, '-help'], url=URL, ubuntu_package=PACKAGE).check_installed()
            
    @property
    def _cmd(self):
        cmd = [PROGRAM ,
#               dict(black='-br', white='-wr')[self.bgcolor],
#                '-screen',
#                str(self.screen),
#                'x'.join(map(str, list(self.size) + [self.color_depth])),
                '-rfbport', self.rfbport, 
                self.new_display_var,
                 ]
        return cmd
               
        
        
        
        
