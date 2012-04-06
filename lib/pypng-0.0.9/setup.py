# $URL: http://pypng.googlecode.com/svn/trunk/setup.py $
# $Rev: 186 $

# PyPNG setup.py
# This is the setup.py script used by disutils.

# You can install the png module into your Python distribution with:
# python setup.py install
# You can also do other standard disutil type things, but you can refer
# to the disutil documentation for that.

# This script is also imported as a module by the Sphinx conf.py script
# in the man directory, so that this file forms a single source for
# metadata.

conf = dict(
    name='pypng',
    version='0.0.9',
    description='Pure Python PNG image encoder/decoder',
    long_description="""
PyPNG allows PNG image files to be read and written using pure Python.

It's available from Google code:
http://code.google.com/p/pypng/downloads/list

Documentation is kindly hosted at python.org:
http://packages.python.org/pypng/
(and also available in the download tarball).
""",
    author='David Jones',
    author_email='drj@pobox.com',
    url='http://code.google.com/p/pypng/',
    package_dir={'':'code'},
    py_modules=['png'],
    classifiers=[
      'Topic :: Multimedia :: Graphics',
      'Topic :: Software Development :: Libraries :: Python Modules',
      'Programming Language :: Python',
      'Programming Language :: Python :: 2.3',
      'License :: OSI Approved :: MIT License',
      'Operating System :: OS Independent',
      ],
    )
conf['download_url'] = \
  'http://pypng.googlecode.com/files/%(name)s-%(version)s.tar.gz' % conf

if __name__ == '__main__':
    from distutils.core import setup
    setup(**conf)
