from easyprocess import EasyProcess
from nose.tools import timed, eq_
import os.path
import sys

python = sys.executable

# deadlock in 0.0.0
# popen.communicate() hangs
# no deadlock with temp_files

#@timed(1)
#def test_stop():
#    cwd = os.path.dirname(__file__)
#    EasyProcess('python deadlock.py', cwd=cwd).start().sleep(0.5).stop()
    
#@timed(1)
#def test_stop2():
#    cwd = os.path.dirname(__file__)
#    eq_(EasyProcess([python, 'deadlock.py', '--hide'], cwd=cwd).call().return_code, 0)
#    p = EasyProcess([python, 'deadlock.py'], cwd=cwd).start().sleep(0.1).stop()
#    eq_(p.return_code, 0)
#    eq_(p.stdout, 'start')
