from easyprocess import EasyProcess
from easyprocess.unicodeutil import split_command, EasyProcessUnicodeError
from nose.tools import eq_
from unittest import TestCase
import six
u=six.u
OMEGA =u('\u03A9')
    
class Test(TestCase):
    def test_str(self):
        eq_(EasyProcess(u('ls -la')).call().return_code, 0)
        
    def test_ls(self):
        eq_(EasyProcess([u('ls'), u('-la')]).call().return_code, 0)
    
    def test_parse(self):
        eq_(EasyProcess(u('ls -la')).cmd, ['ls', '-la'])
        eq_(EasyProcess(u('ls "abc"')).cmd, ['ls', 'abc'])
        eq_(EasyProcess(u('ls "ab c"')).cmd, ['ls', 'ab c'])

    def test_split(self):
        #list -> list
        eq_(split_command([str('x'),str('y')]),['x','y'])
        eq_(split_command([str('x'),u('y')]),['x','y'])
        eq_(split_command([str('x'),OMEGA]),['x',OMEGA])

        #str -> list
        eq_(split_command(str('x y')),['x','y'])
        eq_(split_command(u('x y')),['x','y'])
        if six.PY3:        
            eq_(split_command(u('x ')+OMEGA), ['x',OMEGA])
        else:
            self.assertRaises(EasyProcessUnicodeError, lambda :split_command(u('x ')+OMEGA))
        
    def test_echo(self):
        eq_(EasyProcess(u('echo hi')).call().stdout, 'hi')
        
        if six.PY3:        
            eq_(EasyProcess(u('echo ')+OMEGA).call().stdout, OMEGA)
        else:
            # unicode is not supported
            self.assertRaises(EasyProcessUnicodeError, 
                              lambda :EasyProcess(u('echo ')+OMEGA).call().stdout)

        eq_(EasyProcess(['echo',OMEGA]).call().stdout, OMEGA)
        
        
        
      
        
        
        
        
        
        
        
        
        
        