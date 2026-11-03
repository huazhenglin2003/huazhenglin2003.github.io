// Optional asset build. The prebuilt PNG/GIF in dist/ need no build for deployment.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = mkdtempSync(path.join(tmpdir(), 'koromon-sleep-'));
const run = (args) => {
  const result = spawnSync('convert', args, { encoding: 'utf8' });
  if (result.error) throw new Error('需要 ImageMagick 的 convert 命令才能重新制作 GIF；现成素材可以直接使用。');
  if (result.status !== 0) throw new Error(result.stderr || 'ImageMagick conversion failed.');
  return result.stdout;
};
try {
  const source = path.join(root, 'design/koromon-sleep-source.png');
  const still = path.join(root, 'dist/assets/koromon-sleep.png');
  const animation = path.join(root, 'dist/assets/koromon-sleep.gif');
  const trimmed = path.join(staging, 'trimmed.png');
  // Ignore almost-transparent generation noise when locating the actual silhouette.
  const bounds = run([source, '-alpha', 'extract', '-threshold', '10%', '-trim', '-format', '%wx%h%O', 'info:']).trim();
  run([source, '-crop', bounds, '+repage', '-resize', '150x112', trimmed]);
  run(['-size', '160x160', 'xc:none', trimmed, '-gravity', 'south', '-geometry', '+0+26', '-composite', still]);

  const frames = [];
  for (let index = 0; index < 32; index++) {
    const breath = (1 - Math.cos(index / 32 * Math.PI * 2)) / 2;
    const sx = 1 - breath * .012;
    const sy = 1 + breath * .038;
    const tx = 80 * (1 - sx);
    const ty = 134 * (1 - sy) - breath * .35;
    const frame = path.join(staging, `frame-${String(index).padStart(2, '0')}.png`);
    run([still, '-virtual-pixel', 'transparent', '-define', 'distort:viewport=160x160+0+0',
      '-distort', 'AffineProjection', [sx, 0, 0, sy, tx, ty].join(','), '+repage', frame]);
    frames.push(frame);
  }
  run(['-delay', '8', '-dispose', 'background', ...frames, '-alpha', 'on', '-channel', 'A', '-threshold', '50%', '+channel',
    '+dither', '-colors', '192', '-loop', '0', '-layers', 'Optimize', animation]);
  console.log('已生成：dist/assets/koromon-sleep.png、koromon-sleep.gif（32 帧 / 2.56 秒循环）。');
} finally {
  rmSync(staging, { recursive: true, force: true });
}
