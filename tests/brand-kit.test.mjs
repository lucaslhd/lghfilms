import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';

test('brand gallery points to existing nonempty previews and downloadable files', () => {
  const root = resolve('public/brand-assets/v1');
  const manifest = JSON.parse(readFileSync(resolve(root, 'assets-manifest.json'), 'utf8'));
  const ids = new Set();
  for (const asset of manifest.assets) {
    assert.ok(!ids.has(asset.id)); ids.add(asset.id);
    assert.ok(asset.label && asset.group && asset.usage);
    for (const file of [asset.preview, ...asset.files]) {
      const path = resolve(root, file);
      assert.ok(path.startsWith(root + sep));
      assert.ok(statSync(path).size > 0, file);
    }
  }
  assert.equal(manifest.stats.pieces, manifest.assets.length);
  assert.equal(manifest.stats.downloads, manifest.assets.reduce((sum, asset) => sum + asset.files.length, 0));
  assert.equal(readFileSync('public/brand-assets/lgh-brand-kit-v1.zip').subarray(0, 4).toString('hex'), '504b0304');
  assert.ok(readFileSync('dist/brandbook/index.html', 'utf8').includes('id="assets"'));
});
