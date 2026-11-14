const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),hx=n=>n.toString(16).toUpperCase().padStart(2,'0');
const IC={info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',scan:'<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8"/>',card:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',wave:'<path d="M3 12h3l2-6 4 12 2-6h7"/>',hid:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>',term:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10l3 2-3 2M12 15h5"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24">${IC[n]}</svg>`;
const PAL={lav:['Лаванда',['#6750A4','#E8DEF8','#F3EDF7','#F7F2FA','#CFC4DC','#1D1B20','#49454F'],['#D0BCFF','#4F378B','#141218','#2B2930','#49454F','#E6E0E9','#CAC4D0']],
mint:['Мята',['#386A20','#C8E6C9','#F2F8F1','#EDF6EA','#BFD8BC','#191D17','#43503F'],['#A8D77E','#31502A','#11150F','#262B24','#44483F','#E2E4DC','#C2C9BC']],
peach:['Персик',['#8B5000','#FFDCC2','#FFF8F4','#FFF1E8','#E8C4A8','#221A12','#5C4A3C'],['#FFB77C','#6A3C00','#17120E','#2C231B','#4A4034','#F0E0D2','#D3C2B2']],
sky:['Небо',['#00639B','#CDE5FF','#F4F8FC','#EAF3FB','#B9CFE2','#0F1B24','#42525F'],['#9CCBF7','#004C72','#0F1418','#202830','#3A4854','#DEE3E8','#B9C6D0']],
rose:['Роза',['#9C4146','#FFD9DA','#FDF3F3','#FBEBEC','#E3BCBD','#25191A','#5E4A4B'],['#FFB3B5','#732E33','#171112','#2B2223','#4A3B3C','#F0E2E3','#D9C2C4']]};
var WA=5;let th={p:'lav',d:'light',r:28,n:'n',f:13,w:5,a:'on',l:'c',c:'#6750A4'};try{Object.assign(th,JSON.parse(localStorage.getItem('pmth')||'{}'))}catch(e){}
function applyTh(){const R=document.documentElement,dk=th.d=='dark',v=th.p=='custom'?cust(th.c,dk):PAL[th.p][dk?2:1],k=['--p','--pc','--s','--f','--ol','--t','--t2'];
 k.forEach((n,i)=>R.style.setProperty(n,v[i]));R.style.setProperty('--c',dk?`color-mix(in srgb,${v[2]},#fff 5%)`:'#fff');R.dataset.d=th.d;
 $$('#sd button').forEach(b=>b.classList.toggle('on',b.dataset.v==th.d));$$('#sw button').forEach(b=>b.classList.toggle('on',b.dataset.p==th.p));
 R.style.setProperty('--r',th.r+'px');R.dataset.n=th.n;R.dataset.a=th.a;document.body.style.fontSize=th.f+'px';WA=+th.w;$$('[data-k]').forEach(g=>$$('button',g).forEach(b=>b.classList.toggle('on',b.dataset.v==th[g.dataset.k])));const cs=$('.cs');if(cs)cs.classList.toggle('on',th.p=='custom');try{localStorage.setItem('pmth',JSON.stringify(th))}catch(e){}}
$('#sw').innerHTML=Object.keys(PAL).map(k=>`<button data-p="${k}" title="${PAL[k][0]}" aria-label="${PAL[k][0]}" data-sh="${{lav:'9:.1',mint:'6:.16',peach:'12:.06',sky:'4:.14',rose:'5:.13'}[k]}:40" style="background:${PAL[k][1][0]}"></button>`).join('');
$('#sw').onclick=e=>{const b=e.target.closest('button');if(b){th.p=b.dataset.p;applyTh()}};
$('#sd').onclick=e=>{const b=e.target.closest('button');if(b){th.d=b.dataset.v;applyTh()}};
applyTh();
$('#rgi').innerHTML=ic('scan');$('#srings').insertAdjacentHTML('beforeend',ic('scan'));

function log(m){const e=$('#log'),d=document.createElement('div');d.textContent=new Date().toTimeString().slice(0,8)+'   '+m;e.append(d);e.scrollTop=e.scrollHeight}
let tto;function toast(m){const t=$('#tt');t.textContent=m;t.classList.add('on');clearTimeout(tto);tto=setTimeout(()=>t.classList.remove('on'),2600)}
async function busy(b,fn){b.disabled=true;try{await fn()}finally{b.disabled=false}}
function confirmBox(t,m,fn,danger){$('#cft').textContent=t;$('#cfm').textContent=m;const o=$('#cfo');o.className='btn '+(danger?'err':'fil');o.onclick=()=>{$('#dcf').close();fn()};$('#dcf').showModal()}
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target==d||e.target.dataset.close!==undefined)d.close()}));
const hexOk=(v,n)=>new RegExp('^[0-9A-Fa-f]{'+n+'}$').test(v.trim());
function bad(el,m){el.classList.add('bad');setTimeout(()=>el.classList.remove('bad'),1800);toast(m);log(m)}

