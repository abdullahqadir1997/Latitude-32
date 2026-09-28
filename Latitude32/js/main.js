/* Latitude 32 Fitness — site script */
(function(){
  var d=document, b=d.body;

  /* Logo fallback: show wordmark if SVG missing */
  d.querySelectorAll('.logo img').forEach(function(img){
    function swap(){var s=d.createElement('span');s.className='wordmark';s.innerHTML='Latitude <b>32</b> Fitness';img.replaceWith(s);}
    if(img.complete && img.naturalWidth===0) swap(); else img.addEventListener('error',swap);
  });

  /* Header state + mobile menu */
  var header=d.querySelector('.header');
  function onScroll(){ if(header) header.classList.toggle('scrolled',window.scrollY>30); }
  onScroll(); var sq=false; window.addEventListener('scroll',function(){ if(sq) return; sq=true; requestAnimationFrame(function(){sq=false; onScroll();}); },{passive:true});
  var burger=d.querySelector('.burger');
  if(burger){
    burger.addEventListener('click',function(){
      var open=b.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open);
      b.style.overflow=open?'hidden':'';
    });
    d.querySelectorAll('.nav-links a').forEach(function(a){a.addEventListener('click',function(){b.classList.remove('menu-open');b.style.overflow='';burger.setAttribute('aria-expanded','false');});});
    d.addEventListener('keydown',function(e){ if(e.key==='Escape' && b.classList.contains('menu-open')) burger.click(); });
  }

  /* Reveal on scroll */
  var rv=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    rv.forEach(function(el){io.observe(el);});
  } else rv.forEach(function(el){el.classList.add('in');});

  /* Testimonial carousel */
  d.querySelectorAll('.carousel').forEach(function(c){
    var t=c.querySelector('.track'), prev=c.querySelector('[data-prev]'), next=c.querySelector('[data-next]'), bar=c.querySelector('.car-prog i');
    if(!t) return;
    function step(){var card=t.querySelector('.review');return card?card.getBoundingClientRect().width+24:300;}
    function upd(){ if(!bar) return; var max=t.scrollWidth-t.clientWidth; var vis=t.clientWidth/t.scrollWidth; bar.style.width=(vis*100)+'%'; bar.style.transform='translateX('+(max>0?(t.scrollLeft/max)*((1-vis)/vis)*100:0)+'%)'; }
    prev&&prev.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'});});
    next&&next.addEventListener('click',function(){ if(t.scrollLeft+t.clientWidth>=t.scrollWidth-5) t.scrollTo({left:0,behavior:'smooth'}); else t.scrollBy({left:step(),behavior:'smooth'});});
    t.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd();
    /* drag to scroll on desktop */
    var down=false,sx=0,sl=0;
    t.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=t.scrollLeft;t.style.scrollSnapType='none';});
    window.addEventListener('mouseup',function(){if(down){down=false;t.style.scrollSnapType='';}});
    t.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();t.scrollLeft=sl-(e.pageX-sx);});
  });

  /* Schedule tabs + today highlight */
  var tabs=d.querySelectorAll('.tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click',function(){
      tabs.forEach(function(x){x.setAttribute('aria-selected','false');d.getElementById(x.getAttribute('aria-controls')).hidden=true;});
      tab.setAttribute('aria-selected','true'); d.getElementById(tab.getAttribute('aria-controls')).hidden=false;
    });
  });
  var day=new Date().getDay(); /* 0 Sun..6 Sat */
  d.querySelectorAll('.sched tbody tr[data-days]').forEach(function(tr){
    if(tr.getAttribute('data-days').split(',').indexOf(String(day))>-1) tr.classList.add('today');
  });

  /* YouTube facade */
  d.querySelectorAll('.yt[data-yt]').forEach(function(el){
    el.addEventListener('click',function(){
      var f=d.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+el.dataset.yt+'?autoplay=1&rel=0&start='+(el.dataset.start||0);
      f.title=el.getAttribute('aria-label')||'YouTube video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen=true; el.innerHTML=''; el.appendChild(f);
    },{once:true});
  });

  /* Lazy-play background videos */
  d.querySelectorAll('video[data-lazy]').forEach(function(v){
    if(!('IntersectionObserver' in window)){v.play&&v.play();return;}
    new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ v.play().catch(function(){}); } else v.pause(); });},{threshold:.2}).observe(v);
  });

  /* Forms (front-end validation; wire action to CRM) */
  var MIN_MS=3000;
  function armForm(f){
    if(!f.querySelector('input[name="website"]')){ var hp=d.createElement('div'); hp.className='hp'; hp.setAttribute('aria-hidden','true'); hp.innerHTML='<label>Website</label><input name="website" type="text" tabindex="-1" autocomplete="off">'; f.insertBefore(hp,f.firstChild); }
    var ts=f.querySelector('input[name="_ts"]'); if(!ts){ ts=d.createElement('input'); ts.type='hidden'; ts.name='_ts'; f.appendChild(ts); }
    ts.value=String(Date.now());
  }
  window.L32armForm=armForm;
  d.querySelectorAll('form[data-lead]').forEach(function(f){
    armForm(f);
    f.addEventListener('submit',function(e){
      /* spam: honeypot + time trap */
      var hpv=(f.querySelector('input[name="website"]')||{}).value||'';
      var t0=+((f.querySelector('input[name="_ts"]')||{}).value||0);
      if(hpv.trim()!=='' || !t0 || (Date.now()-t0)<MIN_MS){
        e.preventDefault(); var card=f.closest('.form-card'); if(card) card.classList.add('sent'); f.reset(); armForm(f); return;
      }
      var ok=true;
      f.querySelectorAll('[required]').forEach(function(inp){
        var fld=inp.closest('.field'); var bad=!inp.value.trim() || (inp.type==='email' && !/^\S+@\S+\.\S+$/.test(inp.value)) || (inp.type==='tel' && inp.value.replace(/\D/g,'').length<10);
        if(fld){fld.classList.toggle('err',bad); var m=fld.querySelector('.msg'); if(m) m.textContent=bad?(inp.type==='email'?'Please enter a valid email.':inp.type==='tel'?'Please enter a valid phone number.':'This field is required.'):'';}
        if(bad) ok=false;
      });
      if(!f.getAttribute('action') || !ok){ e.preventDefault(); }
      if(ok && f.hasAttribute('data-redirect')){
        e.preventDefault();
        var g=function(n){var el=f.querySelector('[name="'+n+'"]:checked')||f.querySelector('[name="'+n+'"]'); return el?el.value.trim():'';};
        try{ sessionStorage.setItem('l32lead',JSON.stringify({first_name:g('first_name'),last_name:g('last_name'),phone:g('phone'),email:g('email')})); }catch(err){}
        location.href=f.getAttribute('data-redirect')+'?program='+encodeURIComponent(g('program')||'challenge')+'&location='+encodeURIComponent(g('location')||'el-cajon');
        return;
      }
      if(ok && !f.getAttribute('action')){ f.closest('.form-card').classList.add('sent'); }
    });
  });
  d.querySelectorAll('form.news').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault(); var i=f.querySelector('input'), m=f.parentNode.querySelector('.news-msg');
      if(/^\S+@\S+\.\S+$/.test(i.value)){ m.textContent='Thanks for subscribing!'; i.value=''; } else m.textContent='Please enter a valid email.'; });
  });

  /* Year */
  d.querySelectorAll('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear();});
})();

