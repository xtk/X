from easyprocess import EasyProcess
from nose.tools import eq_
from pyvirtualdisplay.smartdisplay import SmartDisplay, DisplayTimeoutError
from unittest import TestCase
from path import path

class Test(TestCase):
    def test_disp(self):
        vd = SmartDisplay().start()

        d = SmartDisplay(visible=1).start().sleep(2).stop()
        self.assertEquals(d.return_code, 0)

        d = SmartDisplay(visible=0).start().stop()
        self.assertEquals(d.return_code, 0)
        
        vd.stop()
        
    def test_slowshot(self):
        disp = SmartDisplay(visible=0).start()
        py = path(__file__).parent / ('slowgui.py')
        proc = EasyProcess('python ' + py).start()
        img = disp.waitgrab()
        proc.stop()
        disp.stop()
        eq_(img is not None, True)
        
    def test_slowshot_wrap(self):
        disp = SmartDisplay(visible=0)
        py = path(__file__).parent / ('slowgui.py')
        proc = EasyProcess('python ' + py)
        f = disp.wrap(proc.wrap(disp.waitgrab))
        img = f()
        eq_(img is not None, True)
        
    def test_empty(self):
        disp = SmartDisplay(visible=0)
        proc = EasyProcess('python')
        f = disp.wrap(proc.wrap(disp.waitgrab))
        self.assertRaises(Exception, f)
        
    def test_slowshot_timeout(self):
        disp = SmartDisplay(visible=0)
        py = path(__file__).parent / ('slowgui.py')
        proc = EasyProcess('python ' + py)
        f = disp.wrap(proc.wrap(lambda : disp.waitgrab(timeout=1)))
        self.assertRaises(DisplayTimeoutError, f)
        
