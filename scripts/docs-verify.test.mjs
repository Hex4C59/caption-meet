import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkPrdGate } from './docs-verify-lib.mjs';

const active = (phase, assessment = '') => `## In progress (WIP=1)\n\n| Field | Content |\n|---|---|\n| **ID** | WI-002 |\n| **Phase** | ${phase} |\n${assessment ? `| **PRD assessment** | ${assessment} |\n` : ''}\n## Last session\n`;
const prd = (trace = '| WI-002 | REQ-002 | Acceptance |', requirement = '| REQ-002 | User can see workspace status. | Draft |') => `## Traceability\n${trace}\n## Requirements\n${requirement}\n`;

test('Prepare permits pending PRD assessment', () => {
  assert.deepEqual(checkPrdGate(prd(), active('Prepare', 'pending')), []);
});

test('Build rejects missing or pending assessment', () => {
  for (const assessment of ['', 'pending']) {
    assert.ok(checkPrdGate(prd(), active('Build (approved)', assessment)).some((e) => e.code === 'prd-assessment-missing'));
  }
});

test('technical-only Build does not require a REQ when reason is recorded', () => {
  assert.deepEqual(checkPrdGate(prd('| WI-002 | *(none)* | See ACTIVE |', ''), active('Build', 'technical-only: contract probe, no user-visible behavior')), []);
});

test('user-visible Build requires traceability and linked substantive REQ', () => {
  assert.ok(checkPrdGate(prd('| WI-002 | *(pending)* | — |'), active('Build', 'user-visible: workspace status')).some((e) => e.code === 'prd-trace-missing'));
  assert.ok(checkPrdGate(prd('| WI-002 | REQ-002 | Acceptance |', '| REQ-003 | Other behavior |'), active('Build', 'user-visible: workspace status')).some((e) => e.code === 'prd-requirement-missing'));
  assert.deepEqual(checkPrdGate(prd(), active('Build', 'user-visible: workspace status')), []);
});

test('placeholder REQ rows fail even during Prepare', () => {
  assert.ok(checkPrdGate(prd(undefined, '| REQ-002 | <!-- example --> |'), active('Prepare')).some((e) => e.code === 'prd-placeholder'));
});