/* ===== Home v2 interactions ===== */
(function(){
  var d=document;
  var pr=d.querySelector('.progress'), media=d.querySelector('.h2-hero .media');
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(){
    var h=d.documentElement, max=h.scrollHeight-h.clientHeight, y=window.scrollY;
    if(pr) pr.style.transform='scaleX('+(max>0?y/max:0)+')';
    if(media && !rm && y<window.innerHeight) media.style.transform='translateY('+(y*0.25)+'px) scale(1.05)';
  }
  var tq=false; window.addEventListener('scroll',function(){ if(tq) return; tq=true; requestAnimationFrame(function(){tq=false; tick();}); },{passive:true}); tick();

  /* expanding panels */
  var panels=d.querySelectorAll('.panel');
  panels.forEach(function(p){
    function on(){panels.forEach(function(x){x.classList.remove('on');x.setAttribute('aria-expanded','false');});p.classList.add('on');p.setAttribute('aria-expanded','true');}
    p.addEventListener('mouseenter',on); p.addEventListener('focus',on); p.addEventListener('click',on);
  });

  /* counters */
  var cs=d.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting) return; io.unobserve(e.target);
      var el=e.target, to=+el.dataset.count, t0=null, dur=rm?0:1600;
      function step(ts){ if(!t0)t0=ts; var k=dur?Math.min((ts-t0)/dur,1):1; el.textContent=Math.round(to*(1-Math.pow(1-k,3))).toLocaleString(); if(k<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });},{threshold:.5});
    cs.forEach(function(c){io.observe(c);});
  }
})();

