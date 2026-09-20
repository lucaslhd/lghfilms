import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execSync } from 'node:child_process';

const FOLDERS = {
  photography: 'C:\\Users\\colorview\\Documents\\NOVO SITE\\FOTOGRÁFIA',
  fia: 'C:\\Users\\colorview\\Documents\\NOVO SITE\\FIA BUSINESS SCHOOL',
  corenet: 'C:\\Users\\colorview\\Documents\\NOVO SITE\\CORENET GLOBAL CHAPTER BRAZIL',
  ir: 'C:\\Users\\colorview\\Documents\\NOVO SITE\\IR - INJERSOLL RAND',
};

const OUTPUT_DIRS = {
  photography: 'public/media/photography',
  fia: 'public/media/design/fia',
  corenet: 'public/media/design/corenet',
  ir: 'public/media/design/ir',
};

for (const dir of Object.values(OUTPUT_DIRS)) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function processFolder(key, maxWidth = 1600, quality = 82) {
  const srcDir = FOLDERS[key];
  const outDir = OUTPUT_DIRS[key];
  if (!existsSync(srcDir)) {
    console.warn(`Source directory not found: ${srcDir}`);
    return [];
  }

  const files = readdirSync(srcDir)
    .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()))
    .sort();

  console.log(`Processing ${key}: ${files.length} files found...`);
  const manifest = [];

  files.forEach((file, index) => {
    const srcFile = join(srcDir, file);
    const num = String(index + 1).padStart(2, '0');
    const outName = `${key}-${num}.webp`;
    const outFile = join(outDir, outName);

    // Convert and optimize using ffmpeg
    const cmd = `ffmpeg -y -i "${srcFile}" -vf "scale='min(${maxWidth},iw)':-2" -quality ${quality} "${outFile}"`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      manifest.push({
        id: `${key}-${num}`,
        name: outName,
        url: `/${outDir.replace('public/', '')}/${outName}`,
        original: file
      });
    } catch (err) {
      console.error(`Failed to process ${srcFile}:`, err.message);
    }
  });

  return manifest;
}

const photoManifest = processFolder('photography', 1600, 84);
const fiaManifest = processFolder('fia', 1400, 82);
const corenetManifest = processFolder('corenet', 1400, 82);
const irManifest = processFolder('ir', 1400, 82);

console.log('Processed totals:');
console.log(`Photography: ${photoManifest.length}`);
console.log(`FIA: ${fiaManifest.length}`);
console.log(`CoreNet: ${corenetManifest.length}`);
console.log(`IR: ${irManifest.length}`);
