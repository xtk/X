'''
Easy to use python subprocess interface.
'''

from easyprocess.unicodeutil import split_command, unidecode, uniencode
import logging
import os.path
import platform
import signal
import subprocess
import sys
import tempfile
import threading
import time
import ConfigParser

__version__ = '0.1.4'

log = logging.getLogger(__name__)
#log=logging

log.debug('version=' + __version__)

CONFIG_FILE = '.easyprocess.cfg'
SECTION_LINK = 'link'
POLL_TIME = 0.1
USE_POLL = 0
    
class EasyProcessError(Exception):
    """  
    """
    def __init__(self, easy_process, msg=''):
        self.easy_process = easy_process
        self.msg = msg
    def __str__(self):
        return self.msg + ' ' + repr(self.easy_process)
        
template = '''cmd=%s
OSError=%s  
Program install error! '''
class EasyProcessCheckInstalledError(Exception):
    """This exception is raised when a process run by check() returns
    a non-zero exit status or OSError is raised.  
    """
    def __init__(self, easy_process):
        self.easy_process = easy_process
    def __str__(self):
        msg = template% (self.easy_process.cmd,
                         self.easy_process.oserror,
                          )
        if self.easy_process.url:
            msg += '\nhome page: ' + self.easy_process.url
        if platform.dist()[0].lower() == 'ubuntu':
            if self.easy_process.ubuntu_package:
                msg += '\nYou can install it in terminal:\n'
                msg += 'sudo apt-get install %s' % self.easy_process.ubuntu_package
        return msg

class EasyProcess():
    '''
    .. module:: easyprocess
    
    simple interface for :mod:`subprocess` 

    shell is not supported (shell=False)
    
    .. warning::

      unicode is supported only for string list command (Python2.x) 
      (check :mod:`shlex` for more information)
        
    :param cmd: string ('ls -l') or list of strings (['ls','-l']) 
    :param cwd: working directory
    :param use_temp_files: use temp files instead of pipes for 
                           stdout and stderr,
                           pipes can cause deadlock in some cases
                           (see unit tests)
    '''
    config = None
    
    def __init__(self, cmd, ubuntu_package=None, url=None, cwd=None, use_temp_files=True):
        self.use_temp_files = use_temp_files
        self._outputs_processed = False

        self.popen = None
        self.stdout = None
        self.stderr = None
        self._stdout_file = None
        self._stderr_file = None
        self.url = url
        self.ubuntu_package = ubuntu_package
        self.is_started = False
        self.oserror = None
        self.cmd_param = cmd
        self._thread = None
#        self.max_bytes_to_log = max_bytes_to_log
        self._stop_thread = False
        self.timeout_happened = False
        self.cwd = cwd
        cmd = split_command(cmd)
        self.cmd = cmd
        self.cmd_as_string = ' '.join(self.cmd) # TODO: not perfect
        
        log.debug('param: "%s" command: %s ("%s")' % (self.cmd_param, self.cmd, self.cmd_as_string))
        
        if not len(cmd):
            raise EasyProcessError(self, 'empty command!')
        
        if not Proc.config:
            conf_file = os.path.join(os.path.expanduser('~'), CONFIG_FILE)
            log.debug('reading config: %s' % (conf_file))
            Proc.config = ConfigParser.RawConfigParser()
            Proc.config.read(conf_file)
        
        self.alias = None
        try:
            self.alias = Proc.config.get(SECTION_LINK, self.cmd[0])
        except ConfigParser.NoSectionError:
            pass
        except ConfigParser.NoOptionError:
            pass
        
        if self.alias:
            log.debug('alias found: %s' % (self.alias))
            self.cmd[0] = self.alias

    def __repr__(self):
        msg = '<%s cmd_param=%s alias={alias} cmd=%s ({scmd}) oserror=%s returncode=%s stdout="%s" stderr="%s" timeout=%s>'% (
                            self.__class__.__name__,
                            self.cmd_param,
                            self.cmd,
                            self.oserror,
#                            alias=self.alias,
                            self.return_code,
                            self.stdout,
                            self.stderr,
#                            scmd=' '.join(self.cmd),
                            self.timeout_happened,
                            )
        return msg
        
    @property
    def pid(self):
        '''
        PID (:attr:`subprocess.Popen.pid`)

        :rtype: int
        '''
        if self.popen:
            return self.popen.pid
        
    @property
    def return_code(self):
        '''
        returncode (:attr:`subprocess.Popen.returncode`)

        :rtype: int
        '''
        if self.popen:
            return self.popen.returncode

    def check(self, return_code=0):
        '''
        Run command with arguments. Wait for command to complete.
        If the exit code was as expected and there is no exception then return, 
        otherwise raise EasyProcessError.
        
        :param return_code: int, expected return code
        :rtype: self
        '''
