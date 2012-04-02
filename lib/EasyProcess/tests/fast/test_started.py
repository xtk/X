from easyprocess import EasyProcess, EasyProcessError
from nose.tools import eq_
from unittest import TestCase


class Test(TestCase):
    def test_is_started(self):
        eq_(EasyProcess('ls -la').is_started, False)
        eq_(EasyProcess('ls -la').start().is_started, True)
        eq_(EasyProcess('ls -la').call().is_started, True)
        eq_(EasyProcess('ls -la').start().wait().is_started, True)
        eq_(EasyProcess('ls -la').start().stop().is_started, True)
        
        
    def test_raise(self):
        self.assertRaises(EasyProcessError, lambda : EasyProcess('ls -la').start().start())
        self.assertRaises(EasyProcessError, lambda : EasyProcess('ls -la').stop())
        self.assertRaises(EasyProcessError, lambda : EasyProcess('ls -la').sendstop())
        #self.assertRaises(EasyProcessError, lambda : EasyProcess('ls -la').start().stop().stop())
        self.assertRaises(EasyProcessError, EasyProcess('ls -la').start().wrap(lambda : None))
        EasyProcess('ls -la').wrap(lambda : None)()
   
