from path import path
from setuptools import find_packages
import logging
import sphinx
import sys

def read_project_version(py=None, where='.', exclude=['bootstrap', 'pavement', 'doc', 'docs', 'test', 'tests', ]):
    if not py:
        py = path(where) / find_packages(where=where, exclude=exclude)[0]
    py = path(py)
    if py.isdir():
        py = py / '__init__.py'
    __version__ = None
    for line in py.lines():
        if '__version__' in line:
            exec line
            break
    return __version__

release = read_project_version(where='..')

project = 'PyVirtualDisplay'
author = 'ponty'
copyright = '2011, ponty'

#logging.basicConfig(level=logging.DEBUG)

# Extension
extensions = [
     # -*-Extensions: -*-
     'sphinx.ext.autodoc',
     'sphinxcontrib.programoutput',
     'sphinxcontrib.programscreenshot',
     'sphinx.ext.graphviz',
     #'sphinx.ext.autosummary',
     'sphinx.ext.intersphinx',
    ]
intersphinx_mapping = {'http://docs.python.org/': None}

# Source
master_doc = 'index'
templates_path = ['_templates']
source_suffix = '.rst'
exclude_trees = []
pygments_style = 'sphinx'

# html build settings
html_theme = 'default'
html_static_path = ['_static']

# htmlhelp settings
htmlhelp_basename = '%sdoc' % project

# latex build settings
latex_documents = [
    ('index', '%s.tex' % project, u'%s Documentation' % project,
    author, 'manual'),
]


# remove blank pages from pdf
# http://groups.google.com/group/sphinx-dev/browse_thread/thread/92e19267d095412d/d60dcba483c6b13d
latex_font_size = '10pt,oneside' 

latex_elements=dict(
                    papersize='a4paper',
                    )
 
