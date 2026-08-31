(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ticker ---------- */
  /* الشريط بقى ثابت — لا يحتاج JS */

  /* ---------- reviews ---------- */
  var revs = [
    ['مرام محمد','عيادات تجميلية رائعة، حبيت تعاملهم الراقي. وأهم شيء عندي هو التزامهم بالمواعيد وسرعة الرد على الاستفسارات.'],
    ['حصة الشمري','كل الشكر والتقدير للدكتورة ميرفت. تعامل رائع وعمل مميز.'],
    ['Hanan S','من عيادات التجميل المميزة، وأطباء ذوو خبرة ومهارة عالية. أنصح فيها بقوة، وأسعارهم معقولة مقارنة بجودة الخدمة.'],
    ['نوره الشلوي','تعاملهم جداً جميل، وهمهم راحة العميلة. جربت عندهم الليزر وتنظيف البشرة، وهذا اللي مخليني دائماً أرجع لهم.'],
    ['Salma Howat','تجربة ممتازة مع د. ميرفت، تسلم يدها. شغل لا يُعلى عليه، وما أندم في التعامل معها نهائياً.'],
    ['Haifa Albassami','من أفضل عيادات الليزر بالرياض.'],
    ['ام ليال','العيادة رهيبة من ناحية النظافة والاهتمام، وأجي من بعيد لهم. سامية إنسانة تستاهل الشكر — دقة بالشغل وسرعة وتفهّم.'],
    ['R Albader','ما شاء الله على يد الدكتورة مي، خفيفة ولا أحس بالإبرة. والإجراء اللي أسويه معها تبان نتيجته وأفضل مما أتوقع.'],
    ['Ashwag Ali','دكتورة إيمان عبد العزيز ممتازة جداً.']
  ];
  var rr = document.getElementById('railRev'), out = '';
  if (rr) for (var j = 0; j < revs.length; j++){
    out += '<article class="rev"><div class="rev__av2">'+revs[j][0].trim().charAt(0)+'</div>'+
           '<div class="rev__s">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'+
           '<p class="rev__t">'+revs[j][1]+'</p>'+
           '<div class="rev__w"><div class="rev__av">'+revs[j][0].trim().charAt(0)+'</div>'+
           '<div><div class="rev__n">'+revs[j][0]+'</div><div class="rev__g">Google Maps</div></div></div></article>';
  }
  if (rr) rr.innerHTML = out;

  /* ---------- drawer ---------- */
  var drawer = document.getElementById('drawer'), burger = document.getElementById('burger');
  function toggle(open){
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    if (burger) burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('lock', open);
  }
  if (burger) burger.addEventListener('click', function(){ toggle(true); });
  var drawerX = document.getElementById('drawerX');
  if (drawerX) drawerX.addEventListener('click', function(){ toggle(false); });
  if (drawer) Array.prototype.forEach.call(drawer.querySelectorAll('a'), function(a){
    a.addEventListener('click', function(){ toggle(false); });
  });
  addEventListener('keydown', function(e){ if (e.key === 'Escape') toggle(false); });

  /* ---------- header ---------- */
  var hdr = document.getElementById('hdr'), last = 0;
  /* الصفحات الداخلية خلفيتها فاتحة ولا هيرو فيها، فالهيدر يبقى صلبًا دائمًا
     وإلا اختفت الروابط البيضاء فوق الخلفية الفاتحة. تُفعَّل بـ<body class="inner"> */
  var solidAlways = document.body.classList.contains('inner');
  if (hdr && solidAlways) hdr.classList.add('solid');
  if (hdr) addEventListener('scroll', function(){
    var y = scrollY;
    hdr.classList.toggle('solid', solidAlways || y > 60);
    hdr.classList.toggle('hide', y > last && y > 420 && !(drawer && drawer.classList.contains('open')));
    last = y;
  }, {passive:true});

  /* ---------- reveal + counters ---------- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  Array.prototype.forEach.call(document.querySelectorAll('.rv:not(.in)'), function(el){ io.observe(el); });

  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, to = +el.dataset.to, t0 = null;
      var plus = el.dataset.plus ? '<em>+</em>' : '';
      if (reduce){ el.innerHTML = to + plus; return; }
      requestAnimationFrame(function step(ts){
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1100, 1);
        el.innerHTML = Math.round(to * (1 - Math.pow(1 - p, 3))) + plus;
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, {threshold:.5});
  Array.prototype.forEach.call(document.querySelectorAll('.cnt'), function(el){ cio.observe(el); });

  /* ---------- rail nav ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.railnav button'), function(b){
    b.addEventListener('click', function(){
      var rail = document.getElementById(b.dataset.rail);
      var step = rail.firstElementChild ? rail.firstElementChild.offsetWidth + 12 : 260;
      rail.scrollBy({left: step * (+b.dataset.dir), behavior:'smooth'});
    });
  });

  /* ---------- before / after ---------- */
  var cmp = document.getElementById('cmp'),
      imgB = document.getElementById('imgB'), imgA = document.getElementById('imgA'), drag = false;
  function setPos(p){
    if (!cmp) return;
    p = Math.max(3, Math.min(97, p));
    cmp.style.setProperty('--pos', p + '%');
    cmp.setAttribute('aria-valuenow', Math.round(p));
  }
  function fromEvent(e){
    var r = cmp.getBoundingClientRect();
    setPos((e.clientX - r.left) / r.width * 100);
  }
  if (cmp && imgB && imgA){
  cmp.addEventListener('pointerdown', function(e){
    drag = true; cmp.setPointerCapture(e.pointerId); fromEvent(e);
  });
  cmp.addEventListener('pointermove', function(e){ if (drag) fromEvent(e); });
  addEventListener('pointerup', function(){ drag = false; });
  cmp.addEventListener('keydown', function(e){
    var cur = parseFloat(cmp.style.getPropertyValue('--pos')) || 50;
    if (e.key === 'ArrowLeft'){ setPos(cur + 4); e.preventDefault(); }
    if (e.key === 'ArrowRight'){ setPos(cur - 4); e.preventDefault(); }
  });
  setPos(50);
  Array.prototype.forEach.call(document.querySelectorAll('.balist button'), function(b){
    b.addEventListener('click', function(){
      Array.prototype.forEach.call(document.querySelectorAll('.balist button'), function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      imgB.src = 'assets/img/results/' + b.dataset.s + '-before.jpg';
      imgA.src = 'assets/img/results/' + b.dataset.s + '-after.jpg';
      setPos(50);
    });
  });
  }


  /* ---------- fade-in الفيديو ---------- */
  var hvid = document.getElementById('hv');
  if (hvid){
    var showV = function(){ hvid.classList.add('ready'); };
    hvid.addEventListener('playing', showV, {once:true});
    hvid.addEventListener('loadeddata', function(){ setTimeout(showV, 120); }, {once:true});
    setTimeout(showV, 2600);
  }


  /* ---------- الوضع الليلي ---------- */
  (function(){
    var root=document.documentElement, tb=document.getElementById('themeBtn'),
        meta=document.querySelector('meta[name="theme-color"]');
    function apply(t){
      root.setAttribute('data-theme', t);
      if(tb) tb.setAttribute('aria-pressed', t==='dark');
      if(meta) meta.setAttribute('content', t==='dark' ? '#150F1F' : '#662D91');
      try{ localStorage.setItem('theme', t); }catch(e){}
    }
    var saved=null;
    try{ saved=localStorage.getItem('theme'); }catch(e){}
    if(saved){ apply(saved); }
    else if(matchMedia('(prefers-color-scheme: dark)').matches){ apply('dark'); }
    if(tb) tb.addEventListener('click', function(){
      apply(root.getAttribute('data-theme')==='dark' ? 'light' : 'dark');
    });
  })();

  /* ---------- البحث ---------- */
  var sBtn=document.getElementById('srchBtn'), sBox=document.getElementById('srch'),
      sIn=document.getElementById('srchIn'), sRes=document.getElementById('srchRes'),
      sX=document.getElementById('srchX');
  var idx=[], sel=-1;
  function push(t,k,h){ if(t){ idx.push({t:t.trim(),k:k,h:h}); } }
  Array.prototype.forEach.call(document.querySelectorAll('#depts .srv__c'), function(c){
    push(c.querySelector('h3').textContent,'قسم','#depts');
    Array.prototype.forEach.call(c.querySelectorAll('li'), function(li){ push(li.textContent,'خدمة','#depts'); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#railArt .art'), function(a){
    push(a.querySelector('.art__t').textContent,'مقال','#articles');
  });
  /* نتيجة البحث توصل بالزائرة إلى الوجهة النهائية مباشرة: لو البطاقة رابط
     لصفحة مستقلة نأخذ رابطها، وإلا نرجع للقسم في الرئيسية. تُطبَّق تلقائيًا
     على الأجهزة أيضًا بمجرد أن تصير بطاقاتها روابط. */
  Array.prototype.forEach.call(document.querySelectorAll('#railDoc .card'), function(c){
    push(c.querySelector('b').textContent, c.querySelector('span') ? c.querySelector('span').textContent : 'طبيبة', c.getAttribute('href') || '#doctors');
  });
  Array.prototype.forEach.call(document.querySelectorAll('#railDev .card'), function(c){
    push(c.querySelector('b').textContent,'جهاز', c.getAttribute('href') || '#devices');
  });
  Array.prototype.forEach.call(document.querySelectorAll('.balist button'), function(b){
    push(b.textContent,'قبل وبعد','#results');
  });
  push('فرع القدس — مخرج ١٠','فرع','#branches');
  push('فرع قرطبة — مخرج ٨','فرع','#branches');
  push('المواعيد وأرقام التواصل','تواصل','#branches');
  push('حجز موعد عبر واتساب','حجز','https://wa.me/966112401164?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF');

  function norm(x){
    return x.replace(/[\u064B-\u0652\u0640]/g,'').replace(/[\u0623\u0625\u0622]/g,'\u0627')
            .replace(/\u0629/g,'\u0647').replace(/\u0649/g,'\u064A').toLowerCase();
  }
  function draw(q){
    sel=-1;
    if(q.length<2){ sRes.innerHTML=''; return; }
    var n=norm(q), hits=[];
    for(var i=0;i<idx.length && hits.length<8;i++){ if(norm(idx[i].t).indexOf(n)>-1) hits.push(idx[i]); }
    if(!hits.length){ sRes.innerHTML='<li class="srch__none">مافي نتيجة لـ \u201C'+q+'\u201D — جرّبي كلمة أقصر.</li>'; return; }
    var h='';
    for(var j=0;j<hits.length;j++){
      h+='<li><a href="'+hits[j].h+'"'+(hits[j].h.indexOf('http')===0?' target="_blank" rel="noopener"':'')+
         '><b>'+hits[j].t+'</b><span>'+hits[j].k+'</span></a></li>';
    }
    sRes.innerHTML=h;
    Array.prototype.forEach.call(sRes.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){ close(); });
    });
  }
  function open(){
    sBox.hidden=false; requestAnimationFrame(function(){ sBox.classList.add('open'); });
    document.body.classList.add('lock'); setTimeout(function(){ sIn.focus(); }, 60);
  }
  function close(){
    sBox.classList.remove('open'); document.body.classList.remove('lock');
    setTimeout(function(){ sBox.hidden=true; sIn.value=''; sRes.innerHTML=''; }, 260);
  }
  if(sBtn){
    sBtn.addEventListener('click', open);
    sX.addEventListener('click', close);
    sBox.addEventListener('click', function(e){ if(e.target===sBox) close(); });
    sIn.addEventListener('input', function(){ draw(sIn.value); });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && !sBox.hidden) close();
      if((e.key==='k'||e.key==='K') && (e.metaKey||e.ctrlKey)){ e.preventDefault(); sBox.hidden?open():close(); }
      if(sBox.hidden) return;
      var items=sRes.querySelectorAll('li');
      if(!items.length) return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();
        if(sel>-1) items[sel].classList.remove('sel');
        sel = e.key==='ArrowDown' ? (sel+1)%items.length : (sel<=0?items.length-1:sel-1);
        items[sel].classList.add('sel');
      }
      if(e.key==='Enter'){
        var a=(sel>-1?items[sel]:items[0]).querySelector('a');
        if(a){ a.click(); if(a.getAttribute('target')!=='_blank'){ close(); } }
      }
    });
  }




  /* ---------- نافذة العروض (بعد 1.5 ثانية، مرة واحدة في الجلسة) ---------- */
  (function(){
    var pop=document.getElementById('pop'); if(!pop) return;
    var x=document.getElementById('popX'), later=document.getElementById('popLater'), opener=null;
    var seen=false; try{ seen = sessionStorage.getItem('offersSeen')==='1'; }catch(e){}
    function close(){
      pop.classList.remove('open'); document.body.classList.remove('lock');
      setTimeout(function(){ pop.hidden=true; }, 380);
      try{ sessionStorage.setItem('offersSeen','1'); }catch(e){}
      if(opener && opener.focus) opener.focus();
    }
    function open(){
      opener=document.activeElement;
      pop.hidden=false;
      requestAnimationFrame(function(){ pop.classList.add('open'); });
      document.body.classList.add('lock');
      setTimeout(function(){ x.focus(); }, 120);
    }
    if(!seen) setTimeout(open, 1500);
    x.addEventListener('click', close);
    later.addEventListener('click', close);
    pop.addEventListener('click', function(e){ if(e.target===pop) close(); });
    addEventListener('keydown', function(e){ if(e.key==='Escape' && !pop.hidden) close(); });
    Array.prototype.forEach.call(pop.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){ try{ sessionStorage.setItem('offersSeen','1'); }catch(e){} });
    });
  })();

  /* ---------- نافذة تفاصيل الطبيبة / الجهاز ---------- */
  var DEVDATA={"fractional-laser-1": {"d": ["ليزر فراكشنال CO2 يعمل بنقاط دقيقة تترك جسورًا سليمة من الجلد بينها، فيسرّع الشفاء ويجدّد الطبقات العميقة.", "يُستخدم لتمهيد الندبات وآثار حب الشباب وتوحيد لون البشرة."], "g": [{"img": "assets/img/ba/fractional-laser-1-1.webp", "caption": "تجديد الجلد بالكامل"}, {"img": "assets/img/ba/fractional-laser-1-2.webp", "caption": "تمهيد الندبات وتوحيد مستوى الجلد"}, {"img": "assets/img/ba/fractional-laser-1-3.webp", "caption": "توحيد لون البشرة وإزالة التصبغات"}, {"img": "assets/img/ba/fractional-laser-1-4.webp", "caption": "تحفيز الكولاجين والإيلاستين"}], "l": "نتائج قبل وبعد"}, "sonar-voluson": {"d": ["جهاز سونار متطوّر يدعم التصوير بتقنيتَي 2D و4D، وتُختار التقنية المناسبة بتغيير المسبار (Probe) وفق نوع الفحص وتقييم الطبيبة.", "السونار 2D هو الفحص التقليدي للمتابعة الطبية: صور ثنائية الأبعاد تساعد على القياسات وتقييم نمو الجنين وحركته وبعض التفاصيل التشريحية.", "السونار 4D يوفّر تصويرًا مجسّمًا متحركًا في الوقت الفعلي، فتظهر ملامح الوجه وحركات اليدين والقدمين بصورة أوضح. وجودة الصورة تعتمد على مرحلة الحمل ووضعية الجنين.", "ملاحظة: السونار 4D ليس بديلًا عن الفحوصات الطبية اللازمة ولا عن السونار 2D، والطبيبة هي من تحدّد نوع الفحص المناسب."], "g": [{"img": "assets/img/ba/sonar-1.webp", "caption": "الفرق بين 2D و3D و4D"}, {"img": "assets/img/ba/sonar-3.webp", "caption": "أثناء فحص السونار في العيادة"}, {"img": "assets/img/ba/sonar-2.webp", "caption": "صورة السونار على الشاشة"}, {"img": "assets/img/ba/sonar-4.webp", "caption": "متابعة الحمل ونمو الجنين"}], "l": "صور توضيحية"}, "morpheus-pro": {"d": ["يجمع بين الوخز الدقيق بالإبر والترددات الراديوية، فيعمل على سطح البشرة وعمقها في الوقت نفسه: تحسين الملمس والمسام من الخارج، وشدّ الأنسجة من الداخل.", "يناسب الوجه والرقبة ومناطق الجسم، ويُستخدم كذلك لآثار حب الشباب."], "g": [{"img": "assets/img/ba/morpheus-pro-1.webp", "caption": "تحسين ملمس ونضارة البشرة"}, {"img": "assets/img/ba/morpheus-pro-2.webp", "caption": "شد الوجه والرقبة"}, {"img": "assets/img/ba/morpheus-pro-3.webp", "caption": "تقليل التجاعيد والخطوط الدقيقة"}, {"img": "assets/img/ba/morpheus-pro-4.webp", "caption": "آثار حب الشباب"}, {"img": "assets/img/ba/morpheus-pro-5.webp", "caption": "علاج ترهل الذراعين"}], "l": "نتائج قبل وبعد"}, "magellan-plasma": {"d": ["نظام أمريكي لفصل البلازما الغنية بالصفائح من دم المريضة نفسها، ثم حقنها لتحفيز التجدّد الطبيعي.", "يُستخدم لنضارة البشرة ولعلاج تساقط الشعر ودعم نتائج الزراعة."], "g": [{"img": "assets/img/ba/magellan-plasma-1.webp", "caption": "تحسين نضارة البشرة وإشراقتها"}, {"img": "assets/img/ba/magellan-plasma-2.webp", "caption": "تقليل التجاعيد والخطوط الدقيقة"}, {"img": "assets/img/ba/magellan-plasma-3.webp", "caption": "تحسين مظهر الندبات وآثار حب الشباب"}, {"img": "assets/img/ba/magellan-plasma-4.webp", "caption": "علاج تساقط الشعر وتحفيز نمو البصيلات"}, {"img": "assets/img/ba/magellan-plasma-5.webp", "caption": "دعم نتائج زراعة الشعر"}], "l": "نتائج قبل وبعد"}, "secret-rf": {"d": ["يجمع سيكريت بين الإبر المجهرية والموجات الراديوية: تدخل الإبر إلى عمق محدّد بدقة، ثم تُطلق طاقة راديوية تُنشئ نقاطًا حرارية دقيقة داخل الأدمة.", "هذه النقاط تحفّز البشرة على إنتاج الكولاجين وتنشّط عمليات الشفاء الطبيعية، دون الإضرار بسطح البشرة — ولهذا تكون فترة التعافي قصيرة.", "تُحدَّد الأعماق وشدّة الطاقة حسب المنطقة والحالة، وتظهر النتيجة تدريجيًا خلال أربعة إلى ستة أسابيع."], "g": [{"img": "assets/img/ba/secret-rf-1.webp", "caption": "تحسّن ندبات حب الشباب وملمس البشرة"}, {"img": "assets/img/ba/secret-rf-2.webp", "caption": "توحيد ملمس البشرة وتقليل آثار الحبوب"}], "l": "نتائج قبل وبعد"}, "splendor-x": {"d": ["ليزر مزدوج الطول الموجي (Alexandrite + Nd:YAG) لإزالة الشعر، يغطي مساحات واسعة بسرعة ويناسب أنواع بشرة مختلفة.", "نظام تبريد متقدّم يجعل الجلسة أكثر راحة."], "g": [{"img": "assets/img/ba/splendor-x-1.webp", "caption": "تقليل نمو الشعر غير المرغوب فيه"}, {"img": "assets/img/ba/splendor-x-2.webp", "caption": "تغطية مساحات واسعة بسرعة وكفاءة"}, {"img": "assets/img/ba/splendor-x-3.webp", "caption": "مناسب لمختلف أنواع البشرة"}, {"img": "assets/img/ba/splendor-x-4.webp", "caption": "بشرة أكثر نعومة ولمسة حريرية"}], "l": "نتائج قبل وبعد"}, "deka": {"d": ["ليزر إيطالي بتقنية Moveo يعمل بالتمرير المتحرك بدل النبضات المتفرقة، فيوزّع الطاقة بلطف ويقلّل الإحساس بالألم.", "فعّال مع الشعر السميك والرفيع، ويقلّل مشكلة الشعر تحت الجلد."], "g": [{"img": "assets/img/ba/deka-1.webp", "caption": "تقليل نمو الشعر غير المرغوب فيه"}, {"img": "assets/img/ba/deka-2.webp", "caption": "استهداف الشعر السميك والرفيع"}, {"img": "assets/img/ba/deka-3.webp", "caption": "تقليل مشكلة الشعر تحت الجلد"}, {"img": "assets/img/ba/deka-4.webp", "caption": "بشرة أكثر نعومة وصفاءً"}, {"img": "assets/img/ba/deka-5.webp", "caption": "مناسب لجميع أنواع البشرة"}], "l": "نتائج قبل وبعد"}, "attiva": {"d": ["طاقة راديوية حرارية تُطبَّق تحت الجلد لشدّ الأنسجة المترهلة وتحفيز الكولاجين، بإجراء واحد وبدون جراحة.", "مناسب لخط الفك والرقبة وأسفل الوجه، مع فترة نقاهة قصيرة."], "g": [{"img": "assets/img/ba/attiva-1.webp", "caption": "شد البشرة المترهلة"}, {"img": "assets/img/ba/attiva-2.webp", "caption": "تحديد ملامح الوجه والفك"}, {"img": "assets/img/ba/attiva-3.webp", "caption": "تحسين ترهل الرقبة وأسفل الوجه"}, {"img": "assets/img/ba/attiva-4.webp", "caption": "تقليل التجاعيد والخطوط الدقيقة"}, {"img": "assets/img/ba/attiva-5.webp", "caption": "تعزيز نضارة البشرة وجودتها"}], "l": "نتائج قبل وبعد"}, "ulthera-prime": {"d": ["موجات فوق صوتية مركّزة تصل إلى الطبقة العضلية السطحية (SMAS) — وهي نفس الطبقة التي تُشدّ جراحيًا — فتحفّز إنتاج الكولاجين دون أي جروح أو فترة نقاهة.", "النتيجة تظهر تدريجيًا خلال شهرين إلى ثلاثة مع استمرار الجسم في بناء الكولاجين."], "g": [{"img": "assets/img/ba/ulthera-prime-1.webp", "caption": "شد الوجه الكامل ورفع خط الفك"}, {"img": "assets/img/ba/ulthera-prime-2.webp", "caption": "شد ترهلات الرقبة"}, {"img": "assets/img/ba/ulthera-prime-3.webp", "caption": "رفع الحاجبين وشد الجفن العلوي"}], "l": "نتائج قبل وبعد"}};

  var DOCBIO={"dr-salma-jaafar":{n:"د. سلمى جعفر",s:"استشارية أمراض النساء والتوليد والعقم",b:["أكثر من ٢٥ عامًا من الخبرة السريرية","استشارية سابقة — مستشفى قوى الأمن ومستشفى الدكتور سليمان الحبيب","جراحة المناظير النسائية المتقدمة","متابعة الحمل الحرج وعالي الخطورة","حالات الإجهاض المتكرر","الأورام الليفية الرحمية وأكياس المبيض","سلس البول وجراحة ترميم الحوض","تشخيص وعلاج العقم"]},"dr-eman-alabra":{n:"د. إيمان العبرة",s:"استشارية أمراض وجراحة النساء والولادة",b:["عضو في الجمعية الأمريكية لجراحة الليزر التجميلي النسائية في لوس أنجلوس","خبرة في عمليات التجميل بتقنية LVR","حاصلة على شهادة الدكتوراه الفخرية العالمية"]},"dr-eman-abdulaziz":{n:"د. إيمان عبد العزيز",s:"أخصائية النساء والتوليد",b:["خبرة في إجراء السونار","خبرة في جراحة التجميل النسائي وتفتيح المنطقة الحساسة","علاج العقم وتأخر الإنجاب","إجراء عمليات التجميل النسائي الجراحية مثل قص الشفرات وتضييق المهبل","علاج كافة الالتهابات النسائية المعدية وغير المعدية: البكتيرية والفيروسية والفطريات والطفيليات","متابعة الحمل الطبيعي والحمل الخطر","علاج الإجهاضات المتكررة"]},"dr-ghada-morsi":{n:"د. غادة مرسي",s:"نائب جلدية وتجميل",b:["خبرة تتجاوز ٢٠ عامًا في طب الجلدية والتجميل","ماجستير الأمراض الجلدية، وعضو بالأكاديمية الأمريكية للطب التجميلي","من أبرز الخبراء في حقن الفيلر بجميع أنواعه، والبوتوكس، والراديس، والميزوثيرابي، وحقن الـ PRP","خيوط الشد والرفع، والتقشير الطبي والكيميائي","خبرة واسعة في استخدام أجهزة الليزر الجلدية والتجميلية","اعتمادات وشهادات دولية من Merz Aesthetics و Allergan Medical Institute","مدرِّبة معتمدة للفيلر بمنطقة الخليج"]},"dr-mai-mansi":{n:"د. مي منسي",s:"نائب جلدية وتجميل",b:["بكالوريوس طب وجراحة — جامعة عين شمس","ماجستير الأمراض الجلدية والتناسلية — جامعة عين شمس","الدبلومة الأمريكية في الجلدية والحقن التجميلي والليزر وزراعة الشعر","تخصص دقيق في علاج الحقن التجميلي والشعر وأمراضه والديرموسكوب — جامعة عين شمس","مدرِّبة معتمدة ومتحدثة دولية لإنزيمات بروتيس بايوتيك الألمانية","مدرِّبة معتمدة لفيلر هايكورب — شركة بايوسينس الألمانية","مدرِّبة معتمدة للخيوط التجميلية"]},"dr-mervat-aloush":{n:"د. ميرفت علوش",s:"نائب أمراض جلدية وتجميل",b:["دراسات عليا تخصصية في طب الجلدية والتجميل","البورد السوري في طب الجلدية والتجميل","شهادة ماجستير في طب الجلدية والتجميل"]},"dr-lamy-warghi":{n:"د. لمياء ورغي",s:"طب وجراحة الأسنان",b:["دكتوراه من كلية طب الأسنان بالمنستير","زمالة كلية جنوة الإيطالية","خبرة واسعة في تجميل الأسنان وعلاج اللثة والعصب","العلاجات الليزرية للأسنان واللثة","التزام بالتطوير المهني المستمر ورعاية دقيقة عالية الجودة"]}};

  var mo=document.getElementById('modal'), mImg=document.getElementById('mImg'),
      mK=document.getElementById('mK'), mT=document.getElementById('mT'), mD=document.getElementById('mD'),
      mU=document.getElementById('mU'), mCta=document.getElementById('mCta'), mMore=document.getElementById('mMore'),
      mX=document.getElementById('mX'), lastFocus=null;
  function openCard(c){
    var kind=c.getAttribute('data-kind'), name=c.getAttribute('data-name'),
        spec=c.getAttribute('data-spec')||'', uses=c.getAttribute('data-uses')||'',
        link=c.getAttribute('data-link')||'', img=c.getAttribute('data-img')||'';
    lastFocus=c;
    mImg.src=img; mImg.alt=name;
    var slug=c.getAttribute('data-slug'), bio=(kind==='doctor'&&slug&&DOCBIO[slug])?DOCBIO[slug]:null;
    mo.classList.toggle('modal--doc', kind==='doctor');
    mK.textContent = kind==='doctor' ? 'الفريق الطبي' : 'TECHNOLOGY';
    mT.textContent = bio ? bio.n : name;
    mD.textContent = bio ? bio.s : spec;
    var dev = (kind==='device' && slug && DEVDATA[slug]) ? DEVDATA[slug] : null;
    mo.classList.toggle('modal--dev', !!dev);
    if (dev){
      mU.className='modal__dev';
      var h='';
      if (uses) h+='<ul class="modal__uses">'+uses.split(' · ').map(function(u){return '<li>'+u+'</li>';}).join('')+'</ul>';
      dev.d.forEach(function(par){ h+='<p class="modal__par">'+par+'</p>'; });
      if (dev.g && dev.g.length){
        h+='<h4 class="modal__gh">'+dev.l+'</h4><div class="modal__gal">';
        dev.g.forEach(function(it){
          h+='<figure><img loading="lazy" decoding="async" src="'+it.img+'" alt="'+(it.caption||'')+'">'+
             (it.caption?'<figcaption>'+it.caption+'</figcaption>':'')+'</figure>';
        });
        h+='</div>';
      }
      mU.innerHTML=h;
    } else if (bio){
      mU.className='modal__bio';
      mU.innerHTML='<h4>الخبرات والشهادات</h4>'+bio.b.map(function(x){ return '<li>'+x+'</li>'; }).join('');
    } else {
      mU.className='modal__uses';
      mU.innerHTML = uses ? uses.split(' · ').map(function(u){ return '<li>'+u+'</li>'; }).join('') : '';
    }
    mCta.href='https://wa.me/966112401164?text='+encodeURIComponent(
      kind==='doctor' ? ('مرحباً، أرغب بحجز موعد مع '+name) : ('مرحباً، أرغب بالاستفسار عن '+name));
    mCta.textContent = kind==='doctor' ? 'احجزي موعدًا معها' : 'استفسري عن الجهاز';
    if(link){ mMore.href=link; mMore.hidden=false; } else { mMore.hidden=true; }
    mo.hidden=false; requestAnimationFrame(function(){ mo.classList.add('open'); });
    document.body.classList.add('lock'); setTimeout(function(){ mX.focus(); },80);
  }
  function closeCard(){
    mo.classList.remove('open'); document.body.classList.remove('lock');
    setTimeout(function(){ mo.hidden=true; if(lastFocus) lastFocus.focus(); },300);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.card.is-open'), function(c){
    c.addEventListener('click', function(){ openCard(c); });
    c.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openCard(c); }
    });
  });
  mX.addEventListener('click', closeCard);
  mo.addEventListener('click', function(e){ if(e.target===mo) closeCard(); });
  addEventListener('keydown', function(e){ if(e.key==='Escape' && !mo.hidden) closeCard(); });


  /* ---------- سلايدر الآراء: الأوسط + الجانبين + النقاط ---------- */
  var rDots=document.getElementById('revDots');
  function revPaint(){
    var rr=document.getElementById('railRev');
    if(!rr||!rr.children.length) return;
    var box=rr.getBoundingClientRect(), mid=box.left+box.width/2, best=0, bd=1e9, i;
    for(i=0;i<rr.children.length;i++){
      var r=rr.children[i].getBoundingClientRect(), d=Math.abs(r.left+r.width/2-mid);
      if(d<bd){ bd=d; best=i; }
    }
    for(i=0;i<rr.children.length;i++){
      var c=rr.children[i];
      c.classList.toggle('mid', i===best);
      c.classList.toggle('right', i<best);
      c.classList.toggle('left', i>best);
    }
    if(rDots){
      if(rDots.children.length!==rr.children.length){
        var h='';
        for(i=0;i<rr.children.length;i++) h+='<button type="button" aria-label="رأي '+(i+1)+'"></button>';
        rDots.innerHTML=h;
        Array.prototype.forEach.call(rDots.children, function(b,k){
          b.addEventListener('click', function(){
            rr.children[k].scrollIntoView({behavior:reduce?'auto':'smooth', inline:'center', block:'nearest'});
          });
        });
      }
      for(i=0;i<rDots.children.length;i++) rDots.children[i].classList.toggle('on', i===best);
    }
  }
  (function(){
    var rr=document.getElementById('railRev'); if(!rr) return;
    var t; rr.addEventListener('scroll', function(){ clearTimeout(t); t=setTimeout(revPaint,50); }, {passive:true});
    addEventListener('resize', revPaint, {passive:true});
    setTimeout(revPaint, 500); setTimeout(revPaint, 1200);
  })();


  /* ---------- زر الحجز العائم: تمرير + تركيز على أول حقل ---------- */
  (function(){
    var fab=document.querySelector('.fab-book'); if(!fab) return;
    fab.addEventListener('click', function(e){
      var t=document.getElementById('booking'); if(!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      setTimeout(function(){ var n=document.getElementById('bkName'); if(n) n.focus({preventScroll:true}); }, reduce?0:700);
    });
  })();


  /* ---------- نافذة الحجز من الزر اللاصق ---------- */
  (function(){
    var fab=document.querySelector('.fab-book'), box=document.getElementById('bkm'),
        x=document.getElementById('bkmX'), f=document.getElementById('bkmF'),
        er=document.getElementById('bkmErr'), opener=null;
    if(!fab||!box) return;
    function open(){
      opener=document.activeElement; box.hidden=false;
      requestAnimationFrame(function(){ box.classList.add('open'); });
      document.body.classList.add('lock');
      setTimeout(function(){ document.getElementById('bkmName').focus(); },120);
    }
    function close(){
      box.classList.remove('open'); document.body.classList.remove('lock');
      setTimeout(function(){ box.hidden=true; },340);
      if(opener&&opener.focus) opener.focus();
    }
    fab.addEventListener('click', function(e){ e.preventDefault(); open(); });
    x.addEventListener('click', close);
    box.addEventListener('click', function(e){ if(e.target===box) close(); });
    addEventListener('keydown', function(e){ if(e.key==='Escape' && !box.hidden) close(); });
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var n=document.getElementById('bkmName'), p=document.getElementById('bkmPhone'),
          sv=document.getElementById('bkmService'), br=document.getElementById('bkmBranch'),
          tm=document.getElementById('bkmTime');
      var digits=(p.value||'').replace(/[^0-9]/g,'');
      n.classList.remove('bad'); p.classList.remove('bad'); er.hidden=true;
      if(!n.value.trim()){ n.classList.add('bad'); er.textContent='من فضلك اكتبي الاسم.'; er.hidden=false; n.focus(); return; }
      if(digits.length<9){ p.classList.add('bad'); er.textContent='من فضلك اكتبي رقم جوال صحيح.'; er.hidden=false; p.focus(); return; }
      var msg='طلب حجز موعد — عيادات د. إيمان العبرة'+
        '\nالاسم: '+n.value.trim()+'\nالجوال: '+digits+
        (sv.value?'\nالخدمة: '+sv.value:'')+(br.value?'\nالفرع: '+br.value:'')+
        (tm.value?'\nوقت التواصل: '+tm.value:'');
      window.open('https://wa.me/966112401164?text='+encodeURIComponent(msg),'_blank','noopener');
      close();
    });
  })();

  /* ---------- نموذج الحجز -> واتساب ---------- */
  var bf=document.getElementById('bookF');
  if(bf){
    bf.addEventListener('submit', function(e){
      e.preventDefault();
      var n=document.getElementById('bkName'), p=document.getElementById('bkPhone'),
          sv=document.getElementById('bkService'), br=document.getElementById('bkBranch'),
          tm=document.getElementById('bkTime'), er=document.getElementById('bkErr');
      var digits=(p.value||'').replace(/[^0-9]/g,'');
      n.classList.remove('bad'); p.classList.remove('bad'); er.hidden=true;
      if(!n.value.trim()){ n.classList.add('bad'); er.textContent='من فضلك اكتبي الاسم.'; er.hidden=false; n.focus(); return; }
      if(digits.length<9){ p.classList.add('bad'); er.textContent='من فضلك اكتبي رقم جوال صحيح.'; er.hidden=false; p.focus(); return; }
      var msg='طلب حجز موعد — عيادات د. إيمان العبرة'+
        '\nالاسم: '+n.value.trim()+
        '\nالجوال: '+digits+
        (sv.value?'\nالخدمة: '+sv.value:'')+
        (br.value?'\nالفرع: '+br.value:'')+
        (tm.value?'\nوقت التواصل: '+tm.value:'');
      window.open('https://wa.me/966112401164?text='+encodeURIComponent(msg),'_blank','noopener');
    });
  }

  /* ---------- (النسخة القديمة لتركيز الكرت) ---------- */
  var rr=document.getElementById('railRev');
  function midRev(){
    if(!rr) return;
    var box=rr.getBoundingClientRect(), mid=box.left+box.width/2, best=null, bd=1e9;
    Array.prototype.forEach.call(rr.children, function(c){
      var r=c.getBoundingClientRect(), d=Math.abs(r.left+r.width/2-mid);
      if(d<bd){ bd=d; best=c; }
    });
    Array.prototype.forEach.call(rr.children, function(c){ c.classList.toggle('mid', c===best); });
  }
  /* استُبدلت بـ revPaint */

  /* ---------- عنصر الخلفية يتحرك مع السكرول ---------- */
  var gem=document.getElementById('gem'), gTick=false, lastY=0, gemMax=1, gemRange=0;
  function gemMeasure(){
    gemMax=Math.max(1, document.documentElement.scrollHeight-innerHeight);
    gemRange=innerHeight*0.55;
  }
  gemMeasure();
  addEventListener('resize', gemMeasure, {passive:true});
  addEventListener('load', gemMeasure);
  function gemMove(){
    if(!gem || gTick) return;
    lastY=window.scrollY||window.pageYOffset||0;
    gTick=true;
    requestAnimationFrame(function(){
      var hMax=gemMax||1;
      var p=Math.min(1,Math.max(0,lastY/hMax));
      gem.style.setProperty('--gy', (p*gemRange).toFixed(1)+'px');
      gem.style.setProperty('--gx', (Math.sin(p*3.14159)*gemRange*0.22).toFixed(1)+'px');
      gTick=false;
    });
  }
  addEventListener('scroll', gemMove, {passive:true}); gemMove();

  /* ---------- شريط التقدّم + السكشن النشط ---------- */
  var prog = document.getElementById('prog');
  /* في الصفحات الداخلية روابط النافيجيشن تصير ../index.html#depts وهي ليست
     محدِّدًا صالحًا لـquerySelector — فنقتصر على الروابط الداخلية للصفحة نفسها */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'))
    .filter(function(a){ return (a.getAttribute('href') || '').charAt(0) === '#'; });
  var targets = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
      var best = -1, line = scrollY + innerHeight * 0.34;
      for (var i = 0; i < targets.length; i++){
        if (targets[i] && targets[i].offsetTop <= line) best = i;
      }
      for (var j = 0; j < navLinks.length; j++){ navLinks[j].classList.toggle('on', j === best); }
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll, {passive:true});
  onScroll();

  /* ---------- تشغيل الفيديو تلقائيًا (بمحاولات متكررة) ---------- */
  var hv = document.getElementById('hv');
  if (hv){
    hv.muted = true; hv.defaultMuted = true; hv.playsInline = true; hv.loop = true;
    var kicked = false;
    function tryPlay(){
      if (!hv) return;
      var p = hv.play();
      if (p && p.catch) p.catch(function(){});
    }
    tryPlay();
    ['loadedmetadata','loadeddata','canplay','canplaythrough'].forEach(function(ev){
      hv.addEventListener(ev, tryPlay);
    });
    /* بعض المتصفحات (سفاري/وضع توفير الطاقة) بتمنع التشغيل لحد أول تفاعل */
    function kick(){
      if (kicked) return; kicked = true; tryPlay();
    }
    ['pointerdown','touchstart','keydown','scroll'].forEach(function(ev){
      addEventListener(ev, kick, {once:true, passive:true});
    });
    document.addEventListener('visibilitychange', function(){
      if (!document.hidden && hv.paused) tryPlay();
    });
    setTimeout(function(){ if (hv.paused) tryPlay(); }, 1200);
    setTimeout(function(){ if (hv.paused) tryPlay(); }, 3000);
    /* حارس: أحيانًا ينتهي اختيار المصدر بـ NETWORK_NO_SOURCE (سباق تحميل)، فنعيد المحاولة */
    var tries = 0;
    var guard = setInterval(function(){
      if (hv.readyState >= 2 || tries >= 8){ clearInterval(guard); return; }
      tries++;
      if (hv.networkState === 3 || hv.readyState === 0){ try{ hv.load(); }catch(e){} tryPlay(); }
    }, 1200);
    var hp = document.getElementById('heroPlay');
    if (hp){
      hp.addEventListener('click', function(){ tryPlay(); });
      var watch = setInterval(function(){
        var playing = !hv.paused && hv.readyState >= 2 && hv.currentTime > 0.15;
        hp.hidden = playing;
        if (playing) { clearInterval(watch); }
      }, 900);
      setTimeout(function(){ clearInterval(watch); }, 30000);
    }
    /* لو الفيديو نفسه فشل في التحميل، البوستر موجود كخلفية للـ .hero__bg فمفيش فراغ */
    hv.addEventListener('error', function(){ hv.style.display = 'none'; });
  }
})();
