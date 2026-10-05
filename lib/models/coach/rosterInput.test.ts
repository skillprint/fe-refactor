import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRosterLines } from './rosterInput';

test('reads the shapes a coach pastes', () => {
  assert.deepEqual(
    parseRosterLines(
      [
        'Ada Lovelace, ada@lincoln.test',
        'bo@lincoln.test, Bo Diaz',
        'Cy Young <cy@lincoln.test>',
        'Dee\tdee@lincoln.test',
        'eve@lincoln.test',
      ].join('\n'),
    ),
    [
      { email: 'ada@lincoln.test', displayName: 'Ada Lovelace' },
      { email: 'bo@lincoln.test', displayName: 'Bo Diaz' },
      { email: 'cy@lincoln.test', displayName: 'Cy Young' },
      { email: 'dee@lincoln.test', displayName: 'Dee' },
      { email: 'eve@lincoln.test' },
    ],
  );
});

test('skips blank lines and keeps a line with no email for the backend to refuse', () => {
  assert.deepEqual(parseRosterLines('\n  \nJust A Name\r\n'), [{ email: 'Just A Name' }]);
});
