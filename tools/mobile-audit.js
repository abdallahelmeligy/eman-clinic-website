/* فحص الجوال الشامل — يُحقن في الصفحة ويُشغَّل بلا أي تدخّل مسبق.
   يفحص ما لا تكشفه أخطاء الكونسول: صفحة فارغة، نص أصغر من المقروء،
   تدرّج أحجام مكسور، أهداف لمس صغيرة، صور تتجاوز حاويتها. */
window.__mobile = function () {
  const out = { issues: [], info: {} };
  const add = (sev, txt) => out.issues.push(sev + ' ' + txt);
  const vw = innerWidth, vh = innerHeight;
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const px2rem = px => +(px / root).toFixed(3);

  /* ---------- 1) تمرير أفقي ---------- */
  const ov = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  out.info.overflow = ov;
  if (ov > 0) {
    const wide = [...document.querySelectorAll('body *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(e).position !== 'fixed';
    }).slice(0, 4).map(e => (e.tagName + '.' + String(e.className || '').split(' ')[0]).slice(0, 40));
    add('✗', 'تمرير أفقي ' + ov + 'px' + (wide.length ? ' — المرشّحون: ' + wide.join(', ') : ''));
  }

  /* ---------- 2) المحتوى مرئي فعلًا ---------- */
  const main = document.querySelector('main');
  if (!main) { add('✗', 'لا يوجد <main>'); return out; }
  const mainH = Math.round(main.getBoundingClientRect().height);
  out.info.mainH = mainH;
  if (mainH <= 0) add('✗', 'ارتفاع <main> صفر');

  const content = [...main.querySelectorAll('h1,h2,h3,p,li,img,figure,a.btn')];
  out.info.elements = content.length;
  if (!content.length) add('✗', 'لا عناصر محتوى داخل <main>');

  /* .rv عالق: نحسب الشرط حسابيًا لأن IntersectionObserver لا يعمل في تبويب مخفي */
  const VHE = vh * 0.94, TH = 0.12;
  for (const el of document.querySelectorAll('.rv')) {
    const r = el.getBoundingClientRect();
    if (!r.height) continue;
    const need = r.height * TH;
    const seen = Math.max(0, Math.min(r.bottom, VHE) - Math.max(r.top, 0));
    if (Math.min(r.height, VHE) < need)
      add('✗', '.rv لا يُكشَف أبدًا: ' + el.className + ' (' + Math.round(r.height) + 'px)');
    else if (r.top < VHE * 0.75 && seen < need)
      add('✗', '.rv في أول شاشة ولا يُكشَف: ' + el.className + ' (ظاهر ' + Math.round(seen) + '/' + Math.round(need) + 'px)');
  }

  /* ---------- 3) أحجام النص ---------- */
  const sizeOf = sel => { const e = document.querySelector(sel); return e ? parseFloat(getComputedStyle(e).fontSize) : null; };
  const scale = {
    kicker: sizeOf('main .shead__k'),
    body: sizeOf('.artpg__body p') || sizeOf('main .dvg__par') || sizeOf('main .shead p') || sizeOf('main p'),
    sub: sizeOf('.artpg__sub') || sizeOf('main .dpg__spec'),
    h2: sizeOf('main h2'),
    h1: sizeOf('main h1')
  };
  out.info.scale = Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, v ? px2rem(v) + 'rem' : '—']));

  /* التدرّج: الكيكر ≤ النص ≤ العنوان الفرعي ≤ h2 ≤ h1 */
  const order = [['kicker', 'body'], ['body', 'sub'], ['sub', 'h2'], ['h2', 'h1']];
  for (const [a, b] of order) {
    if (scale[a] && scale[b] && scale[a] > scale[b] + 0.5)
      add('⚠', 'تدرّج مكسور: ' + a + ' (' + px2rem(scale[a]) + 'rem) أكبر من ' + b + ' (' + px2rem(scale[b]) + 'rem)');
  }

  /* نص أصغر من 0.74rem داخل main */
  const small = new Map();
  for (const el of main.querySelectorAll('*')) {
    const t = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!t) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
    const rem = px2rem(parseFloat(cs.fontSize));
    if (rem < 0.74) {
      const k = (el.className || el.tagName) + ' @' + rem + 'rem';
      small.set(k, (small.get(k) || 0) + 1);
    }
  }
  for (const [k, n] of [...small].slice(0, 5)) add('⚠', 'نص أصغر من 0.74rem: ' + k + (n > 1 ? ' ×' + n : ''));

  /* عنوان يتجاوز عرض الشاشة */
  for (const h of main.querySelectorAll('h1,h2,h3')) {
    if (h.scrollWidth > h.clientWidth + 2)
      add('✗', 'عنوان يفيض عن حاويته: ' + h.textContent.trim().slice(0, 28));
  }

  /* ---------- 4) أهداف اللمس ---------- */
  const smallTargets = [];
  for (const el of document.querySelectorAll('a[href], button, input, select')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
    if (el.closest('[hidden]') || el.closest('.drawer, .srch, .modal, .bkm, .pop')) continue;   // مخفية حتى تُفتح
    const r = el.getBoundingClientRect();
    if (r.width < 44 || r.height < 44)
      smallTargets.push((el.className || el.tagName).toString().split(' ')[0] + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  out.info.smallTargets = smallTargets.length;
  [...new Set(smallTargets)].slice(0, 5).forEach(t => add('⚠', 'هدف لمس < 44px: ' + t));

  /* ---------- 5) الصور والبطاقات ---------- */
  /* ما داخل كاروسيل أفقي يقع طبيعيًا خارج الشاشة — وهذا مقصود،
     وكذلك object-fit:cover يجعل الصورة أوسع من إطارها المقصوص */
  const scroller = el => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const o = getComputedStyle(n).overflowX;
      if (o === 'auto' || o === 'scroll' || n.classList.contains('rail') || n.classList.contains('balist')) return true;
    }
    return false;
  };
  for (const img of main.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    if (!r.width || scroller(img)) continue;
    const parEl = img.parentElement, par = parEl.getBoundingClientRect();
    const clipped = getComputedStyle(parEl).overflow !== 'visible' ||
                    getComputedStyle(img).objectFit === 'cover';
    if (!clipped && r.width > par.width + 2)
      add('✗', 'صورة أعرض من حاويتها: ' + (img.getAttribute('src') || '').split('/').pop());
    if (r.right > vw + 1 || r.left < -1)
      add('✗', 'صورة خارج الشاشة: ' + (img.getAttribute('src') || '').split('/').pop());
  }
  for (const c of main.querySelectorAll('.card, .art, .srv__c, .br__c')) {
    const r = c.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) {
      if (!scroller(c)) add('✗', 'بطاقة مقصوصة خارج الشاشة: ' + String(c.className).split(' ')[0]);
    }
  }

  return out;
};
'mobile-audit ready';
