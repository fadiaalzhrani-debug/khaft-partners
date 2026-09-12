/* ═══════════════════════════════════════════════════════════════
   وحدة المستودع المشتركة (خافت + المزوّدون) · تُستخدم في admin.html و fanyeen.html
   الصفحة تعرّف WH_HOST قبل أول عرض:
   { L(a,e), num(n), esc(s), toast(m), inv(), setInv(arr), log(), sb(), cloud(), table, logTable, extra(),
     saveQty(it), logStock(it,delta,reason), afterChange(), refreshLog(), upload(id,file), clearImage(id),
     canEdit(), needReason(), org:{name,city,phone}, imgOpts(id), pickImg(id,url), linker() }
   ═══════════════════════════════════════════════════════════════ */
const INV_CATS=['كهرباء','سباكة','عام'];
const CAT_ICO={'كهرباء':'⚡','سباكة':'🔧','عام':'🛠️'};
const CAT_EN={'كهرباء':'Electrical','سباكة':'Plumbing','عام':'General'};
const whState={search:'',filter:'all',cat:'all',editOpen:false,editSearch:'',poOpen:false,poSearch:'',poCat:'all',PO:{},photo:null,photoUrl:''};
const whPend={};
function whH(){ return (typeof WH_HOST!=='undefined')?WH_HOST:window.WH_HOST; }   // WH_HOST قد يكون const في نطاق الصفحة (لا يظهر على window)
function whL(a,e){ return whH().L(a,e); }
function whN(v){ return (+v||0).toLocaleString('en',{maximumFractionDigits:2}); }
function whNx(v){ return whH().num(whN(v)); }
function whE(s){ return whH().esc(s); }
function whT(m){ whH().toast(m); }
function whInv(){ return whH().inv()||[]; }
function whFind(id){ return whInv().find(x=>String(x.id)===String(id)); }
function whCat(it){ return INV_CATS.includes(it.category)?it.category:'عام'; }
function whCatLbl(c){ return whL(c,CAT_EN[c]||c); }
function whByCat(a,b){ return (INV_CATS.indexOf(whCat(a))-INV_CATS.indexOf(whCat(b)))||String(a.name||'').localeCompare(String(b.name||''),'ar'); }
function whPoOpen(){ return whState.poOpen; }
/* حسابات الحالة (تُستخدم أيضًا في لوحة المدير والتصدير) */
function invUsage(id){ const now=Date.now(), d180=now-180*864e5, d30=now-30*864e5; let u6=0,u1=0;
  (whH().log()||[]).forEach(e=>{ if(String(e.item_id)!==String(id)||+e.delta>=0) return; const t=new Date(e.created_at).getTime(), q=Math.abs(+e.delta||0); if(t>=d180) u6+=q; if(t>=d30) u1+=q; });
  return {u6,u1,monthly:u6/6}; }
function invPct(it){ const q=+it.qty||0, tg=+it.target_qty||0; if(!tg) return null; return Math.max(0,Math.min(100,Math.round(q/tg*100))); }
function invState(it){ const q=+it.qty||0, mn=+it.min_qty||0, p=invPct(it); if(q<=0) return 'out'; if(mn&&q<=mn) return 'low'; if(p!==null&&p<50) return 'mid'; return 'ok'; }
function invNeed(it){ const q=+it.qty||0, tg=+it.target_qty||0, mn=+it.min_qty||0; const goal=tg||(mn*3); return Math.max(0,goal-q); }
function invHot(){ return whInv().map(it=>({id:it.id,u:invUsage(it.id).u6})).filter(x=>x.u>0).sort((a,b)=>b.u-a.u).slice(0,5).map(x=>x.id); }
function invStats(itemId){ let inn=0,out=0; (whH().log()||[]).forEach(e=>{ if(String(e.item_id)===String(itemId)){ const d=+e.delta||0; if(d>0) inn+=d; else out+=Math.abs(d); } }); return {inn,out}; }

