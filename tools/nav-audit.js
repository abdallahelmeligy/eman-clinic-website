/* فحص التنقّل — يُضاف إلى روتين كل صفحة.
   السبب: «صفر أخطاء وصفر تمرير أفقي» لا يكشف عطلين شائعين —
   الدروار مقفول افتراضيًا فلا يُفحص، والبطاقات لا تُضغط فلا يُكتشف
   رابط مكسور فيها. هذا الملف يفتح الدروار ويتحقق من كل رابط بطاقة. */
window.__nav = async function () {
  const out = { issues: [], info: {} };
  const add = t => out.issues.push(t);
  const abs = h => new URL(h, location.href).href;

  /* ---------- 1) الدروار ---------- */
  const dr = document.getElementById('drawer'), burger = document.getElementById('burger');
  if (!dr) { add('✗ لا يوجد #drawer'); return out; }
  if (!burger) add('✗ لا يوجد زر البرغر');

  dr.classList.add('open');                      // نفتحه كما يفعل الزر
  await new Promise(r => setTimeout(r, 60));
  const drRect = dr.getBoundingClientRect();
  const links = [...dr.querySelectorAll('a')];
  const navLinks = links.filter(a => !a.closest('.drawer__foot'));
  const footLinks = links.filter(a => a.closest('.drawer__foot'));

  out.info.drawer = {
    width: Math.round(drRect.width) + '/' + innerWidth,
    links: navLinks.length, foot: footLinks.length,
    fontSize: navLinks[0] ? getComputedStyle(navLinks[0]).fontSize : '—'
  };

  if (Math.round(drRect.width) < innerWidth - 1)
    add('✗ الدروار لا يملأ العرض: ' + Math.round(drRect.width) + ' من ' + innerWidth);

  /* هل كل الروابط داخل الشاشة دون تمرير؟ */
  const last = links[links.length - 1];
  if (last) {
    const lr = last.getBoundingClientRect();
    if (lr.bottom > innerHeight + 1)
      add('✗ آخر عنصر في الدروار خارج الشاشة (' + Math.round(lr.bottom) + ' > ' + innerHeight + ')');
  }
  if (dr.scrollHeight > dr.clientHeight + 2)
    add('⚠ الدروار يحتاج تمريرًا (' + dr.scrollHeight + ' > ' + dr.clientHeight + ')');

  /* تراكب زر الإغلاق مع الروابط */
  const x = document.getElementById('drawerX');
  if (x && navLinks.length) {
    const xr = x.getBoundingClientRect(), ar = navLinks[0].getBoundingClientRect();
    const overlap = !(xr.right < ar.left || xr.left > ar.right || xr.bottom < ar.top || xr.top > ar.bottom);
    if (overlap) add('✗ زر الإغلاق يتراكب مع أول رابط');
  }

  /* أهداف اللمس داخل الدروار */
  links.forEach(a => {
    const r = a.getBoundingClientRect();
    if (r.height < 44) add('⚠ رابط دروار أقصر من 44px: «' + a.textContent.trim().slice(0, 14) + '» ' + Math.round(r.height));
  });

  /* ---------- 2) تطابق الدروار مع الهيدر ---------- */
  const nav = [...document.querySelectorAll('.nav a')];
  const norm = a => a.textContent.trim() + '→' + abs(a.getAttribute('href'));
  const navSet = nav.map(norm), drSet = navLinks.map(norm);
  out.info.headerNav = nav.length;
  if (navSet.join('|') !== drSet.join('|')) {
    add('✗ الدروار لا يطابق الهيدر');
    out.info.headerList = navSet.map(s => s.split('→')[0]);
    out.info.drawerList = drSet.map(s => s.split('→')[0]);
  }

  dr.classList.remove('open');

  /* ---------- 3) روابط البطاقات ---------- */
  const cards = [...document.querySelectorAll('.cardgrid .card, .artgrid .art, .rail .card, .rail .art')];
  out.info.cards = cards.length;
  const bad = [];
  for (const c of cards) {
    if (c.tagName !== 'A') { bad.push('ليست <a>: ' + String(c.className).split(' ')[0]); continue; }
    const href = c.getAttribute('href');
    if (!href) { bad.push('<a> بلا href'); continue; }
    if (getComputedStyle(c).pointerEvents === 'none') { bad.push('pointer-events:none على ' + href); continue; }
    /* ما الذي يلتقط الضغط في منتصف البطاقة؟
       نمرّر البطاقة إلى وسط الشاشة أولًا — قصّ الإحداثيات إلى حدود الشاشة
       كان يفحص نقطة خارج البطاقة فيبلّغ عن تغطية وهمية. */
    c.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 40));
    const r = c.getBoundingClientRect();
    const inView = r.width && r.height && r.top >= 0 && r.bottom <= innerHeight;
    if (inView) {
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (el && !c.contains(el) && el.closest('a') !== c)
        bad.push('عنصر آخر يغطّي البطاقة: ' + href + ' ← ' + el.tagName + '.' + String(el.className).split(' ')[0]);
    }
    const st = (await fetch(href, { method: 'HEAD' })).status;
    if (st !== 200) bad.push(href + ' → HTTP ' + st);
  }
  bad.forEach(b => add('✗ بطاقة: ' + b));

  out.ok = out.issues.filter(i => i.startsWith('✗')).length === 0;
  return out;
};
'nav-audit ready';
