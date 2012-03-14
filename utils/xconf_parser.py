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

  siteElement = xml.createElement( 'Site' )
  systeminfo = os.uname()
  siteElement.setAttribute( 'BuildName', system_info[0] + '-' + system_info[2] )

  hostname = getfqdn()

  buildtype = buildtype
  buildstamp = buildtime + '-' + buildtype
  siteElement.setAttribute( 'BuildStamp', buildstamp )
  siteElement.setAttribute( 'Name', hostname )
  siteElement.setAttribute( 'Hostname', hostname )
  # generator

  xml.appendChild( siteElement )


  confElement = xml.createElement( 'Configure' )
  siteElement.appendChild( confElement )

  fillxml( xml, confElement, 'StartDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, confElement, 'StartConfigureTime', str( time() ) )
  # to correct
  fillxml( xml, confElement, 'ConfigureCommand', 'this is a configuration command' )
  fillxml( xml, confElement, 'Log', '-- no configuration requiered in XTK' )
  fillxml( xml, confElement, 'ConfigureStatus', '0' )
  fillxml( xml, confElement, 'EndDateTime', strftime( "%b %d %H:%M %Z", gmtime() ) )
  fillxml( xml, confElement, 'EndConfigureTime', str( time() ))
  # to correct
  fillxml( xml, confElement, 'ElapsedMinutes', '0' )

  f2 = open( 'XTKConf.xml', 'w' )
  f2.write( xml.toxml() )
  f2.close()

def fillxml( xml, parent, elementname, content ):
  element = xml.createElement( elementname )
  parent.appendChild( element )
  elementcontent = xml.createTextNode( content )
  element.appendChild( elementcontent )
