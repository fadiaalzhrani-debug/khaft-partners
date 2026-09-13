/* ═══ جولة تعريفية لتطبيق رزق: تظهر مرة وحدة بعد أول دخول، تبدأ باختيار اللغة ثم تضيء كل زر وتشرحه ═══ */
(function(){
const TXT={
 ar:{dir:'rtl',next:'التالي',prev:'السابق',skip:'تخطي',start:'ابدأ الشرح',done:'يلا نبدأ',
  s:[
   ['أهلًا بك في رزق 👋','شرح سريع لأهم الأزرار، أقل من دقيقة.'],
   ['📋 الطلبات','هنا كل طلباتك. أول ما يوصل طلب جديد يجيك إشعار، افتحه وشوف العميل والعنوان والموعد.'],
   ['أزرار الطلب','امشِ بالترتيب: «أنا في الطريق»، ثم «وصلت الموقع»، ثم «بدء العمل»، ثم «تم الإنجاز». العميل يوصله إشعار مع كل خطوة.'],
   ['📦 المستودع','صورة كل قطعة وكميتها. كل صرف أو إدخال ينحفظ باسمك.'],
   ['صرف قطعة','أخذت قطعة للشغل؟ اضغط − مرة، واكتب اسم العميل أو رقم الطلب. جبت قطع جديدة؟ اضغط +.'],
   ['🧾 الفواتير','بعد ما تخلص الشغل افتح الطلب واضغط «إنشاء فاتورة»، اختر الخدمة والقطع، وتوصل للعميل على جواله.'],
   ['📅 حجز لعميل','العميل يبي شغل ثاني؟ احجز له موعد جديد من هنا وأنت عنده.'],
   ['👤 حسابي','كلمة المرور واللغة، وتقدر ترجع لهذا الشرح من هنا.'],
   ['جاهز! 🎉','هذا كل شي. أي سؤال كلّم مديرك.']
  ]},
 en:{dir:'ltr',next:'Next',prev:'Back',skip:'Skip',start:'Start the tour',done:"Let's go",
  s:[
   ['Welcome to Rizq 👋','A quick tour of the main buttons, under a minute.'],
   ['📋 Jobs','All your jobs are here. When a new job arrives you get a notification. Open it to see the customer, address and time.'],
   ['Job buttons','Go in order: “On my way”, then “I have arrived on site”, then “Start job”, then “Mark complete”. The customer is notified at each step.'],
   ['📦 Stock','A photo and quantity for every part. Every issue or stock-in is saved under your name.'],
   ['Issuing a part','Took a part for a job? Tap − once and write the customer name or job number. Got new parts? Tap +.'],
   ['🧾 Invoices','When the job is done, open it and tap “Create invoice”. Pick the service and parts, and it reaches the customer’s phone.'],
   ['📅 Book','Customer wants more work? Book a new visit here while you are with them.'],
   ['👤 Account','Password and language, and you can replay this tour from here.'],
   ['All set! 🎉','That’s it. Any questions, ask your manager.']
  ]},
 ne:{dir:'ltr',next:'अर्को',prev:'पछाडि',skip:'छोड्नुहोस्',start:'परिचय सुरु गर्नुहोस्',done:'सुरु गरौं',
  s:[
   ['रिज्कमा स्वागत छ 👋','मुख्य बटनहरूको छोटो परिचय, एक मिनेटभन्दा कम।'],
   ['📋 कामहरू','तपाईंका सबै काम यहाँ छन्। नयाँ काम आउँदा सूचना आउँछ। खोलेर ग्राहक, ठेगाना र समय हेर्नुहोस्।'],
   ['कामका बटनहरू','क्रमैसँग थिच्नुहोस्: “बाटोमा छु”, “म स्थानमा पुगें”, “काम सुरु गर्नुहोस्”, “सम्पन्न भयो”। हरेक चरणमा ग्राहकलाई सूचना जान्छ।'],
   ['📦 स्टक','हरेक सामानको फोटो र संख्या। हरेक निकासी वा थप तपाईंको नाममा बचत हुन्छ।'],
   ['सामान निकाल्ने','कामको लागि सामान लिनुभयो? − एक पटक थिच्नुहोस् र ग्राहकको नाम वा कामको नम्बर लेख्नुहोस्। नयाँ सामान आयो? + थिच्नुहोस्।'],
   ['🧾 बिलहरू','काम सकिएपछि काम खोलेर “बिल बनाउनुहोस्” थिच्नुहोस्। सेवा र सामान छान्नुहोस्, बिल ग्राहकको फोनमा पुग्छ।'],
   ['📅 बुकिङ','ग्राहकलाई थप काम चाहियो? उतै बसेर यहाँबाट नयाँ समय बुक गर्नुहोस्।'],
   ['👤 खाता','पासवर्ड र भाषा, र यो परिचय फेरि यहाँबाट हेर्न सकिन्छ।'],
   ['तयार! 🎉','यत्ति नै। केही प्रश्न भए आफ्नो म्यानेजरलाई सोध्नुहोस्।']
  ]},
 hi:{dir:'ltr',next:'आगे',prev:'पीछे',skip:'छोड़ें',start:'परिचय शुरू करें',done:'चलो शुरू करें',
  s:[
   ['रिज़्क़ में आपका स्वागत है 👋','मुख्य बटनों का छोटा परिचय, एक मिनट से कम।'],
   ['📋 काम','आपके सभी काम यहाँ हैं। नया काम आने पर सूचना आती है। खोलकर ग्राहक, पता और समय देखें।'],
   ['काम के बटन','क्रम से दबाएँ: “रास्ते में हूँ”, “मैं साइट पर पहुँच गया”, “काम शुरू करें”, “पूर्ण हुआ”। हर चरण पर ग्राहक को सूचना जाती है।'],
   ['📦 स्टॉक','हर सामान की फोटो और मात्रा। हर निकासी या जमा आपके नाम से सेव होती है।'],
   ['सामान निकालना','काम के लिए सामान लिया? − एक बार दबाएँ और ग्राहक का नाम या काम नंबर लिखें। नया सामान आया? + दबाएँ।'],
   ['🧾 बिल','काम पूरा होने पर काम खोलें और “बिल बनाएं” दबाएँ। सेवा और सामान चुनें, बिल ग्राहक के फोन पर पहुँचेगा।'],
   ['📅 बुकिंग','ग्राहक को और काम चाहिए? वहीं रहते हुए यहाँ से नई विज़िट बुक करें।'],
   ['👤 खाता','पासवर्ड और भाषा, और यह परिचय यहाँ से दोबारा देख सकते हैं।'],
   ['तैयार! 🎉','बस इतना ही। कोई सवाल हो तो अपने मैनेजर से पूछें।']
  ]},
 ur:{dir:'rtl',next:'اگلا',prev:'پیچھے',skip:'چھوڑیں',start:'تعارف شروع کریں',done:'چلیں شروع کریں',
  s:[
   ['رزق میں خوش آمدید 👋','اہم بٹنوں کا مختصر تعارف، ایک منٹ سے کم۔'],
   ['📋 کام','آپ کے سارے کام یہاں ہیں۔ نیا کام آنے پر اطلاع آتی ہے۔ کھول کر گاہک، پتہ اور وقت دیکھیں۔'],
   ['کام کے بٹن','ترتیب سے دبائیں: “راستے میں ہوں”، “میں سائٹ پر پہنچ گیا”، “کام شروع کریں”، “مکمل ہوا”۔ ہر مرحلے پر گاہک کو اطلاع جاتی ہے۔'],
   ['📦 اسٹاک','ہر سامان کی تصویر اور تعداد۔ ہر نکاسی یا اضافہ آپ کے نام سے محفوظ ہوتا ہے۔'],
   ['سامان نکالنا','کام کے لیے سامان لیا؟ − ایک بار دبائیں اور گاہک کا نام یا کام نمبر لکھیں۔ نیا سامان آیا؟ + دبائیں۔'],
   ['🧾 بل','کام مکمل ہونے پر کام کھولیں اور “بل بنائیں” دبائیں۔ سروس اور سامان چنیں، بل گاہک کے فون پر پہنچے گا۔'],
   ['📅 بکنگ','گاہک کو مزید کام چاہیے؟ وہیں رہتے ہوئے یہاں سے نئی وزٹ بک کریں۔'],
   ['👤 اکاؤنٹ','پاس ورڈ اور زبان، اور یہ تعارف یہاں سے دوبارہ دیکھ سکتے ہیں۔'],
   ['تیار! 🎉','بس اتنا ہی۔ کوئی سوال ہو تو اپنے مینیجر سے پوچھیں۔']
  ]}
};
// لكل خطوة: التبويب اللي يفتح + العنصر اللي يضيء (فارغ = بطاقة بالنص في الوسط)
const STEPS=[
 {tab:null, sel:null},
 {tab:'orders', sel:'.tabbar .tb:nth-child(1)'},
 {tab:'orders', sel:'.tjob .tacts'},
 {tab:'inv', sel:'.tabbar .tb:nth-child(2)'},
 {tab:'inv', sel:'.ws-item .ws-step'},
 {tab:'invoices', sel:'.tabbar .tb:nth-child(4)'},
 {tab:'book', sel:'.tabbar .tb:nth-child(3)'},
 {tab:null, sel:'#acctBtn'},
 {tab:null, sel:null}
];
const LANGS=[['ar','عربي','Arabic'],['en','English','English'],['ne','नेपाली','Nepali'],['hi','हिन्दी','Hindi'],['ur','اردو','Urdu']];
let L='ar', i=0;
const $=s=>document.querySelector(s);
function clear(){ document.querySelectorAll('.kt-layer').forEach(e=>e.remove()); }
function langPicker(){
  clear();
  document.body.insertAdjacentHTML('beforeend',`<div class="kt-layer kt-full"><div class="kt-card kt-lang">
    <div class="kt-ic">🌐</div><h2>اختر لغتك</h2><p>Choose your language · भाषा छान्नुहोस्</p>
    <div class="kt-langs">${LANGS.map(([k,n,e])=>`<button type="button" onclick="khTour.pick('${k}')"><b>${n}</b><small>${e}</small></button>`).join('')}</div>
  </div></div>`);
}
function show(n){
  i=Math.max(0,Math.min(STEPS.length-1,n)); clear();
  const st=STEPS[i], T=TXT[L]||TXT.ar, [title,body]=T.s[i];
  if(st.tab && typeof setTab==='function' && window.tab!==st.tab) setTab(st.tab);
  const last=i===STEPS.length-1, first=i===0;
  const dots=STEPS.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');
  const card=`<div class="kt-card kt-tip" dir="${T.dir}">
    ${(!first&&!last)?`<button type="button" class="kt-skip" onclick="khTour.end()">${T.skip}</button>`:''}
    <h3>${title}</h3><p>${body}</p>
    <div class="kt-foot"><div class="kt-dots">${dots}</div>
      <div class="kt-btns">${(!first&&!last)?`<button type="button" class="kt-prev" onclick="khTour.show(${i-1})">${T.prev}</button>`:''}
      <button type="button" class="kt-next" onclick="${last?'khTour.end()':'khTour.show('+(i+1)+')'}">${first?T.start:last?T.done:T.next}</button></div></div>
  </div>`;
  const el=st.sel?$(st.sel):null;
  if(!el){ document.body.insertAdjacentHTML('beforeend',`<div class="kt-layer kt-full">${card}</div>`); return; }
  el.scrollIntoView({block:'center'});
  const r=el.getBoundingClientRect(), pad=8, vh=innerHeight;
  const hole=`<div class="kt-hole" style="top:${r.top-pad}px;left:${r.left-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>`;
  const below=r.top<vh/2;
  document.body.insertAdjacentHTML('beforeend',`<div class="kt-layer kt-spot">${hole}<div class="kt-tipwrap" style="${below?`top:${Math.min(vh-230,r.bottom+pad+14)}px`:`bottom:${Math.max(12,vh-r.top+pad+14)}px`}">${card}</div></div>`);
}
window.khTour={
  start(opts){ opts=opts||{}; if(opts.lang){ L=opts.lang; } if(opts.step!=null){ show(opts.step); return; } langPicker(); },
  pick(l){ L=l; try{ if(typeof setLang==='function') setLang(l); }catch(e){} show(0); },
  show, end(){ clear(); try{ localStorage.setItem('kh_tour_done','1'); }catch(e){} if(typeof setTab==='function') setTab('home'); },
  langPicker
};
})();