/* ═ الصفحة الرئيسية: صورة كبيرة + اسم + كمية ± ═ */
function whSetSearch(v){ whState.search=(v||'').trim(); whRefresh(true); }
function whSetFilter(f){ whState.filter=f; whRefresh(); }
function whSetCat(c){ whState.cat=c; whRefresh(); }
function whRefresh(keepFocus){ const el=document.getElementById('whBody'); if(!el){ whH().afterChange(); return; } el.innerHTML=whBody(); if(keepFocus){ const i=document.getElementById('whSearch'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } } }
function whVisible(){
  const q=whState.search.toLowerCase();
  return whInv().filter(it=>{
    if(q && !((it.name||'')+' '+(it.code||'')).toLowerCase().includes(q)) return false;
    if(whState.cat!=='all' && whCat(it)!==whState.cat) return false;
    const st=invState(it);
    if(whState.filter==='low') return st==='low'||st==='out';
    if(whState.filter==='out') return st==='out';
    return true; }).sort(whByCat);
}
function whMain(){
  const INV=whInv(); const need=INV.filter(it=>['low','out'].includes(invState(it)));
  const top=whH().canEdit()?`<div class="wh-top3">
    <button class="wh-big edit" onclick="whOpenEdit()">✏️ ${whL('تعديل المستودع','Edit warehouse')}<small>${whL('الأسعار · إضافة · حذف · الصور','Prices · add · delete · photos')}</small></button>
    <button class="wh-big po" onclick="whOpenPO()">🛒 ${whL('طلب شراء','Purchase order')}<small>${need.length?whNx(need.length)+' '+whL('صنف تحتاج طلب','items to reorder'):whL('اختر الأصناف واطلع PDF','Pick items, get a PDF')}</small></button>
  </div>`:'';
  const cnt=c=>INV.filter(it=>c==='all'||whCat(it)===c).length;
  return top+`<div class="wh-tools"><input id="whSearch" class="wh-search" placeholder="🔍 ${whL('ابحث باسم الصنف','Search items')}" value="${whE(whState.search)}" oninput="whSetSearch(this.value)" /></div>
  <div class="wh-cats">
    <button class="wh-cat ${whState.cat==='all'?'active':''}" onclick="whSetCat('all')">📦 ${whL('الكل','All')}<small>${whNx(cnt('all'))}</small></button>
    ${INV_CATS.map(c=>`<button class="wh-cat ${whState.cat===c?'active':''}" onclick="whSetCat('${c}')">${CAT_ICO[c]} ${whCatLbl(c)}<small>${whNx(cnt(c))}</small></button>`).join('')}
  </div><div id="whBody">${whBody()}</div>`;
}
function whCard(it){
  const st=invState(it), q=+it.qty||0;
  const badge=st==='out'?`<span class="ws-badge out">⛔ ${whL('نفد','Out')}</span>`:st==='low'?`<span class="ws-badge low">⚠️ ${whL('اطلب','Reorder')}</span>`:'';
  const thumbClick=it.image_url?`onclick="whZoom('${whE(it.image_url)}')"`:(whH().canEdit()?`onclick="whForm('${it.id}')"`:'');
  return `<div class="ws-item st-${st}" id="ws-${it.id}">
    <div class="ws-thumb" ${thumbClick}>${it.image_url?`<img src="${whE(it.image_url)}" loading="lazy" />`:(CAT_ICO[whCat(it)]||'📦')}</div>
    <div class="ws-body">
      <div class="ws-name">${whE(it.name)}</div>
      <div class="ws-sub">${badge}<span>${whL('الوحدة','Unit')}: ${whE(it.unit||whL('حبة','pc'))}</span>${(+it.min_qty)?`<span>· ${whL('حد الطلب','Reorder at')} ${whNx(it.min_qty)}</span>`:''}</div>
      <div class="ws-step">
        <button class="ws-btn minus" id="wsm-${it.id}" onclick="whStep('${it.id}',-1)" ${q<=0?'disabled':''} aria-label="${whL('صرف','Issue')}">−</button>
        <button class="ws-num" onclick="whType('${it.id}')"><span id="wsn-${it.id}">${whNx(q)}</span><small>${whE(it.unit||'')}</small></button>
        <button class="ws-btn plus" onclick="whStep('${it.id}',1)" aria-label="${whL('إدخال','Stock in')}">+</button>
      </div>
      <div class="ws-hint"><span>− ${whL('صرف','issue')}</span><span>${whL('اضغط الرقم لكتابة الكمية','tap the number to type')}</span><span>+ ${whL('إدخال','stock in')}</span></div>
    </div>
  </div>`;
}
function whBody(){
  const INV=whInv();
  const cnt={low:INV.filter(it=>['low','out'].includes(invState(it))).length, out:INV.filter(it=>invState(it)==='out').length};
  const chip=(k,l,cls)=>`<button class="wh-chip ${cls||''} ${whState.filter===k?'active':''}" onclick="whSetFilter('${k}')">${l}</button>`;
  const chips=`<div class="wh-sub">${chip('all',whL('الكل','All'))}${chip('low','⚠️ '+whL('تحتاج طلب','Reorder')+' ('+whNx(cnt.low)+')','warn')}${chip('out','⛔ '+whL('نفدت','Out')+' ('+whNx(cnt.out)+')','warn')}</div>`;
  const list=whVisible();
  if(!INV.length) return chips+`<div class="wh-empty">${whH().loaded&&!whH().loaded()?'⏳ '+whL('جارٍ تحميل الأصناف…','Loading items…'):(whH().canEdit()?whL('المستودع فارغ. اضغط «تعديل المستودع» ثم «صنف» لإضافة أول صنف.','Warehouse is empty. Tap “Edit warehouse” then “Add”.'):whL('ما فيه أصناف بعد','No items yet'))}</div>`;
  if(!list.length) return chips+`<div class="wh-empty">${whL('لا نتائج.','No results.')}</div>`;
  let body='';
  if(whState.cat==='all'){
    for(const c of INV_CATS){ const g=list.filter(it=>whCat(it)===c); if(!g.length) continue;
      body+=`<div class="wh-group"><div class="wh-group-h"><span>${CAT_ICO[c]} ${whCatLbl(c)}</span><small>${whNx(g.length)} ${whL('صنف','items')}</small></div><div class="ws-list">${g.map(whCard).join('')}</div></div>`; }
  } else body=`<div class="ws-list" style="margin-top:6px">${list.map(whCard).join('')}</div>`;
  return chips+body;
}
function whZoom(url){ if(!url) return; document.body.insertAdjacentHTML('beforeend',`<div class="wh-lightbox" onclick="this.remove()"><img src="${whE(url)}" /></div>`); }
/* الكمية بالأزرار: الرقم يتحدّث فورًا، والحركة تُسجَّل مرة واحدة بعد 1.4 ثانية من آخر ضغطة */
function whPaint(it){ const n=document.getElementById('wsn-'+it.id); if(n) n.textContent=whNx(+it.qty||0); const m=document.getElementById('wsm-'+it.id); if(m) m.disabled=(+it.qty||0)<=0; const c=document.getElementById('ws-'+it.id); if(c) c.className='ws-item st-'+invState(it); }
function whStep(id,d){
  const it=whFind(id); if(!it) return; const q=+it.qty||0; if(d<0&&q<=0) return;
  it.qty=Math.max(0,q+d); whPaint(it);
  const p=whPend[id]||(whPend[id]={delta:0,timer:null}); p.delta+=d; clearTimeout(p.timer);
  p.timer=setTimeout(()=>whCommit(id),1400);
}
async function whCommit(id){
  const p=whPend[id]; if(!p) return; const d=p.delta; delete whPend[id]; if(!d) return;
  const it=whFind(id); if(!it) return;
  let reason=d>0?'إدخال':'صرف';
  if(d<0 && whH().needReason()){
    const why=prompt(whL('صرف '+whN(Math.abs(d))+' '+(it.unit||'')+' من «'+it.name+'»\nاكتب السبب (اسم العميل أو رقم الطلب):','Issuing '+whN(Math.abs(d))+' × '+it.name+'\nReason (customer or job #):'));
    if(why===null||!why.trim()){ it.qty=(+it.qty||0)-d; whPaint(it); whT('↩️ '+whL('أُلغي الصرف','Cancelled')); return; }
    reason='صرف · '+why.trim();
  }
  await whH().saveQty(it); await whH().logStock(it,d,reason);
  whT((d>0?'➕ ':'➖ ')+whNx(Math.abs(d))+' '+(it.unit||'')+' · '+it.name); whH().refreshLog();
}
async function whType(id){
  const it=whFind(id); if(!it) return;
  const s=prompt(whL('الكمية الحالية لـ «'+it.name+'»:','Current quantity of “'+it.name+'”:'), String(+it.qty||0));
  if(s===null) return; const v=Math.abs(+String(s).replace(/[^\d.]/g,'')||0); const d=v-(+it.qty||0); if(!d) return;
  let reason='تعديل الكمية';
  if(d<0 && whH().needReason()){ const why=prompt(whL('اكتب السبب (اسم العميل أو رقم الطلب):','Reason (customer or job #):')); if(why===null||!why.trim()){ whT('↩️ '+whL('أُلغي','Cancelled')); return; } reason='صرف · '+why.trim(); }
  it.qty=v; whPaint(it); await whH().saveQty(it); await whH().logStock(it,d,reason); whT('✅ '+whL('تعدّلت الكمية','Quantity updated')); whH().refreshLog();
}

