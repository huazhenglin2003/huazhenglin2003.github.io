import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const read = (file) => readFile(path.join(root, file), 'utf8');
const [source, app, html, baseCss, themeCss, companionCss, companionJs, petCss, petJs, mediaJs] = await Promise.all([read('site-data.js'), read('app.js'), read('index.html'), read('styles.css'), read('theme.css'), read('cursor-companion.css'), read('cursor-companion.js'), read('desk-pet.css'), read('desk-pet.js'), read('asset-previews.js')]);
new vm.Script(app, { filename: 'app.js' });
new vm.Script(companionJs, { filename: 'cursor-companion.js' });
new vm.Script(petJs, { filename: 'desk-pet.js' });
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'site-data.js', timeout: 1000 });
const data = context.window.SITE_DATA;
vm.runInNewContext(mediaJs, context, { filename: 'asset-previews.js', timeout: 1000 });
const media = context.window.ASSET_PREVIEWS?.files || {};
assert(data && typeof data === 'object', 'site-data.js 必须定义 window.SITE_DATA。');
assert(['en', 'zh'].includes(data.settings?.defaultLanguage), 'settings.defaultLanguage 只能为 en 或 zh。');
assert(data.profile?.name, '缺少 profile.name。');
for (const name of ['news', 'publications', 'honors', 'awards', 'service']) assert(Array.isArray(data[name]), `${name} 必须是数组。`);
const nonemptyText = (value) => typeof value === 'string' ? value.trim() : value?.en || value?.zh;
assert(nonemptyText(data.profile.name), 'profile.name 不能为空。');
for (const paper of data.publications) {
  assert(nonemptyText(paper.title), '每篇论文必须填写 title。');
  assert(['accepted', 'preprint'].includes(paper.type), '论文 type 只能为 accepted 或 preprint。');
  assert(Array.isArray(paper.authors), '论文 authors 必须是数组。');
  assert(Array.isArray(paper.links), '论文 links 必须是数组。');
  if (typeof paper.image === 'string' && /\.pdf$/i.test(paper.image)) {
    assert(media[paper.image]?.preview, 'PDF 缩略图未生成，请先运行 node scripts/prepare-media.mjs。');
  }
}
for (const [key, items] of [['news', data.news], ['honors', data.honors], ['awards', data.awards]]) {
  for (const item of items) assert(nonemptyText(item[key === 'news' ? 'text' : 'title']), `${key} 条目缺少正文或标题。`);
}
for (const item of data.service) {
  assert(nonemptyText(item.venue), 'service 条目必须填写 venue（会议、期刊或服务机构）。');
  assert(['conference', 'journal', 'other'].includes(item.category), 'service.category 只能为 conference / journal / other。');
  assert(Array.isArray(item.years), 'service.years 必须是年份数组。');
}
if (data.settings.appearance) {
  const { crestOpacity, crestWatermark, customCursor, cursorTrail, cursorSize, cursorSleepAfter } = data.settings.appearance;
  assert(typeof crestWatermark === 'boolean' && typeof customCursor === 'boolean', '外观开关必须为 true / false。');
  assert(Number.isFinite(crestOpacity) && crestOpacity >= 0 && crestOpacity <= .2, 'crestOpacity 必须为 0 到 0.2 之间的数字。');
  if (cursorTrail !== undefined) assert(typeof cursorTrail === 'boolean', 'cursorTrail 必须为 true / false。');
  if (cursorSize !== undefined) assert(Number.isFinite(cursorSize) && cursorSize >= 36 && cursorSize <= 72, 'cursorSize 必须为 36–72 之间的数字。');
  if (cursorSleepAfter !== undefined) assert(Number.isFinite(cursorSleepAfter) && cursorSleepAfter >= 1000 && cursorSleepAfter <= 60000, 'cursorSleepAfter 必须为 1000–60000 毫秒之间的数字。');
}
if (data.settings.deskPet) {
  const { enabled, idleAfter, speechDuration } = data.settings.deskPet;
  assert(typeof enabled === 'boolean', 'deskPet.enabled 必须为 true / false。');
  assert(Number.isFinite(idleAfter) && idleAfter >= 1000 && idleAfter <= 600000, 'deskPet.idleAfter 必须为 1000–600000 毫秒。');
  assert(Number.isFinite(speechDuration) && speechDuration >= 1000 && speechDuration <= 30000, 'deskPet.speechDuration 必须为 1000–30000 毫秒。');
}

// 检查实际配置中的本地图片、简历、论文 PDF 等，避免上传后才出现 404。
const references = [];
function visit(value, field = '') {
  if (Array.isArray(value)) { value.forEach((entry) => visit(entry)); return; }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => visit(entry, ['image', 'url', 'link', 'affiliationUrl'].includes(field) ? field : key));
    return;
  }
  if (!['image', 'url', 'link', 'affiliationUrl'].includes(field) || !value) return;
  assert(typeof value === 'string', `${field} 必须是字符串或双语文本。`);
  const url = value.trim();
  assert(!/[\u0000-\u001f\u007f\\]/.test(url) && !url.startsWith('//'), `请使用完整的 https:// 链接或相对路径：${field}`);
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    assert(/^https?:\/\//i.test(url) || (field !== 'image' && /^mailto:/i.test(url)), `不支持的链接协议：${field}`);
    return;
  }
  if (!url.startsWith('#') && !url.startsWith('?')) references.push(url);
}
visit(data);
Object.values(media).forEach((item) => references.push(item.preview));
for (const [source, item] of Object.entries(media)) {
  const digest = createHash('sha256').update(await readFile(path.join(root, source))).digest('hex');
  assert.equal(digest, item.sha256, `媒体原件已改变，请运行 node scripts/prepare-media.mjs 更新预览：${source}`);
}
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^[a-z]+:/i.test(match[1])) references.push(match[1]);
}
for (const match of (baseCss + themeCss + companionCss + petCss).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
  if (!/^(?:https?:|data:)/i.test(match[1])) references.push(match[1]);
}
assert(!/cursor\s*:\s*(?:none|url\()/i.test(baseCss + themeCss + companionCss), '滚球兽应作为跟随挂件，不能隐藏或替换原生鼠标。');
for (const reference of new Set(references)) {
  assert(!reference.startsWith('/'), `请使用相对路径以兼容 GitHub 项目主页：${reference}`);
  const resolved = path.resolve(root, decodeURIComponent(reference.split(/[?#]/)[0]));
  const relative = path.relative(root, resolved);
  assert(!relative.startsWith('..') && !path.isAbsolute(relative), `资源不能位于 dist 目录外：${reference}`);
  try { await access(resolved); } catch { throw new Error(`本地资源不存在：dist/${reference}`); }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'index.html 中有重复的 id。');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `导航目标不存在：#${match[1]}`);
console.log(`检查通过：JS 语法、个人信息配置、${new Set(references).size} 个本地资源与页面锚点。`);