/* ===== Home: today's classes board ===== */
(function(){
  var now=new Date(), day=now.getDay(), mins=now.getHours()*60+now.getMinutes();
  var names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  document.querySelectorAll('.base[data-sched]').forEach(function(b){
    var s; try{s=JSON.parse(b.getAttribute('data-sched'));}catch(e){return;}
    var list=s[day]||[], box=b.querySelector('.slots'), lbl=b.querySelector('.today .lbl');
    if(!box) return;
    if(!list.length){ box.innerHTML='<span class="slot">No Classes Scheduled</span>'; lbl.textContent='Today · '+names[day]; return; }
    var nextSet=false;
    box.innerHTML=list.map(function(t){
      var m=t.match(/(\d+):(\d+) (AM|PM)/), h=+m[1]%12+(m[3]==='PM'?12:0), tm=h*60+ +m[2], c='slot';
      if(tm<mins) c+=' past'; else if(!nextSet){c+=' next';nextSet=true;}
      return '<span class="'+c+'"><b>'+t+'</b></span>';
    }).join('');
    lbl.textContent='Today · '+names[day]+(nextSet?'':' · Classes done for today');
  });
  document.querySelectorAll('.yt').forEach(function(y){y.addEventListener('click',function(){y.classList.add('played');});});
})();

/* ===== Hero v4: sound toggle ===== */
(function(){
  var btn=document.querySelector('.v-hero .snd'), v=document.querySelector('.v-hero .bgv video');
  if(!btn||!v) return;
  btn.addEventListener('click',function(){ v.muted=!v.muted; if(!v.muted) v.play(); btn.classList.toggle('unmuted',!v.muted); btn.setAttribute('aria-label',v.muted?'Unmute video':'Mute video'); });
})();

/* YouTube embeds need a real http(s) origin; when previewing from a local file, swap to the local clip */
(function(){
  if(location.protocol!=='file:') return;
  document.querySelectorAll('iframe[data-fallback]').forEach(function(f){
    var v=document.createElement('video');
    v.src=f.getAttribute('data-fallback'); v.muted=true; v.autoplay=true; v.loop=true; v.playsInline=true;
    v.setAttribute('playsinline',''); v.setAttribute('aria-hidden','true');
    if(!f.closest('.pg4 .bg')) v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    f.replaceWith(v); v.play().catch(function(){});
  });
})();

/* ===== Locations v3: tabs swap map + card; highlight today ===== */
(function(){
  var d=document, tabs=d.querySelectorAll('.lx-tab'), map=d.querySelector('.lx-map'), pin=d.querySelector('.lx-pin');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      if(t.getAttribute('aria-selected')==='true') return;
      tabs.forEach(function(x){x.setAttribute('aria-selected','false'); d.getElementById(x.getAttribute('aria-controls')).hidden=true;});
      t.setAttribute('aria-selected','true');
      var card=d.getElementById(t.getAttribute('aria-controls')); card.hidden=false;
      if(pin) pin.textContent=card.getAttribute('data-pin');
      if(map){ map.classList.add('swap'); setTimeout(function(){ map.src=card.getAttribute('data-map'); map.title='Map of Latitude 32 Fitness '+card.getAttribute('data-pin'); },250); map.onload=function(){map.classList.remove('swap');}; }
    });
  });
  var day=String(new Date().getDay());
  d.querySelectorAll('.lx-rows li[data-days]').forEach(function(li){ if(li.getAttribute('data-days').split(',').indexOf(day)>-1) li.classList.add('today'); });
})();

/* ===== Inner pages: schedule tabs, day cards, accordions, today box ===== */
(function(){
  var d=document, day=new Date().getDay(), names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var tabs=d.querySelectorAll('.sc-tab'), addr=d.querySelector('.sc-addr span');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.setAttribute('aria-selected','false');d.getElementById(x.getAttribute('aria-controls')).hidden=true;});
      t.setAttribute('aria-selected','true'); d.getElementById(t.getAttribute('aria-controls')).hidden=false;
      if(addr) addr.textContent=t.getAttribute('data-addr');
    });
  });
  var mq=window.matchMedia('(max-width:700px)');
  var cards=d.querySelectorAll('details.day');
  cards.forEach(function(c){
    if(+c.getAttribute('data-day')===day){ c.classList.add('today'); var b=d.createElement('span'); b.className='badge'; b.textContent='Today'; c.appendChild(b); }
    c.querySelector('summary').addEventListener('click',function(e){ if(!mq.matches) e.preventDefault(); });
  });
  function setOpen(){ cards.forEach(function(c){ c.open = !mq.matches || c.classList.contains('today'); }); }
  setOpen(); if(mq.addEventListener) mq.addEventListener('change',setOpen);
  var box=d.querySelector('.sc-now[data-sched]');
  if(box){ try{
    var s=JSON.parse(box.getAttribute('data-sched'));
    box.querySelector('.lbl').textContent='Today · '+names[day];
    box.querySelectorAll('.row').forEach(function(r){ var l=s[r.getAttribute('data-loc')][day]; r.querySelector('span').textContent=l&&l.length?l.join(', '):'No Classes Scheduled'; });
  }catch(e){} }
})();

