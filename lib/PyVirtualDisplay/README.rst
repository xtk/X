pyvirtualdisplay is a python wrapper for Xvfb_, Xephyr_ and Xvnc_


Links:
 * home: https://github.com/ponty/PyVirtualDisplay
 * documentation: http://ponty.github.com/PyVirtualDisplay


Features:
 - python wrapper
 - back-ends: Xvfb_, Xephyr_, Xvnc_
 - supported python versions: 2.5, 2.6, 2.7, 3.1, 3.2, PyPy
 
.. warning:: at least one back-end should be installed
 
Known problems:
 - only a few back-end options are supported
 
Possible applications:
 * GUI testing
 * automatic GUI screenshot

Basic usages
============

Start Xephyr::

    from pyvirtualdisplay import Display
    xephyr=Display(visible=1, size=(320, 240)).start()

Create screenshot of xmessage with Xvfb::

    from easyprocess import EasyProcess
    from pyvirtualdisplay.smartdisplay import SmartDisplay
    with SmartDisplay(visible=0, bgcolor='black') as disp:
        with EasyProcess('xmessage hello'):
            img = disp.waitgrab()
    img.show()

Installation
============

General
--------

 * install Xvfb_ or Xephyr_ or Xvnc_.
 * install pip_
 * optional: pyscreenshot_ and PIL_ should be installed for ``smartdisplay`` submodule
 * install the program::

    # as root
    pip install pyvirtualdisplay

Ubuntu
----------
::

    sudo apt-get install python-pip
    sudo apt-get install xvfb
    sudo apt-get install xserver-xephyr
    sudo apt-get install tightvncserver
    sudo pip install pyvirtualdisplay
    # optional
    sudo apt-get install python-imaging
    sudo apt-get install scrot
    sudo pip install pyscreenshot


Uninstall
----------

::

    # as root
    pip uninstall pyvirtualdisplay


.. _setuptools: http://peak.telecommunity.com/DevCenter/EasyInstall
.. _pip: http://pip.openplans.org/
.. _Xvfb: http://en.wikipedia.org/wiki/Xvfb
.. _Xephyr: http://en.wikipedia.org/wiki/Xephyr
.. _pyscreenshot: https://github.com/ponty/pyscreenshot
.. _PIL: http://www.pythonware.com/library/pil/
.. _Xvnc: http://www.hep.phy.cam.ac.uk/vnc_docs/xvnc.html