#        try:
#            ret = self.call().return_code
#            ok = ret == return_code
#        except Exception , e:
#            log.debug('OSError exception:' + str(oserror))
#            ok = False
#            self.oserror = oserror

        ret = self.call().return_code
        ok = ret == return_code
        if not ok:
            raise EasyProcessError(self, 'check error, return code is not zero!')
        return self

    def check_installed(self):
        '''
        Used for testing if program is installed.
        
        Run command with arguments. Wait for command to complete.
        If OSError raised, then raise :class:`EasyProcessCheckInstalledError`
        with information about program installation
        
        :param return_code: int, expected return code
        :rtype: self
        '''
        try:
            self.call()
        except Exception:
            #log.debug('exception:' + str(e))
            #self.oserror = oserror
            raise EasyProcessCheckInstalledError(self)
        return self
    
    def call(self, timeout=None):
        '''
        Run command with arguments. Wait for command to complete.
        
        same as:
         1. :meth:`start`
         2. :meth:`wait`
         3. :meth:`stop`
        
        :rtype: self
        '''
        self.start().wait(timeout=timeout)
        if self.is_alive():
            self.stop()
        return self

    def start(self):
        '''
        start command in background and does not wait for it
        
        
        :rtype: self
        '''
        if self.is_started:
            raise EasyProcessError(self, 'process was started twice!')

        if self.use_temp_files:
            self._stdout_file = tempfile.TemporaryFile(prefix='stdout_')
            self._stderr_file = tempfile.TemporaryFile(prefix='stderr_')
            stdout = self._stdout_file
            stderr = self._stderr_file
            
        else:
            stdout = subprocess.PIPE
            stderr = subprocess.PIPE

        cmd = list(map(uniencode, self.cmd))
        
        try:     
            self.popen = subprocess.Popen(cmd,
                                  stdout=stdout,
                                  stderr=stderr,
                                  #shell=1,
                                  cwd=self.cwd,
                                  )
        except OSError , oserror:
            log.debug('OSError exception:%s' % (oserror))
            self.oserror = oserror
            raise EasyProcessError(self, 'start error')
        self.is_started = True
        log.debug('process was started (pid=%s)' % (str(self.pid),))

#        def target():
#            self._wait4process()
            
#        def shutdown():
#            self._stop_thread = True
#            self._thread.join()
        