/* ═ صفحة تعديل المستودع ═ */
function whOpenEdit(){ whState.editOpen=true; whState.editSearch=''; const old=document.getElementById('weOv'); if(old) old.remove(); document.body.insertAdjacentHTML('beforeend','<div class="il-ov" id="weOv"></div>'); whRenderEdit(); window.scrollTo(0,0); }
function whCloseEdit(){ whState.editOpen=false; const o=document.getElementById('weOv'); if(o) o.remove(); whH().afterChange(); }
function whSetEditSearch(v){ whState.editSearch=(v||'').trim(); const box=document.getElementById('weList'); if(box) box.innerHTML=whEditList(); }
function whEditList(){
  const q=whState.editSearch.toLowerCase();
  const list=whInv().filter(it=>!q||((it.name||'')+' '+(it.code||'')).toLowerCase().includes(q)).sort(whByCat);
  if(!list.length) return `<div class="wh-empty">${whL('لا أصناف','No items')}</div>`;
  return INV_CATS.map(c=>{ const g=list.filter(it=>whCat(it)===c); if(!g.length) return ''; return `<div class="wh-group-h" style="margin-top:14px"><span>${CAT_ICO[c]} ${whCatLbl(c)}</span><small>${whNx(g.length)}</small></div>`+g.map(whRow).join(''); }).join('');
}
function whRenderEdit(){
  const o=document.getElementById('weOv'); if(!o) return;
  const linker=whH().linker?`<button class="wh-btn" onclick="whH().linker()">🖼️ ${whL('ربط الصور','Images')}</button>`:'';
  o.innerHTML=`<div class="il-top"><button class="wh-btn" onclick="whCloseEdit()">‹ ${whL('رجوع','Back')}</button><b>✏️ ${whL('تعديل المستودع','Edit warehouse')}</b><button class="wh-btn ok" onclick="whForm('')">➕ ${whL('صنف','Add')}</button></div>
  <div class="il-wrap">
    <div class="we-tools"><input class="wh-search" placeholder="🔍 ${whL('ابحث','Search')}" value="${whE(whState.editSearch)}" oninput="whSetEditSearch(this.value)" />${linker}</div>
    <p class="we-hint">${whL('عدّل الاسم أو الأسعار مباشرة وتنحفظ لما تطلع من الخانة. «المزيد» للوحدة والكود والكمية المستهدفة.','Edit names and prices inline; they save when you leave the field. “More” for unit, code and target qty.')}</p>
    <div id="weList">${whEditList()}</div>
    <button class="wh-btn ok we-new" onclick="whForm('')">➕ ${whL('إضافة صنف جديد','Add a new item')}</button>
  </div>`;
}
function whRow(it){
  return `<div class="we-row" id="we-${it.id}">
    <div class="we-thumb-wrap"><div class="we-thumb" ${it.image_url?`onclick="whZoom('${whE(it.image_url)}')"`:''}>${it.image_url?`<img src="${whE(it.image_url)}" loading="lazy" />`:(CAT_ICO[whCat(it)]||'📦')}</div>
      <label class="we-cam" title="${whL('صورة','Photo')}">📷<input type="file" accept="image/*" onchange="whRowPhoto('${it.id}',this)" /></label></div>
    <div class="we-fields">
      <input class="we-name" value="${whE(it.name)}" placeholder="${whL('اسم الصنف','Item name')}" onchange="whSave('${it.id}','name',this.value)" />
      <div class="we-grid">
        <label>${whL('شراء بالجملة','Wholesale cost')}<input type="number" inputmode="decimal" step="0.01" value="${+it.buy_price||0}" onchange="whSave('${it.id}','buy_price',this.value)" /></label>
        <label>${whL('بيع مقترح','Suggested price')}<input type="number" inputmode="decimal" step="0.01" value="${+it.sell_price||0}" onchange="whSave('${it.id}','sell_price',this.value)" /></label>
        <label>${whL('حد الطلب','Reorder at')}<input type="number" inputmode="decimal" value="${+it.min_qty||0}" onchange="whSave('${it.id}','min_qty',this.value)" /></label>
        <label>${whL('الفئة','Category')}<select onchange="whSave('${it.id}','category',this.value)">${INV_CATS.map(c=>`<option value="${c}" ${whCat(it)===c?'selected':''}>${whCatLbl(c)}</option>`).join('')}</select></label>
      </div>
      <div class="we-acts"><span class="we-meta">${whL('الكمية','Qty')} <b>${whNx(it.qty||0)}</b> ${whE(it.unit||'')}</span><button class="wh-btn" onclick="whForm('${it.id}')">⚙️ ${whL('المزيد','More')}</button><button class="wh-btn danger" onclick="whDelete('${it.id}')">🗑 ${whL('حذف','Delete')}</button></div>
    </div>
  </div>`;
}
async function whSave(id, field, val){
  const it=whFind(id); if(!it) return;
  let v; if(['buy_price','sell_price','min_qty','target_qty'].includes(field)) v=Math.abs(+val||0); else v=String(val==null?'':val).trim();
  if(field==='name'&&!v){ whT(whL('اكتب اسم الصنف','Enter a name')); return; }
  if(it[field]===v) return;
  it[field]=v;
  if(whH().cloud()){ try{ const r=await whH().sb().from(whH().table).update({[field]:v}).eq('id',it.id); if(r.error) throw r.error; }catch(e){ whT(whL('تعذّر الحفظ','Could not save')); return; } }
  if(whH().cacheSave) whH().cacheSave();
  whT('✅ '+whL('انحفظ','Saved'));
  if(field==='category'){ const box=document.getElementById('weList'); if(box) box.innerHTML=whEditList(); }
}
async function whRowPhoto(id,input){ const f=input.files&&input.files[0]; if(!f) return; const it=whFind(id); if(!it) return; whT('⏳ '+whL('جارٍ رفع الصورة…','Uploading photo…')); try{ it.image_url=await whH().upload(it.id,f); whT('✅ '+whL('انحفظت الصورة','Photo saved')); const row=document.getElementById('we-'+id); if(row) row.outerHTML=whRow(it); }catch(e){ whT('⚠️ '+whL('تعذّر رفع الصورة','Upload failed')); } }

/* ═ طلب شراء → PDF ═ */
function whOpenPO(){
  whState.poOpen=true; whState.poSearch=''; whState.poCat='all'; whState.PO={};
  whInv().forEach(it=>{ if(['low','out'].includes(invState(it))){ const n=invNeed(it); if(n>0) whState.PO[String(it.id)]=n; } });
  const old=document.getElementById('poOv'); if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend','<div class="il-ov po-ov" id="poOv"></div>'); whRenderPO(); window.scrollTo(0,0);
}
function whClosePO(){ whState.poOpen=false; const o=document.getElementById('poOv'); if(o) o.remove(); }
function whPoSearch(v){ whState.poSearch=(v||'').trim(); const b=document.getElementById('poList'); if(b) b.innerHTML=whPoList(); }
function whPoCat(c){ whState.poCat=c; whRenderPO(); }
function whPoSet(id,v){ id=String(id); v=Math.max(0,Math.round(+v||0)); if(v) whState.PO[id]=v; else delete whState.PO[id]; const n=document.getElementById('poq-'+id); if(n&&document.activeElement!==n) n.value=v||''; const row=document.getElementById('po-'+id); if(row) row.classList.toggle('sel',!!v); whPoBar(); }
function whPoStep(id,d){ whPoSet(id,(whState.PO[String(id)]||0)+d); }
function whPoClear(){ whState.PO={}; whRenderPO(); }
function whPoBar(){ const b=document.getElementById('poBar'); if(!b) return; const ids=Object.keys(whState.PO); const tot=ids.reduce((a,id)=>a+whState.PO[id],0);
  b.querySelector('.po-sum').innerHTML=ids.length?`<b>${whNx(ids.length)}</b> ${whL('صنف','items')} · <b>${whNx(tot)}</b> ${whL('قطعة','pcs')}`:whL('اختر الأصناف والكميات','Pick items and quantities');
  b.querySelector('.go').disabled=!ids.length; }
