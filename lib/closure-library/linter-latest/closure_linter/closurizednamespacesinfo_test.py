#!/usr/bin/env python
#
# Copyright 2010 The Closure Linter Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Unit tests for ClosurizedNamespacesInfo."""



import unittest as googletest
from closure_linter import closurizednamespacesinfo
from closure_linter import javascripttokenizer
from closure_linter import javascripttokens

# Shorthand
Token = javascripttokens.JavaScriptToken
Type = javascripttokens.JavaScriptTokenType


class ClosurizedNamespacesInfoTest(googletest.TestCase):
  """Tests for ClosurizedNamespacesInfo."""

  __test_cases = {
      'package.CONSTANT': 'package',
      'package.methodName': 'package',
      'package.subpackage.methodName': 'package.subpackage',
      'package.subpackage.methodName.apply': 'package.subpackage',
      'package.ClassName.something': 'package.ClassName',
      'package.ClassName.Enum.VALUE.methodName': 'package.ClassName.Enum',
      'package.ClassName.CONSTANT': 'package.ClassName',
      'package.namespace.CONSTANT.methodName': 'package.namespace',
      'package.ClassName.inherits': 'package.ClassName',
      'package.ClassName.apply': 'package.ClassName',
      'package.ClassName.methodName.apply': 'package.ClassName',
      'package.ClassName.methodName.call': 'package.ClassName',
      'package.ClassName.prototype.methodName': 'package.ClassName',
      'package.ClassName.privateMethod_': 'package.ClassName',
      'package.className.privateProperty_': 'package.className',
      'package.className.privateProperty_.methodName': 'package.className',
      'package.ClassName.PrivateEnum_': 'package.ClassName.PrivateEnum_',
      'package.ClassName.prototype.methodName.apply': 'package.ClassName',
      'package.ClassName.property.subProperty': 'package.ClassName',
      'package.className.prototype.something.somethingElse': 'package.className'
  }

  def testGetClosurizedNamespace(self):
    """Tests that the correct namespace is returned for various identifiers."""
    namespaces_info = closurizednamespacesinfo.ClosurizedNamespacesInfo(
        closurized_namespaces=['package'], ignored_extra_namespaces=[])
    for identifier, expected_namespace in self.__test_cases.items():
      actual_namespace = namespaces_info.GetClosurizedNamespace(identifier)
      self.assertEqual(
          expected_namespace,
          actual_namespace,
          'expected namespace "' + str(expected_namespace) +
          '" for identifier "' + str(identifier) + '" but was "' +
          str(actual_namespace) + '"')

  def testIgnoredExtraNamespaces(self):
    """Tests that ignored_extra_namespaces are ignored."""
    token = self._GetRequireTokens('package.Something')
    namespaces_info = closurizednamespacesinfo.ClosurizedNamespacesInfo(
        closurized_namespaces=['package'],
        ignored_extra_namespaces=['package.Something'])

    self.assertFalse(namespaces_info.IsExtraRequire(token),
                     'Should be valid since it is in ignored namespaces.')

    namespaces_info = closurizednamespacesinfo.ClosurizedNamespacesInfo(
        ['package'], [])

    self.assertTrue(namespaces_info.IsExtraRequire(token),
                    'Should be invalid since it is not in ignored namespaces.')

  def _GetRequireTokens(self, namespace):
    """Returns a list of tokens for a goog.require of the given namespace."""
    line_text = 'goog.require(\'' + namespace + '\');\n'
    return javascripttokenizer.JavaScriptTokenizer().TokenizeFile([line_text])

if __name__ == '__main__':
  googletest.main()

