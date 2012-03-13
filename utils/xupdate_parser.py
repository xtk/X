# imports
import os, sys
from socket import getfqdn
# WRITE XML
from xml.dom import minidom
# GET DATE
import datetime
from time import time, gmtime, strftime
#from cElementTree.SimpleXMLWriter import XMLWriter
import string

# xtk-utils dir
def calculate( buildtype, filename, buildtime ):
  xml = minidom.Document()

  system_info = os.uname()

  updateElement = xml.createElement( 'Update' )
  xml.appendChild(updateElement)

  systeminfo = os.uname()
  fillxml( xml, updateElement, 'BuildName', system_info[0] + '-' + system_info[2]  )
  buildtype = buildtype
  buildstamp = buildtime + '-' + buildtype
  fillxml( xml, updateElement, 'BuildStamp', buildstamp )
  hostname = getfqdn()
  fillxml( xml, updateElement, 'Site', hostname )
  fillxml( xml, updateElement, 'Name', hostname )
  fillxml( xml, updateElement, 'Hostname', hostname )
  fillxml( xml, updateElement, 'StartUpdateTime', str( time() ) )
  fillxml( xml, updateElement, 'UpdateCommand', 'this is a update command' )
  fillxml( xml, updateElement, 'UpdateType', 'this is a update type')
  fillxml( xml, updateElement, 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, updateElement, 'EndUpdateTime', str( time() ))

  f2 = open( 'XTKUpdate.xml', 'w' )
  f2.write( xml.toxml() )
  f2.close()

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )
