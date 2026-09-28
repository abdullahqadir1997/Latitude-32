/* Latitude 32 — booking page: show the calendar that matches the modal selection */
(function(){
  var C=window.L32_CALS||{}, q=new URLSearchParams(location.search);
  var prog=/^(challenge|class)$/.test(q.get('program'))?q.get('program'):'challenge';
  var loc=/^(el-cajon|san-diego)$/.test(q.get('location'))?q.get('location'):'el-cajon';
  var ADDR={'el-cajon':'776B Fletcher Parkway, El Cajon, CA 92020','san-diego':'5529 Clairemont Mesa Blvd, San Diego, CA 92117'};
  var lead={}; try{ lead=JSON.parse(sessionStorage.getItem('l32lead')||'{}')||{}; }catch(e){}
  var slot=document.getElementById('cal-slot'), scriptLoaded=false;
  function $(id){return document.getElementById(id);}
  function render(){
    var c=C[prog+'|'+loc]; if(!c) return;
    $('bk-prog').textContent=prog==='challenge'?'30-Day Fitness Challenge':'Free Class';
    $('bk-loc').textContent=c.l; $('bk-addr').textContent=ADDR[loc];
    $('cal-title').textContent=c.p+' — '+c.l;
    document.querySelectorAll('.switch [data-p]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.p===prog);});
    document.querySelectorAll('.switch [data-l]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===loc);});
    var p=new URLSearchParams(); ['first_name','last_name','email','phone'].forEach(function(k){ if(lead[k]) p.set(k,lead[k]); });
    var f=document.createElement('iframe');
    f.src='https://link.conversionbees.com/widget/booking/'+c.w+(p.toString()?'?'+p.toString():'');
    f.id=c.id; f.setAttribute('allow','payment'); f.setAttribute('scrolling','no'); f.title='Book your class — '+c.p+' '+c.l;
    f.style.cssText='width:100%;border:none;overflow:hidden;min-height:760px;display:block';
    slot.innerHTML=''; slot.appendChild(f);
    if(!scriptLoaded){ var s=document.createElement('script'); s.src='https://link.conversionbees.com/js/form_embed.js'; s.type='text/javascript'; document.body.appendChild(s); scriptLoaded=true; }
    history.replaceState(null,'','?program='+prog+'&location='+loc);
  }
  document.querySelectorAll('.switch [data-p]').forEach(function(b){b.addEventListener('click',function(){prog=b.dataset.p;render();});});
  document.querySelectorAll('.switch [data-l]').forEach(function(b){b.addEventListener('click',function(){loc=b.dataset.l;render();});});
  render();
})();
