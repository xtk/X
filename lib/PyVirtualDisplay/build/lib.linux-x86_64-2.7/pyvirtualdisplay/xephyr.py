from easyprocess import EasyProcess
from pyvirtualdisplay.abstractdisplay import AbstractDisplay

PROGRAM = 'Xephyr'
URL = None
PACKAGE = 'xephyr'

class XephyrDisplay(AbstractDisplay):
    '''
    Xephyr wrapper
    
    Xephyr is an X server outputting to a window on a pre-existing X display
    '''
    def __init__(self, size=(1024, 768), color_depth=24, bgcolor='black'):
        '''
        :param bgcolor: 'black' or 'white'
        '''
        self.color_depth = color_depth
        self.size = size
        self.bgcolor = bgcolor
        self.screen = 0
        self.process = None
        self.display = None

    @classmethod
    def check_installed(cls):
        EasyProcess([PROGRAM, '-help'], url=URL, ubuntu_package=PACKAGE).check_installed()

    @property
    def _cmd(self):
        cmd = [PROGRAM ,
               dict(black='-br', white='-wr')[self.bgcolor],
                '-screen',
                'x'.join(map(str, list(self.size) + [self.color_depth])),
                 self.new_display_var,
                 ]
        return cmd
    