/* M3E shapes + wavy progress */
function shp(n,a,s){let d='';const R=s/2,r0=R*(1-a)*.98;for(let i=0;i<=120;i++){const t=i/120*6.2832,r=r0*(1+a*Math.cos(n*t));d+=(i?'L':'M')+(R+r*Math.cos(t)).toFixed(1)+' '+(R+r*Math.sin(t)).toFixed(1)}return`path('${d}Z')`}
$$('.rings').forEach(g=>$$('b',g).forEach((b,i)=>b.dataset.sh=['12:.07:190','8:.1:146','9:.09:102'][i]));
$$('[data-sh]').forEach(e=>{const[n,a,s]=e.dataset.sh.split(':');e.style.clipPath=shp(+n,+a,+s)});
[[9,.1],[6,.18],[12,.06],[4,.16]].forEach((a,i)=>document.documentElement.style.setProperty('--k'+(i+1),shp(a[0],a[1],20)));
$('#lg').onclick=()=>{$('#app').classList.toggle('lo');const e=$('#log');e.scrollTop=e.scrollHeight};
if(th.l=='o')$('#app').classList.add('lo');
$('#dset').addEventListener('click',e=>{const b=e.target.closest('.seg[data-k] button');if(!b)return;const k=b.parentNode.dataset.k;th[k]=b.dataset.v;applyTh();if(k=='l')$('#app').classList.toggle('lo',th.l=='o')});
$('#sw').insertAdjacentHTML('beforeend','<label class="cs" data-sh="7:.12:40" title="Свой цвет"><input type="color" id="cc" value="'+th.c+'"></label>');
$('#cc').oninput=e=>{th.p='custom';th.c=e.target.value;applyTh()};
function cust(c,dk){const m=(a,p,b)=>`color-mix(in srgb,${a} ${p}%,${b})`;return dk?[m(c,60,'#fff'),m(c,55,'#000'),m(c,12,'#0d0d0f'),m(c,16,'#1a1a1d'),m(c,25,'#3a3a3e'),m(c,8,'#eee'),m(c,12,'#bbb')]:[c,m(c,22,'#fff'),m(c,8,'#fff'),m(c,12,'#fff'),m(c,28,'#fff'),m(c,12,'#111'),m(c,30,'#555')]}
let P=0,run=0;
function wave(t){const A=WA*(P>.95?(1-P)/.05:1),e=388*P+6;let d='M6 12';for(let x=6;x<=e;x+=3)d+=`L${x} ${(12+A*Math.sin(x/22-t/170)).toFixed(1)}`;$('#pw').setAttribute('d',d);const k=$('#pk');k.setAttribute('x1',Math.min(e+14,394));k.style.opacity=P>.96?0:1}
async function prog(title,ms,tick){const g=$('#pg');$('#pt').textContent=title;P=0;run=1;g.classList.add('on');requestAnimationFrame(function l(t){if(run){wave(t);requestAnimationFrame(l)}});const s=performance.now();while(P<1){await sleep(40);P=Math.min(1,(performance.now()-s)/ms);$('#pp').textContent=Math.round(P*100)+'%';tick&&tick(P)}await sleep(450);g.classList.remove('on');run=0}
