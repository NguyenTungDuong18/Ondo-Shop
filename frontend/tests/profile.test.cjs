require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { cropGeometry } = require('../src/presentation/features/profile/avatarCrop.ts');
const { axiosClient } = require('../src/infrastructure/http/axiosClient.ts');
const { authRepository } = require('../src/infrastructure/repositories/auth.service.ts');

test('portrait, landscape and square crops stay covered and inside the source at every zoom and edge', () => {
  for (const [width, height] of [[1600, 900], [900, 1600], [800, 800]]) {
    for (const zoom of [1, 1.5, 3]) {
      for (const x of [-10, 0, 10]) for (const y of [-10, 0, 10]) {
        const crop = cropGeometry(width, height, zoom, x, y);
        assert.ok(crop.sourceX >= -1e-8 && crop.sourceY >= -1e-8);
        assert.ok(crop.sourceX + crop.sourceSize <= width + 1e-8);
        assert.ok(crop.sourceY + crop.sourceSize <= height + 1e-8);
        assert.ok(crop.displayWidth >= 1 && crop.displayHeight >= 1);
      }
    }
  }
});

test('profile saves only upload an avatar when FE supplies a new cropped file', async () => {
  const original = axiosClient.put;
  const calls = [];
  axiosClient.put = async (...args) => { calls.push(args); return { data: { success: true, data: { avatarUrl: 'saved' } } }; };
  try {
    const details = { fullName: 'Name', email: 'name@example.test', dateOfBirth: '2000-02-29' };
    await authRepository.updateProfile(details);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], '/api/v1/auth/me');
    const file = new File(['png'], 'avatar.png', { type: 'image/png' });
    await authRepository.updateProfile({ ...details, avatarFile: file });
    assert.equal(calls.length, 3);
    assert.equal(calls[1][1].avatarFile, undefined);
    assert.equal(calls[2][0], '/api/v1/auth/me/avatar');
    assert.equal(calls[2][1].get('file'), file);
    assert.equal(calls[2][2].headers['Content-Type'], undefined);
  } finally { axiosClient.put = original; }
});
