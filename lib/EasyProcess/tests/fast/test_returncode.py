from easyprocess import EasyProcess
from nose.tools import eq_, ok_

def test_return_code():
    # process has finished but no stop() or wait() was called
    eq_(EasyProcess('echo hello').start().sleep(0.5).return_code, None)
    
    # wait()
    eq_( EasyProcess('echo hello').start().wait().return_code, 0)
    
    # stop() after process has finished
    eq_( EasyProcess('echo hello').start().sleep(0.5).stop().return_code, 0)
    
    # stop() before process has finished
    ok_( EasyProcess('sleep 2').start().stop().return_code<0)
    
    # same as start().wait().stop()
    eq_( EasyProcess('echo hello').call().return_code, 0)