function whPoList(){
  const q=whState.poSearch.toLowerCase();
  const list=whInv().filter(it=>(!q||((it.name||'')+' '+(it.code||'')).toLowerCase().includes(q))&&(whState.poCat==='all'||whCat(it)===whState.poCat)).sort(whByCat);
  if(!list.length) return `<div class="wh-empty">${whL('لا أصناف','No items')}</div>`;
  const row=it=>{ const v=whState.PO[String(it.id)]||0, st=invState(it);
    return `<div class="po-row ${v?'sel':''}" id="po-${it.id}">
      <div class="we-thumb po-thumb">${it.image_url?`<img src="${whE(it.image_url)}" loading="lazy" />`:(CAT_ICO[whCat(it)]||'📦')}</div>
      <div class="po-info"><b>${whE(it.name)}</b><small>${whL('المتوفر','Have')} ${whNx(it.qty||0)} ${whE(it.unit||'')}${st==='out'?' · ⛔ '+whL('نفد','out'):st==='low'?' · ⚠️ '+whL('ناقص','low'):''}</small></div>
      <div class="po-step"><button class="ws-btn minus" onclick="whPoStep('${it.id}',-1)">−</button><input id="poq-${it.id}" type="number" inputmode="numeric" placeholder="0" value="${v||''}" oninput="whPoSet('${it.id}',this.value)" /><button class="ws-btn plus" onclick="whPoStep('${it.id}',1)">+</button></div>
    </div>`; };
  if(whState.poCat!=='all') return list.map(row).join('');
  return INV_CATS.map(c=>{ const g=list.filter(it=>whCat(it)===c); if(!g.length) return ''; return `<div class="wh-group-h" style="margin-top:14px"><span>${CAT_ICO[c]} ${whCatLbl(c)}</span><small>${whNx(g.length)}</small></div>`+g.map(row).join(''); }).join('');
}
function whRenderPO(){
  const o=document.getElementById('poOv'); if(!o) return;
  const cnt=c=>whInv().filter(it=>c==='all'||whCat(it)===c).length;
  o.innerHTML=`<div class="il-top"><button class="wh-btn" onclick="whClosePO()">‹ ${whL('رجوع','Back')}</button><b>🛒 ${whL('طلب شراء','Purchase order')}</b><button class="wh-btn" onclick="whPoClear()">${whL('مسح','Clear')}</button></div>
  <div class="il-wrap">
    <p class="we-hint">${whL('الأصناف الناقصة محطوطة تلقائيًا بالكمية المقترحة. عدّل الكميات أو أضف أصنافًا ثم اضغط «إنشاء PDF».','Low items are pre-filled with a suggested quantity. Adjust, add more, then tap “Create PDF”.')}</p>
    <div class="wh-tools" style="margin-top:8px"><input class="wh-search" placeholder="🔍 ${whL('ابحث','Search')}" value="${whE(whState.poSearch)}" oninput="whPoSearch(this.value)" /></div>
    <div class="wh-cats" style="margin-top:6px">
      <button class="wh-cat ${whState.poCat==='all'?'active':''}" onclick="whPoCat('all')">📦 ${whL('الكل','All')}<small>${whNx(cnt('all'))}</small></button>
      ${INV_CATS.map(c=>`<button class="wh-cat ${whState.poCat===c?'active':''}" onclick="whPoCat('${c}')">${CAT_ICO[c]} ${whCatLbl(c)}<small>${whNx(cnt(c))}</small></button>`).join('')}
    </div>
    <div id="poList">${whPoList()}</div>
    <div id="poOut"></div>
  </div>
  <div class="po-bar" id="poBar"><span class="po-sum"></span><button class="wh-btn" onclick="whClosePO()">${whL('إلغاء','Cancel')}</button><button class="wh-btn gold go" onclick="whMakePDF()">📄 ${whL('إنشاء PDF','Create PDF')}</button></div>`;
  whPoBar();
}
function whPoNumber(){ const d=new Date(); const p=n=>String(n).padStart(2,'0'); return 'PO-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes()); }
function whLoadJsPDF(){ return new Promise((res,rej)=>{ if(window.jspdf&&window.jspdf.jsPDF) return res(); const s=document.createElement('script'); s.src='vendor/jspdf.umd.min.js'; s.onload=()=>res(); s.onerror=()=>rej(new Error('jspdf')); document.head.appendChild(s); }); }
function whDrawPages(rows, meta){
  const W=1240, H=1754, M=80, ROW=54, HEAD=330, FOOT=170, perPage=Math.floor((H-HEAD-FOOT-M)/ROW);
  const font=f=>f+' Cairo, "Segoe UI", Tahoma, "Noto Sans Arabic", sans-serif';
  const pages=[]; const total=Math.max(1,Math.ceil(rows.length/perPage));
  for(let pg=0; pg<total; pg++){
    const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    x.fillStyle='#fff'; x.fillRect(0,0,W,H); x.direction='rtl'; x.textBaseline='middle';
    x.fillStyle='#F5C518'; x.fillRect(0,0,W,16);
    x.fillStyle='#1A1712'; x.textAlign='right'; x.font=font('900 44px'); x.fillText('طلب شراء',W-M,86);
    x.font=font('700 24px'); x.fillStyle='#6E685B'; x.fillText('Purchase Order',W-M,132);
    x.textAlign='left'; x.fillStyle='#1A1712'; x.font=font('900 30px'); x.fillText(meta.org,M,86);
    x.font=font('700 22px'); x.fillStyle='#6E685B'; x.fillText([meta.city,meta.phone].filter(Boolean).join(' · '),M,128);
    x.fillStyle='#EBE5D6'; x.fillRect(M,170,W-2*M,2);
    x.textAlign='right'; x.fillStyle='#1A1712'; x.font=font('800 24px');
    x.fillText('رقم الطلب: '+meta.no,W-M,208); x.fillText('التاريخ: '+meta.date,W-M-420,208);
    x.textAlign='left'; x.fillText(total>1?('صفحة '+(pg+1)+' / '+total):'',M,208);
    const cols=[{k:'i',w:70,l:'#'},{k:'name',w:600,l:'الصنف'},{k:'qty',w:150,l:'الكمية'},{k:'unit',w:130,l:'الوحدة'},{k:'price',w:130,l:'السعر'}];
    let y=HEAD-40; x.fillStyle='#1A1712'; x.fillRect(M,y-ROW/2,W-2*M,ROW);
    let cx=W-M; x.fillStyle='#F5C518'; x.font=font('900 24px'); x.textAlign='center';
    cols.forEach(cl=>{ x.fillText(cl.l,cx-cl.w/2,y); cx-=cl.w; });
    const slice=rows.slice(pg*perPage,(pg+1)*perPage);
    slice.forEach((r,i)=>{ y+=ROW; const idx=pg*perPage+i+1;
      x.fillStyle=i%2?'#FAF7EF':'#fff'; x.fillRect(M,y-ROW/2,W-2*M,ROW);
      x.fillStyle='#1A1712'; x.font=font('800 25px'); cx=W-M;
      cols.forEach(cl=>{ let v=cl.k==='i'?String(idx):cl.k==='qty'?String(r.qty):cl.k==='price'?'':String(r[cl.k]||'');
        if(cl.k==='name'){ x.textAlign='right'; let t=v; while(x.measureText(t).width>cl.w-24&&t.length>3) t=t.slice(0,-2); if(t!==v) t+='…'; x.fillText(t,cx-12,y); }
        else { x.textAlign='center'; x.fillText(v,cx-cl.w/2,y); }
        cx-=cl.w; });
      x.fillStyle='#EBE5D6'; x.fillRect(M,y+ROW/2-1,W-2*M,1); });
    if(pg===total-1){
      const totQ=rows.reduce((a,r)=>a+r.qty,0); y+=ROW+30;
      x.textAlign='right'; x.fillStyle='#1A1712'; x.font=font('900 26px'); x.fillText('الإجمالي: '+rows.length+' صنف · '+totQ+' قطعة',W-M,y);
      y+=48; x.font=font('700 22px'); x.fillStyle='#6E685B'; x.fillText('نرجو تزويدنا بأفضل سعر وموعد التوفر.',W-M,y);
      if(meta.phone){ y+=40; x.fillText('للتواصل: '+meta.phone,W-M,y); }
    }
    x.fillStyle='#EBE5D6'; x.fillRect(M,H-90,W-2*M,2); x.textAlign='center'; x.fillStyle='#6E685B'; x.font=font('700 20px'); x.fillText(meta.org+' · '+meta.no,W/2,H-58);
    pages.push(c);
  }
  return pages;
}
async function whShare(file){ try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:file.name}); return true; } }catch(e){ if(e&&e.name==='AbortError') return true; } return false; }
async function whMakePDF(){
  const rows=whInv().filter(it=>whState.PO[String(it.id)]>0).sort(whByCat).map(it=>({name:it.name||'',qty:whState.PO[String(it.id)],unit:it.unit||'حبة'}));
  if(!rows.length){ whT(whL('اختر صنفًا واحدًا على الأقل','Pick at least one item')); return; }
  const go=document.querySelector('#poBar .go'); if(go){ go.disabled=true; go.textContent='⏳'; }
  try{
    try{ await document.fonts.ready; }catch(e){}
    const d=new Date(); const o=whH().org||{}; const meta={ org:o.name||'', city:o.city||'', phone:o.phone||'', no:whPoNumber(), date:d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0') };
    const pages=whDrawPages(rows,meta); const name='طلب-شراء-'+meta.no+'.pdf';
    let blob=null;
    try{ await whLoadJsPDF(); const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
      pages.forEach((c,i)=>{ if(i) doc.addPage(); doc.addImage(c.toDataURL('image/jpeg',0.9),'JPEG',0,0,210,297); });
      blob=doc.output('blob'); }catch(e){ blob=null; }
    if(blob){
      const ok=await whShare(new File([blob],name,{type:'application/pdf'}));
      if(!ok) whShowResult(URL.createObjectURL(blob),name,pages[0]); else whT('✅ '+whL('جاهز، اختر التطبيق اللي تبي ترسله له','Ready, pick where to send it'));
    } else {
      const jpg=await new Promise(r=>pages[0].toBlob(r,'image/jpeg',0.9));
      const ok=await whShare(new File([jpg],name.replace('.pdf','.jpg'),{type:'image/jpeg'}));
      if(!ok) whShowResult(URL.createObjectURL(jpg),name.replace('.pdf','.jpg'),pages[0]);
    }
  }catch(e){ whT('⚠️ '+whL('تعذّر إنشاء الملف','Could not create the file')); }
  if(go){ go.disabled=false; go.textContent='📄 '+whL('إنشاء PDF','Create PDF'); }
}
function whShowResult(url,name,canvas){
  const out=document.getElementById('poOut'); if(!out) return;
  const isPdf=/\.pdf$/i.test(name);
  out.innerHTML=`<p class="po-note">📄 <b>${whE(name)}</b> · ${whL('اضغط «حفظ» أو افتحه بالمشاركة','Tap “Save” or open it to share')} <a class="wh-btn ok" style="display:inline-block;margin-inline-start:6px;text-decoration:none" href="${url}" download="${whE(name)}" target="_blank" rel="noopener">⤓ ${whL('حفظ','Save')}</a></p>
    <div class="po-result">${isPdf?`<iframe src="${url}"></iframe>`:''}<img src="${canvas.toDataURL('image/jpeg',0.85)}" alt="" ${isPdf?'style="display:none"':''} /></div>`;
  setTimeout(()=>{ try{ out.scrollIntoView({behavior:'smooth'}); }catch(e){} },100);
}

/* ═ نموذج الصنف الكامل ═ */
function whCompress(file, max, q){ return new Promise((res,rej)=>{ const img=new Image(); const url=URL.createObjectURL(file);
  img.onload=()=>{ const r=Math.min(1,(max||800)/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*r); c.height=Math.round(img.height*r);
    const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
    c.toBlob(b=>b?res(b):rej(new Error('blob')),'image/jpeg',q||0.82); };
  img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error('img')); }; img.src=url; }); }
