import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cmsRoot = path.resolve(__dirname, '..');
const frontendRoot = path.resolve(cmsRoot, '..', 'frontend');
const cmsSrc = path.join(cmsRoot, 'src');

const SHARED_DIRS = ['components', 'config', 'context', 'i18n', 'lib', 'types'];

for (const dir of SHARED_DIRS) {
  const targetRel = path.join('..', '..', 'frontend', 'src', dir);
  const linkPath = path.join(cmsSrc, dir);
  const absTarget = path.join(frontendRoot, 'src', dir);

  if (!fs.existsSync(absTarget)) {
    console.warn(`[ensure-shared] Warning: target ${absTarget} does not exist.`);
    continue;
  }

  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const currentTarget = fs.readlinkSync(linkPath);
      if (currentTarget !== targetRel && !fs.existsSync(linkPath)) {
        fs.unlinkSync(linkPath);
        fs.symlinkSync(targetRel, linkPath, 'dir');
      }
    }
  } catch {
    // Link does not exist yet — create symlink
    fs.symlinkSync(targetRel, linkPath, 'dir');
    console.log(`[ensure-shared] Linked src/${dir} -> ${targetRel}`);
  }
}

// Ensure ../frontend/node_modules is available when resolving shared files on Vercel
const cmsNodeModules = path.join(cmsRoot, 'node_modules');
const frontendNodeModules = path.join(frontendRoot, 'node_modules');

if (fs.existsSync(cmsNodeModules) && !fs.existsSync(frontendNodeModules)) {
  try {
    fs.symlinkSync(cmsNodeModules, frontendNodeModules, 'dir');
    console.log('[ensure-shared] Linked ../frontend/node_modules -> web-cms/node_modules');
  } catch (err) {
    console.warn('[ensure-shared] Could not link ../frontend/node_modules:', err.message);
  }
}
