// Package the generated 4 × 2 keyframe sheet as a transparent, looping GIF.
// The checked-in GIF and still work directly; this script is only for rebuilding.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = mkdtempSync(path.join(tmpdir(), 'big-fat-fish-rice-'));
const run = (args) => {
  const result = spawnSync('convert', args, { encoding: 'utf8' });
  if (result.error) throw new Error('重新导出吃饭 GIF 需要 ImageMagick 的 convert；已生成的 GIF 可直接使用。');
  if (result.status !== 0) throw new Error(result.stderr || 'GIF conversion failed.');
  return result.stdout;
};

try {
  const source = path.join(root, 'design/big-fat-fish-rice-sheet.png');
  const [width, height] = run([source, '-format', '%w %h', 'info:']).trim().split(/\s+/).map(Number);
  if (Math.abs(width / height - 2) > .02) throw new Error('吃饭帧图应为 4 列 × 2 行、宽高比 2:1。');
  const cell = Math.ceil(Math.max(width / 4, height / 2));
  const sheet = path.join(staging, 'sheet.png');
  // Round fractional cell boundaries once, preserving the sheet's aspect ratio.
  run([source, '-resize', `${cell * 4}x${cell * 2}!`, sheet]);
  const frames = [];
  for (let index = 0; index < 8; index++) {
    const frame = path.join(staging, `frame-${index}.png`);
    run([sheet, '-crop', `${cell}x${cell}+${index % 4 * cell}+${Math.floor(index / 4) * cell}`, '+repage',
      '-resize', '192x192', '-background', 'none', '-gravity', 'south', '-extent', '192x216',
      '-channel', 'A', '-fx', 'u<0.2?0:u', '+channel', '-strip', frame]);
    frames.push(frame);
  }
  const still = path.join(root, 'dist/assets/deepseek/eating-rice.png');
  const animation = path.join(root, 'dist/assets/deepseek/eating-rice.gif');
  copyFileSync(frames[4], still);
  const delays = [24, 18, 18, 18, 36, 30, 22, 26];
  run(['-dispose', 'background', ...frames.flatMap((frame, index) => ['-delay', String(delays[index]), frame]),
    '-alpha', 'on', '-channel', 'A', '-threshold', '50%', '+channel', '+dither', '-colors', '224',
    '-loop', '0', '-layers', 'Optimize', animation]);
  console.log('已生成 eating-rice.gif 与 eating-rice.png：192×216，8 帧，1.92 秒透明循环。');
} finally {
  rmSync(staging, { recursive: true, force: true });
}
