from easyprocess import EasyProcess
from nose.tools import eq_, ok_
import sys

def test():
    eq_( EasyProcess([sys.executable , '-m','easyprocess.examples.ver']).call().return_code, 0)
    eq_( EasyProcess([sys.executable , '-m','easyprocess.examples.log']).call().return_code, 0)