/* Inner hero: today's classes in schedule hero foot */
(function(){
  var el=document.querySelector('.ih-foot [data-sched]'); if(!el) return;
  try{ var s=JSON.parse(el.getAttribute('data-sched')), day=String(new Date().getDay());
    document.querySelectorAll('.ih-foot .row[data-loc]').forEach(function(r){ var l=s[r.getAttribute('data-loc')][day]; r.querySelector('small').textContent=l&&l.length?l.join(', '):'No Classes Scheduled'; });
  }catch(e){}
})();

/* Philosophy ring: highlight segment on pillar hover + auto cycle */
(function(){
  var cards=document.querySelectorAll('.pxc'), segs=document.querySelectorAll('.ring .seg'); if(!cards.length||!segs.length) return;
  var i=0,timer;
  function set(k){cards.forEach(function(c,j){c.classList.toggle('on',j===k);}); segs.forEach(function(s,j){s.classList.toggle('on',j===k);}); i=k;}
  function cycle(){timer=setInterval(function(){set((i+1)%cards.length);},2600);}
  cards.forEach(function(c,k){c.addEventListener('mouseenter',function(){clearInterval(timer);set(k);}); c.addEventListener('mouseleave',cycle);});
  set(0); if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) cycle();
})();

/* What We Do switcher (auto-cycles, pauses on interaction) */
(function(){
  var root=document.querySelector('.wwd .sw'); if(!root) return;
  var tabs=root.querySelectorAll('.t2'), panes=root.querySelectorAll('.pane'), i=0, t;
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(k){ tabs.forEach(function(x,j){x.setAttribute('aria-selected',j===k?'true':'false'); x.tabIndex=j===k?0:-1;}); panes.forEach(function(p,j){p.classList.toggle('on',j===k);}); i=k; var pr=tabs[k].querySelector('.prog'); if(pr){pr.style.animation='none'; pr.offsetWidth; pr.style.animation='';} }
  function go(){ if(rm) return; clearInterval(t); t=setInterval(function(){show((i+1)%tabs.length);},4500); }
  tabs.forEach(function(x,k){ x.addEventListener('click',function(){show(k); root.classList.add('paused'); clearInterval(t);}); x.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault(); var n=(k+(e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length; show(n); tabs[n].focus(); root.classList.add('paused'); clearInterval(t);} }); });
  show(0); if(rm) root.classList.add('paused'); else go();
})();

/* Click-to-play YouTube facade (.ytf) — needs http(s); opens YouTube when previewing from a file */
(function(){
  document.querySelectorAll('.ytf[data-yt]').forEach(function(el){
    el.addEventListener('click',function(){
      var id=el.dataset.yt, st=el.dataset.start||0;
      if(location.protocol==='file:'){ window.open('https://www.youtube.com/watch?v='+id+'&t='+st+'s','_blank','noopener'); return; }
      var f=document.createElement('iframe');
      f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&start='+st;
      f.title=el.getAttribute('aria-label')||'YouTube video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy='strict-origin-when-cross-origin'; f.allowFullscreen=true;
      el.innerHTML=''; el.appendChild(f);
    });
  });
})();

