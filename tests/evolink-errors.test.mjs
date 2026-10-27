import test from 'node:test';
import assert from 'node:assert/strict';
import { getEvoLinkErrorMessage, describeEvoLinkFailure } from '../api/_lib/evolink-errors.ts';

test('extracts top-level and nested error messages across standard API formats', () => {
  // Top-level FastAPI standard error format: {"detail": "..."}
  assert.equal(getEvoLinkErrorMessage({ detail: 'Bakiye yetersiz veya token süresi doldu' }), 'Bakiye yetersiz veya token süresi doldu');

  // Top-level details array
  assert.equal(getEvoLinkErrorMessage({ details: ['Geçersiz en-boy oranı'] }), 'Geçersiz en-boy oranı');

  // Top-level reason and description
  assert.equal(getEvoLinkErrorMessage({ reason: 'Hassas içerik tespit edildi' }), 'Hassas içerik tespit edildi');
  assert.equal(getEvoLinkErrorMessage({ description: 'Sunucu aşırı yüklü' }), 'Sunucu aşırı yüklü');

  // Standard nested object structures
  assert.equal(getEvoLinkErrorMessage({ error: { message: 'Prompt çok uzun' } }), 'Prompt çok uzun');
  assert.equal(getEvoLinkErrorMessage({ task_info: { failure_reason: 'GPU bellek yetersiz' } }), 'GPU bellek yetersiz');
  assert.equal(getEvoLinkErrorMessage({ status_message: 'İşlem iptal edildi' }), 'İşlem iptal edildi');

  // Direct string input
  assert.equal(getEvoLinkErrorMessage('Direct string error'), 'Direct string error');

  // Fallback when no extractable error exists
  assert.equal(getEvoLinkErrorMessage({}), 'Video generation failed');
  assert.equal(getEvoLinkErrorMessage(null), 'Video generation failed');
  assert.equal(getEvoLinkErrorMessage(undefined, 'Özel fallback'), 'Özel fallback');
});

test('filters out generic gateway errors in favor of specific details', () => {
  // When an upstream gateway wraps a real error with "internal server error"
  const payload = {
    error: 'internal_server_error',
    details: 'Seedance model timeout',
  };
  assert.equal(getEvoLinkErrorMessage(payload), 'Seedance model timeout');
});

test('describeEvoLinkFailure formats context, detail, and taskId accurately', () => {
  const result = describeEvoLinkFailure(
    { detail: 'Yüz tespit edilemedi' },
    'Seedance video üretimi',
    'task-abc-123',
  );
  assert.equal(result, 'Seedance video üretimi: Yüz tespit edilemedi (Task: task-abc-123)');

  // Generic error format
  const genericResult = describeEvoLinkFailure(
    { error: 'internal_server_error' },
    'Seedance video üretimi',
    'task-abc-123',
  );
  assert.ok(genericResult.includes('The video provider returned an internal error without a specific reason.'));
  assert.ok(genericResult.includes('task-abc-123'));
});
