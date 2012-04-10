from easyprocess import EasyProcess
from nose.tools import eq_, timed, ok_
from unittest import TestCase
import sys

python=sys.executable
    
class Test(TestCase):
    def test_timeout(self):
        p = EasyProcess('sleep 1').start()
        p.wait(0.2)
        eq_(p.is_alive(), True)
        p.wait(0.2)
        eq_(p.is_alive(), True)
        p.wait(2)
        eq_(p.is_alive(), False)
        
        eq_(EasyProcess('sleep 0.3').call().return_code==0, True)
        eq_(EasyProcess('sleep 0.3').call(timeout=0.1).return_code==0, False)
        eq_(EasyProcess('sleep 0.3').call(timeout=1).return_code==0, True)
    
        eq_(EasyProcess('sleep 0.3').call().timeout_happened, False)
        eq_(EasyProcess('sleep 0.3').call(timeout=0.1).timeout_happened, True)
        eq_(EasyProcess('sleep 0.3').call(timeout=1).timeout_happened, False)

    @timed(3)
    def test_time_cli1(self):
        p=EasyProcess([python, '-c', "import logging;logging.basicConfig(level=logging.DEBUG);from easyprocess import EasyProcess;EasyProcess('sleep 5').start()"])
        p.call()
        eq_(p.return_code,0)

    @timed(3)
    def test_time_cli2(self):
        p=EasyProcess([python, '-c', "import logging;logging.basicConfig(level=logging.DEBUG);from easyprocess import EasyProcess;EasyProcess('sleep 5').call(timeout=0.5)"])
        p.call()
        eq_(p.return_code,0)
    
    @timed(3)
    def test_time2(self):
        p=EasyProcess('sleep 5').call(timeout=1)
        eq_(p.is_alive(), False)
        eq_(p.timeout_happened, True)
        ok_(p.return_code<0)
        eq_(p.stdout, '')
        
    @timed(3)
    def test_timeout_out(self):
        p=EasyProcess([python, '-c', "import time;print( 'start');time.sleep(5);print( 'end')"]).call(timeout=1)
        eq_(p.is_alive(), False)
        eq_(p.timeout_happened, True)
        ok_(p.return_code<0)
        eq_(p.stdout, '')

    @timed(0.3)
    def test_time3(self):
        EasyProcess('sleep 5').start()
