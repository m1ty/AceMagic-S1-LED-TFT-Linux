// Рендер seg_clock в PNG через canvas из s1panel. Запуск на сервере:
//   node render_seg.js /path/to/s1panel /tmp/seg.png "12:47" [skew] [glow]
const path = require('path');
const root = process.argv[2];
const { createCanvas, loadImage } = require(path.join(root, 'node_modules/canvas'));
const w = require('../../../widgets/seg_clock.js');
(async () => {
  const c = createCanvas(320, 170), ctx = c.getContext('2d');
  ctx.fillStyle = '#06080f'; ctx.fillRect(0, 0, 320, 170);
  try { ctx.drawImage(await loadImage(path.join(root, 'themes/clock/bg.png')), 0, 0); } catch (e) {}
  const cfg = { rect: { x: 0, y: 17, width: 320, height: 96 }, color: '#3df0ff', off_color: '#0f2b36',
                digit_height: 96, thickness: 13, skew: Number(process.argv[5] || 0), glow: Number(process.argv[6] || 0) };
  await w.draw(ctx, process.argv[4] || '12:47', 0, 0, cfg);
  require('fs').writeFileSync(process.argv[3], c.toBuffer('image/png'));
})();