async function whPickPhoto(input){ const f=input.files&&input.files[0]; if(!f) return; try{ whState.photo=await whCompress(f,800,0.82); whState.photoUrl=URL.createObjectURL(whState.photo); const im=document.getElementById('wf_img'); if(im) im.innerHTML='<img src="'+whState.photoUrl+'" />'; whT('📷 '+whL('الصورة جاهزة، اضغط حفظ','Photo ready, tap Save')); }catch(e){ whT(whL('تعذّر قراءة الصورة','Could not read the photo')); } }
async function whRemovePhoto(id){ whState.photo=null; whState.photoUrl=''; const im=document.getElementById('wf_img'); if(im) im.innerHTML='📦'; if(id){ const it=whFind(id); if(it){ it.image_url=null; try{ await whH().clearImage(it.id); }catch(e){} } } whT(whL('حُذفت الصورة','Photo removed')); }
function whForm(id){
  const it=id?whFind(id):null;
  const v=it||{name:'',code:'',category:whState.cat!=='all'?whState.cat:'كهرباء',unit:'حبة',qty:0,buy_price:0,sell_price:0,min_qty:0,target_qty:0};
  const old=document.getElementById('whOv'); if(old) old.remove();
  whState.photo=null; whState.photoUrl='';
  const opts=(id&&whH().imgOpts)?(whH().imgOpts(it.id)||[]):[];
  document.body.insertAdjacentHTML('beforeend',`<div class="wh-ov" id="whOv" onclick="if(event.target===this) whFormClose()"><div class="wh-modal">
    <h3>${it?'✏️ '+whL('تعديل الصنف','Edit item'):'➕ '+whL('صنف جديد','New item')}</h3>
    <div class="wh-f">
      <div class="wf-photo"><div class="we-thumb" id="wf_img">${v.image_url?`<img src="${whE(v.image_url)}" />`:'📦'}</div>
        <div class="btns"><label class="wh-btn ok camlbl">📷 ${whL('صورة الصنف','Item photo')}<input type="file" accept="image/*" onchange="whPickPhoto(this)" /></label>
        <button class="wh-btn" onclick="whRemovePhoto('${it?it.id:''}')">🗑 ${whL('بدون صورة','Remove')}</button></div>
        <small style="color:var(--muted,#6E685B);font-weight:600;font-size:.74rem">${whL('تظهر للفني عند اختيار القطعة وللعميل في طلباتي','Shown to technicians and customers')}</small></div>
      ${opts.length?`<div class="wh-hint" style="padding:8px"><b style="display:block;margin-bottom:6px">🖼️ ${whL('خيارات جاهزة، اضغط وحدة','Ready options, tap one')}</b><div class="il-grid" style="margin:0">${opts.map(u=>`<div class="il-opt ${u===(v.image_url||'')?'sel':''}" onclick="whH().pickImg('${it.id}','${whE(u)}');const im=document.getElementById('wf_img');if(im)im.innerHTML='<img src=&quot;'+'${whE(u)}'+'&quot; />';this.parentElement.querySelectorAll('.il-opt').forEach(x=>x.classList.remove('sel'));this.classList.add('sel')"><img src="${whE(u)}" loading="lazy" /></div>`).join('')}</div></div>`:''}
      <label class="full">${whL('اسم الصنف','Item name')}<input id="wf_name" value="${whE(v.name)}" placeholder="${whL('لمبة 9 وات أصفر','9W bulb warm')}" /></label>
      <label>${whL('الفئة','Category')}<select id="wf_cat">${INV_CATS.map(c=>`<option value="${c}" ${whCat(v)===c?'selected':''}>${whCatLbl(c)}</option>`).join('')}</select></label>
      <label>${whL('الوحدة','Unit')}<input id="wf_unit" value="${whE(v.unit||'حبة')}" placeholder="${whL('حبة / متر / لفة','pc / m / roll')}" /></label>
      <label>${whL('الكود (اختياري)','Code (optional)')}<input id="wf_code" value="${whE(v.code||'')}" placeholder="lb9yra" /></label>
      ${it?'':`<label>${whL('الكمية الحالية','Current qty')}<input id="wf_qty" type="number" inputmode="decimal" value="${v.qty}" /></label>`}
      <label>${whL('سعر الشراء بالجملة للوحدة','Wholesale cost per unit')}<input id="wf_buy" type="number" inputmode="decimal" step="0.01" value="${v.buy_price||0}" /></label>
      <label>${whL('سعر البيع المقترح للوحدة','Suggested sell price')}<input id="wf_sell" type="number" inputmode="decimal" step="0.01" value="${v.sell_price||0}" /></label>
      <label>${whL('حد الطلب (تنبيه)','Reorder at')}<input id="wf_min" type="number" inputmode="decimal" value="${v.min_qty||0}" /></label>
      <label>${whL('الكمية المستهدفة','Target qty')}<input id="wf_target" type="number" inputmode="decimal" value="${v.target_qty||0}" /></label>
      <div class="wh-hint">${whL('لما تنزل الكمية إلى حد الطلب يطلع الصنف في طلب الشراء تلقائيًا بكمية تكمّل المستهدف.','When qty reaches the reorder level the item is pre-filled in the purchase order up to the target.')}</div>
    </div>
    <div class="wh-actions">${it?`<button class="wh-btn danger" onclick="whDelete('${it.id}')">🗑 ${whL('حذف','Delete')}</button>`:''}<button class="wh-btn" onclick="whFormClose()">${whL('إلغاء','Cancel')}</button><button class="wh-btn ok" onclick="whFormSave('${it?it.id:''}')">💾 ${whL('حفظ','Save')}</button></div>
  </div></div>`);
  setTimeout(()=>{ const e=document.getElementById('wf_name'); if(e&&!it) e.focus(); },50);
}
function whFormClose(){ const o=document.getElementById('whOv'); if(o) o.remove(); }
function whAfter(){ if(whState.editOpen){ const box=document.getElementById('weList'); if(box) box.innerHTML=whEditList(); } if(whState.poOpen) whRenderPO(); if(whH().cacheSave) whH().cacheSave(); whH().afterChange(); }
async function whFormSave(id){
  const g=k=>{ const e=document.getElementById(k); return e?e.value.trim():''; };
  const num=k=>Math.abs(+g(k)||0);
  const name=g('wf_name'); if(!name){ whT(whL('اكتب اسم الصنف','Enter the item name')); return; }
  const patch={ name, code:g('wf_code'), category:g('wf_cat')||'عام', unit:g('wf_unit')||'حبة', buy_price:num('wf_buy'), sell_price:num('wf_sell'), min_qty:num('wf_min'), target_qty:num('wf_target') };
  const H=whH();
  if(id){
    const it=whFind(id); if(!it) return;
    Object.assign(it,patch);
    if(H.cloud()){ try{ const r=await H.sb().from(H.table).update(patch).eq('id',it.id); if(r.error) throw r.error; }catch(e){ whT(whL('تعذّر الحفظ','Could not save')); return; } }
    if(whState.photo&&H.cloud()){ try{ it.image_url=await H.upload(it.id, whState.photo); }catch(e){ whT('⚠️ '+whL('الصنف انحفظ لكن الصورة ما انرفعت','Saved, but the photo failed to upload')); } }
    whT('✅ '+whL('تعدّل الصنف','Item updated'));
  } else {
    const qty=num('wf_qty'); const data=Object.assign({qty},patch,(H.extra&&H.extra())||{});
    if(H.cloud()){ try{ const r=await H.sb().from(H.table).insert(data).select().single(); if(r.error) throw r.error; H.inv().unshift(r.data); if(qty>0) await H.logStock(r.data,qty,'رصيد افتتاحي'); if(whState.photo){ try{ r.data.image_url=await H.upload(r.data.id, whState.photo); }catch(e){ whT('⚠️ '+whL('الصنف انحفظ لكن الصورة ما انرفعت','Saved, but the photo failed to upload')); } } }catch(e){ whT(whL('تعذّر الحفظ','Could not save')); return; } }
    else H.inv().unshift(Object.assign({id:'tmp'+Date.now()},data));
    whT('✅ '+whL('أُضيف الصنف للمستودع','Item added'));
  }
  whFormClose(); whAfter();
}
async function whDelete(id){
  const it=whFind(id); if(!it) return; const H=whH();
  if(!confirm(whL('حذف «'+it.name+'» نهائيًا من المستودع؟','Delete “'+it.name+'” permanently?'))) return;
  if(H.cloud()){ try{ const r=await H.sb().from(H.table).delete().eq('id',it.id); if(r.error) throw r.error; }catch(e){ whT(whL('تعذّر الحذف','Could not delete')); return; } }
  H.setInv(H.inv().filter(x=>String(x.id)!==String(id))); delete whState.PO[String(id)]; whFormClose(); whT('🗑 '+whL('حُذف','Deleted')+' '+it.name); whAfter();
}
