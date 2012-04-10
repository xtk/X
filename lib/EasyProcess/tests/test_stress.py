from easyprocess import EasyProcess, EasyProcessError
from nose.tools import eq_, timed
from unittest import TestCase


class Test(TestCase):
    def test_call(self):
        for x in range(1000):
            # test for:
            # OSError exception:[Errno 24] Too many open files
            print( 'index=',x)
            eq_(EasyProcess('echo hi').call().return_code, 0)
        
    def test_start(self):
        for x in range(1000):
            print( 'index=',x)
            EasyProcess('echo hi').start()
            
    @timed(1000)
    def test_timeout(self):
        for x in range(1000):
            print( 'index=',x)
            self.assertNotEquals(EasyProcess('sleep 5').call(timeout=0.05).return_code, 0)
