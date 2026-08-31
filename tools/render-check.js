/* فحص إلزامي لكل صفحة: هل تعرض محتوى فعليًا؟
   غياب أخطاء الكونسول لا يكفي — الصفحة قد تكون سليمة تمامًا ومحتواها
   شفاف بالكامل لأن .rv لم يُكشَف.

   ⚠️ IntersectionObserver لا يعمل في تبويب مخفي، فقياس «هل ظهر فعلًا»
   غير موثوق في أدوات الفحص. لذلك يحسب هذا الملف الشرط حسابيًا:
   مراقب الظهور في main.js عتبته threshold:.12 مع rootMargin -6%، أي
   يشترط أن يكون الظاهر من العنصر ≥ 12% من ارتفاعه الكامل.
     • عنصر أطول من 8.3 أضعاف الشاشة  → لا يمكن أن يُكشَف أبدًا
     • عنصر داخل الشاشة عند التحميل لكن الظاهر منه < 12%
       → يبقى شفافًا أمام الزائرة حتى تمرّر، وهذا ما يبدو «صفحة فارغة» */
window.__render = function () {
  const main = document.querySelector('main');
  if (!main) return { ok: false, failures: ['لا يوجد <main>'] };

  const vh = innerHeight * 0.94;              // rootMargin: -6%
  const TH = 0.12;                            // threshold
  const mainH = Math.round(main.getBoundingClientRect().height);

  const all = [...main.querySelectorAll('h1,h2,h3,p,li,img,a.btn,figure')];
  const failures = [], risks = [];

  if (mainH <= 0) failures.push('ارتفاع <main> صفر');
  if (all.length === 0) failures.push('لا عناصر محتوى داخل <main>');

  /* عناصر مخفية لأسباب غير .rv (display/visibility) */
  /* المخفي بـ[hidden] مقصود (مثل موضع رقم الترخيص) فلا يُعدّ عطلاً */
  const hardHidden = all.filter(el => {
    if (el.closest('[hidden]')) return false;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
      if (n.classList && n.classList.contains('rv')) return false;   // .rv يُعالَج أدناه
    }
    return false;
  });
  if (hardHidden.length) failures.push(hardHidden.length + ' عنصر مخفي بـdisplay/visibility');

  /* تحليل كل .rv عند وضع التمرير الحالي (أعلى الصفحة) */
  for (const el of document.querySelectorAll('.rv')) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const need = r.height * TH;
    const seenNow = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const maxEver = Math.min(r.height, vh);
    const content = el.querySelectorAll('h1,h2,h3,p,li,img,figure').length;
    /* يُعتبر في أول شاشة إذا بدأ في أعلى ثلاثة أرباعها — ما يطلّ بطرفه من الأسفل
       يُكشَف طبيعيًا مع أول تمرير، ولا يراه الزائر فراغًا */
    const inFold = r.top < vh * 0.75;

    if (maxEver < need) {
      failures.push('.rv لا يمكن كشفه أبدًا: ' + el.className + ' بارتفاع ' +
        Math.round(r.height) + 'px (يلزم ' + Math.round(need) + 'px والشاشة ' + Math.round(vh) + 'px)');
    } else if (inFold && seenNow < need) {
      failures.push('.rv يقع في أول شاشة ولا يُكشَف عند التحميل: ' + el.className +
        ' بارتفاع ' + Math.round(r.height) + 'px — الظاهر ' + Math.round(seenNow) +
        'px واللازم ' + Math.round(need) + 'px' + (content ? ' (يحجب ' + content + ' عنصرًا)' : ''));
    } else if (!inFold) {
      risks.push('.rv تحت الطيّة (يُكشَف عند التمرير): ' + el.className);
    }
  }

  return { ok: failures.length === 0, mainH, elements: all.length, rv: document.querySelectorAll('.rv').length, failures, belowFold: risks.length };
};
'render-check ready';
