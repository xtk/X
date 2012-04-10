Usage
==================

.. module:: easyprocess

Simple example
---------------

Example program:

.. literalinclude:: ../easyprocess/examples/ver.py

Output:

.. program-output:: python -m easyprocess.examples.ver
    :prompt:


General
--------

.. runblock:: pycon
    
    >>> from easyprocess import EasyProcess
    >>> 
    >>> # Run program, wait for it to complete, get stdout (command is string):
    >>> EasyProcess('python -c "print 3"').call().stdout
    >>> 
    >>> # Run program, wait for it to complete, get stdout (command is list):
    >>> EasyProcess(['python','-c','print 3']).call().stdout
    >>> 
    >>> # Run program, wait for it to complete, get stderr:
    >>> EasyProcess('python --version').call().stderr
    >>> 
    >>> # Run program, wait for it to complete, get return code:
    >>> EasyProcess('python --version').call().return_code
    >>> 
    >>> # Run program, wait 1 second, stop it, get stdout:
    >>> print EasyProcess('ping localhost').start().sleep(1).stop().stdout
    >>> 
    >>> # Unicode support
    >>> EasyProcess(['python','-c','print unichr(0x03A9).encode("utf-8")']).call().stdout
    >>> 

Shell commands
----------------

Shell commands are not supported.

.. warning::

  ``echo`` is a shell command on Windows (there is no echo.exe),
  but it is a program on Linux  

return_code
------------

:attr:`EasyProcess.return_code` is None until 
:func:`EasyProcess.stop` or :func:`EasyProcess.wait` 
is called.


.. runblock:: pycon
    
    >>> from easyprocess import EasyProcess
    >>> 
    >>> # process has finished but no stop() or wait() was called
    >>> print EasyProcess('echo hello').start().sleep(0.5).return_code
    >>> 
    >>> # wait()
    >>> print EasyProcess('echo hello').start().wait().return_code
    >>> 
    >>> # stop() after process has finished
    >>> print EasyProcess('echo hello').start().sleep(0.5).stop().return_code
    >>> 
    >>> # stop() before process has finished
    >>> print EasyProcess('sleep 2').start().stop().return_code
    >>> 
    >>> # same as start().wait().stop()
    >>> print EasyProcess('echo hello').call().return_code

With
-----

By using :keyword:`with` statement the process is started 
and stopped automatically::
    
    from easyprocess import EasyProcess
    with EasyProcess('ping 127.0.0.1') as proc: # start()
        # communicate with proc
        pass
    # stopped
    
Equivalent with::
    
    from easyprocess import EasyProcess
    proc = EasyProcess('ping 127.0.0.1').start()
    try:
        # communicate with proc
        pass
    finally:
        proc.stop()


Timeout
--------

This was implemented with "daemon thread".

"The entire Python program exits when only daemon threads are left."
http://docs.python.org/library/threading.html

.. runblock:: pycon

    >>> from easyprocess import EasyProcess
    >>> # Run ping with  timeout
    >>> print EasyProcess('ping localhost').call(timeout=1).stdout

Logging
--------

Example program:

.. literalinclude:: ../easyprocess/examples/log.py

Output:

.. program-output:: python -m easyprocess.examples.log
    :prompt:

Alias
--------

You can define an alias for EasyProcess calls 
by editing your config file ($HOME/.easyprocess.cfg)
This can be used for:

 * testing different version of the same program
 * redirect calls
 * program path can be defined here. (Installed programs are not in $PATH on Windows) 

start python and print python version::

	>>> from easyprocess import EasyProcess
	>>> EasyProcess('python --version').call().stderr
	'Python 2.6.6'

edit the config file: $HOME/.easyprocess.cfg::

	[link]
	python=/usr/bin/python2.7

restart python and print python version again::

	>>> from easyprocess import EasyProcess
	>>> EasyProcess('python --version').call().stderr
	'Python 2.7.0+'


Replacing existing functions
--------------------------------

Replacing os.system::

    retcode = os.system("ls -l")
    ==>
    p = EasyProcess("ls -l").call()
    retcode = p.return_code
    print p.stdout

Replacing subprocess.call::

    retcode = subprocess.call(["ls", "-l"])
    ==>
    p = EasyProcess(["ls", "-l"]).call()
    retcode = p.return_code
    print p.stdout

    
extract_version
--------------------

.. autofunction:: easyprocess.extract_version

.. runblock:: pycon

    >>> from easyprocess import EasyProcess, extract_version
    >>> print extract_version(EasyProcess('python --version').call().stderr)
    