#        self._thread = threading.Thread(target=target)
#        self._thread.daemon = 1
#        self._thread.start()
#        atexit.register(shutdown)
        
        return self


    def is_alive(self):
        '''
        poll process using :meth:`subprocess.Popen.poll`
        
        :rtype: bool
        '''
        if self.popen:
            return self.popen.poll() is None
        else:
            return False
        
    def wait(self, timeout=None):
        '''
        Wait for command to complete.
        
        Timeout:
         - discussion: http://stackoverflow.com/questions/1191374/subprocess-with-timeout
         - implementation: threading
         
        :rtype: self
        '''
            
        if timeout is not None:
            if not self._thread:
                self._thread = threading.Thread(target=self._wait4process)
                self._thread.daemon = 1
                self._thread.start()
                
        if self._thread:
            self._thread.join(timeout=timeout)
            self.timeout_happened = self.timeout_happened or self._thread.isAlive()
        else:
            # no timeout and no existing thread
            self._wait4process()

        return self
                
    def _wait4process(self):
        if self._outputs_processed:
            return

        def remove_ending_lf(s):
            if s.endswith('\n'):
                return s[:-1]
            else:
                return s
                   
        if self.popen:
            if self.use_temp_files:    
                if USE_POLL:    
                    while 1:
                        if self.popen.poll() is not None:
                            break
                        if self._stop_thread:
                            return
                        time.sleep(POLL_TIME)

                else:
                    # wait() blocks process, timeout not possible
                    self.popen.wait()
                
                self._outputs_processed = True
                self._stdout_file.seek(0)            
                self._stderr_file.seek(0)            
                self.stdout = self._stdout_file.read()
                self.stderr = self._stderr_file.read()
                
                self._stdout_file.close()
                self._stderr_file.close()
            else:
                # This will deadlock when using stdout=PIPE and/or stderr=PIPE 
                # and the child process generates enough output to a pipe such 
                # that it blocks waiting for the OS pipe buffer to accept more data. 
                # Use communicate() to avoid that.
                #self.popen.wait()
                #self.stdout = self.popen.stdout.read()
                #self.stderr = self.popen.stderr.read()
                
                # communicate() blocks process, timeout not possible
                self._outputs_processed = True
                (self.stdout, self.stderr) = self.popen.communicate()
            log.debug('process has ended')
            self.stdout = remove_ending_lf(unidecode(self.stdout))
            self.stderr = remove_ending_lf(unidecode(self.stderr))
            
            log.debug('return code=' + str(self.return_code))
#            def limit_str(s):
#                if len(s) > self.max_bytes_to_log:
#                    warn = '[middle of output was removed, max_bytes_to_log=%s]'%(self.max_bytes_to_log)
#                    s = s[:self.max_bytes_to_log / 2] + warn + s[-self.max_bytes_to_log / 2:]
#                return s
            log.debug('stdout=' + (self.stdout))
            log.debug('stderr=' + (self.stderr))
            
    def stop(self):
        '''
        Kill process
        and wait for command to complete.
        
        same as:
         1. :meth:`sendstop`
         2. :meth:`wait`
        
        :rtype: self
        '''
        return self.sendstop().wait()

    def sendstop(self):
        '''
        Kill process (:meth:`subprocess.Popen.terminate`).
        Do not wait for command to complete.
        
        :rtype: self
        '''
        if not self.is_started:
            raise EasyProcessError(self, 'process was not started!')
        
        log.debug('stopping process (pid=%s cmd="%s")' % (str(self.pid), self.cmd))
        if self.popen:
            if self.is_alive():
                log.debug('process is active -> sending SIGTERM')

                try:
                    try:
                        self.popen.terminate()
                    except AttributeError:
                        os.kill(self.popen.pid, signal.SIGKILL)
                except OSError , oserror:
                    log.debug('exception in terminate:%s' %(oserror))
                    
            else:
                log.debug('process was already stopped')
        else:
            log.debug('process was not started')

        return self
    
    def sleep(self, sec):
        '''
        sleeping (same as :func:`time.sleep`)

        :rtype: self
        '''
        time.sleep(sec)

        return self

    def wrap(self, func, delay=0):
        '''
        returns a function which:
         1. start process
         2. call func, save result
         3. stop process
         4. returns result
        
        similar to :keyword:`with` statement
        
        :rtype: 
        '''
        def wrapped():
            self.start()   
            if delay:
                self.sleep(delay)
            x = None
            try:     
                x = func()
            except OSError , oserror:
                log.debug('OSError exception:%s' %(oserror))
                self.oserror = oserror
                raise EasyProcessError(self, 'wrap error!')
            finally:
                self.stop()
            return x
        return wrapped
    
    def __enter__(self):
        '''used by the :keyword:`with` statement'''
        self.start()
        return self
    
    def __exit__(self, *exc_info):
        '''used by the :keyword:`with` statement'''
        self.stop()

def extract_version(txt):
    '''This function tries to extract the version from the help text of any program.
    '''
    words = txt.replace(',', ' ').split()
    version = None
    for x in reversed(words):
        if len(x) > 2:
            if x[0].lower() == 'v':
                x = x[1:]
            if '.' in x and x[0].isdigit():
                version = x
                break
    return version


Proc = EasyProcess