/* Results slider */
(function(){
  document.querySelectorAll('.rs').forEach(function(r){
    var t=r.querySelector('.rs-track'), cards=t.querySelectorAll('.rs-card'), cnt=r.querySelector('.rs-count b'), bar=r.querySelector('.rs-bar i');
    function step(){ return cards[0].getBoundingClientRect().width+14; }
    function upd(){ var max=t.scrollWidth-t.clientWidth, p=max>0?t.scrollLeft/max:0, vis=t.clientWidth/t.scrollWidth;
      if(bar){bar.style.width=(vis*100)+'%'; bar.style.transform='translateX('+(p*(1/vis-1)*100)+'%)';}
      if(cnt){ cnt.textContent=String(Math.min(cards.length,Math.round(t.scrollLeft/step())+1)).padStart(2,'0'); } }
    r.querySelector('[data-rs-prev]').addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'});});
    r.querySelector('[data-rs-next]').addEventListener('click',function(){ if(t.scrollLeft+t.clientWidth>=t.scrollWidth-5) t.scrollTo({left:0,behavior:'smooth'}); else t.scrollBy({left:step(),behavior:'smooth'});});
    t.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd();
    var down=false,sx=0,sl=0;
    t.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=t.scrollLeft;t.style.scrollSnapType='none';});
    window.addEventListener('mouseup',function(){if(down){down=false;t.style.scrollSnapType='';}});
    t.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();t.scrollLeft=sl-(e.pageX-sx);});
  });
})();

/* ===== Booking modal: open from any booking CTA ===== */
(function(){
  var m=document.getElementById('book-modal'); if(!m) return;
  var box=m.querySelector('.bm-box'), last=null;
  var sel='a[href="contact.html#contact-form"],a[href="#contact-form"],[data-book]';
  function open(e){ if(e){e.preventDefault();} var tr=e&&e.target&&e.target.closest?e.target.closest('a,button'):null;
    var want=(tr&&tr.getAttribute('data-program'))||((tr&&/challenge|trial/i.test(tr.textContent))?'challenge':((tr&&/class/i.test(tr.textContent))?'class':null))||(/free-fitness-challenge/.test(location.pathname)?'challenge':null);
    if(want){ var r=m.querySelector('input[name="program"][value="'+want+'"]'); if(r) r.checked=true; }
    last=document.activeElement; m.hidden=false; var mf=m.querySelector('form[data-lead]'); if(mf&&window.L32armForm) window.L32armForm(mf); document.body.classList.add('modal-open');
    if(document.body.classList.contains('menu-open')){var bg=document.querySelector('.burger'); bg&&bg.click();}
    setTimeout(function(){var f=m.querySelector('input:not([type=radio])'); f&&f.focus();},60); }
  function close(){ m.hidden=true; document.body.classList.remove('modal-open'); box.classList.remove('sent'); var fm=box.querySelector('form'); fm&&fm.reset(); if(last&&last.focus) last.focus(); }
  document.addEventListener('click',function(e){ var a=e.target.closest(sel); if(a && !a.closest('.bmodal')) open(e); });
  m.querySelectorAll('[data-close]').forEach(function(x){x.addEventListener('click',close);});
  document.addEventListener('keydown',function(e){
    if(m.hidden) return;
    if(e.key==='Escape') close();
    if(e.key==='Tab'){ var f=m.querySelectorAll('button,input,a[href]'); f=Array.prototype.filter.call(f,function(x){return x.offsetParent!==null;}); if(!f.length) return;
      var first=f[0], lastEl=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();lastEl.focus();}
      else if(!e.shiftKey && document.activeElement===lastEl){e.preventDefault();first.focus();} }
  });
})();

/* Header videos: optionally start from the middle so pages sharing a clip look different */
(function(){
  document.querySelectorAll('video[data-mid]').forEach(function(v){
    function go(){ try{ if(v.duration&&isFinite(v.duration)) v.currentTime=v.duration*0.5; }catch(e){} }
    if(v.readyState>=1) go(); else v.addEventListener('loadedmetadata',go,{once:true});
  });
})();


/* ===== Performance: play/pause media & loops by visibility ===== */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var vids=document.querySelectorAll('video');
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){
    var v=e.target;
    if(e.isIntersecting){ if(v.paused){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); } }
    else if(!v.paused){ v.pause(); }
  });},{rootMargin:'150px 0px',threshold:0.01});
  vids.forEach(function(v){ v.removeAttribute('autoplay'); vio.observe(v); });
  document.addEventListener('visibilitychange',function(){ if(document.hidden) vids.forEach(function(v){v.pause();}); });
  var loops=document.querySelectorAll('.ticker,.sub-tk,.h2-reviews,.phx,.footer,.results');
  var lio=new IntersectionObserver(function(es){es.forEach(function(e){ e.target.classList.toggle('anim-off',!e.isIntersecting); });},{rootMargin:'100px 0px'});
  loops.forEach(function(el){ lio.observe(el); });
})();

/* Schedule rows: highlight today */
(function(){ var d=String(new Date().getDay());
  document.querySelectorAll('.srow[data-days]').forEach(function(r){ if(r.dataset.days.split(',').indexOf(d)>-1) r.classList.add('today'); });
})();
