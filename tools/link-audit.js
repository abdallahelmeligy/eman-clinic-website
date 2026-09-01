/* مراجعة روابط شاملة على كل صفحات الموقع — تُشغَّل بـnode من جذر المشروع:
     node tools/link-audit.js .
   تفحص: رابطًا داخليًا مكسورًا · حرفًا كبيرًا في المسار (الاستضافة تفرّق
   بين الكبير والصغير على عكس ويندوز) · مرساة #id غير موجودة في صفحتها. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || '.');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (['.git', 'assets', 'content', 'licenses', 'client-originals', 'tools'].includes(f)) continue;
      walk(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = walk(ROOT);
const issues = [];
const capitals = new Set();
let linkCount = 0, assetCount = 0;

for (const file of pages) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const dir = path.dirname(file);
  const html = fs.readFileSync(file, 'utf8');

  /* معرّفات هذه الصفحة — للتحقق من المراسي */
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));

  /* كل الروابط والأصول */
  const refs = [
    ...[...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map(m => ({ v: m[1], kind: 'link' })),
    ...[...html.matchAll(/<(?:img|script|source)[^>]+src="([^"]+)"/g)].map(m => ({ v: m[1], kind: 'asset' })),
    ...[...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m => ({ v: m[1], kind: 'asset' }))
  ];

  for (const { v, kind } of refs) {
    if (/^(https?:|mailto:|tel:|data:|#$)/.test(v)) continue;
    kind === 'link' ? linkCount++ : assetCount++;

    /* مرساة داخل الصفحة نفسها */
    if (v.startsWith('#')) {
      if (!ids.has(v.slice(1)))
        issues.push([rel, 'مرساة لا وجود لها في هذه الصفحة: ' + v]);
      continue;
    }

    const [pathPart, hash] = v.split('#');
    const target = path.resolve(dir, pathPart);

    /* حرف كبير في المسار: ليس عطلًا بذاته — العطل هو عدم تطابق المرجع مع
       الاسم على القرص، ويُفحص أدناه. نُحصيه كتنبيه فقط (القاعدة 8 تفضّل
       الحروف الصغيرة، وملفات الخطوط الجاهزة تخالفها بأسمائها الأصلية). */
    if (/[A-Z]/.test(pathPart)) capitals.add(pathPart.split('/').pop());

    /* الملف موجود؟ */
    if (!fs.existsSync(target)) {
      issues.push([rel, (kind === 'link' ? 'رابط' : 'أصل') + ' مكسور: ' + v]);
      continue;
    }

    /* مطابقة حالة الأحرف فعليًا على القرص (ويندوز لا يفرّق، الاستضافة تفرّق) */
    const base = path.basename(target);
    const siblings = fs.readdirSync(path.dirname(target));
    if (!siblings.includes(base)) {
      const ci = siblings.find(f => f.toLowerCase() === base.toLowerCase());
      issues.push([rel, 'اسم الملف يختلف في حالة الأحرف: ' + base + ' بينما على القرص ' + ci]);
    }

    /* مرساة في صفحة أخرى */
    if (hash && target.endsWith('.html')) {
      const t = fs.readFileSync(target, 'utf8');
      const tids = new Set([...t.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
      if (!tids.has(hash))
        issues.push([rel, 'مرساة غير موجودة في الوجهة: ' + v]);
    }
  }
}

console.log('صفحات مفحوصة: ' + pages.length);
console.log('روابط: ' + linkCount + ' · أصول: ' + assetCount);
if (capitals.size) console.log('ℹ ملفات بحروف كبيرة (مراجعها مطابقة للقرص فتعمل): ' + [...capitals].join(', '));
if (!issues.length) { console.log('✓ لا مشاكل'); }
else {
  console.log('✗ ' + issues.length + ' ملاحظة:');
  const byPage = {};
  issues.forEach(([p, m]) => (byPage[p] = byPage[p] || []).push(m));
  for (const p in byPage) {
    console.log('  ' + p);
    [...new Set(byPage[p])].forEach(m => console.log('    - ' + m));
  }
}
