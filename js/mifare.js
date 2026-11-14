/* ===== MIFARE ===== */
let sel=0,auth=0;const rd=new Set(),dump=new Uint8Array(1024),fmt=d=>[0,1,2,3].map(r=>hex(d.slice(r*16,r*16+16))).join('\n');
$('#secs').innerHTML=[...Array(16).keys()].map(i=>`<button data-s="${i}">${i}</button>`).join('');
$('#ts').innerHTML=[...Array(16).keys()].map(i=>`<option>Сектор ${i}</option>`).join('');
function pick(i){sel=i;$$('#secs button').forEach(b=>b.classList.toggle('on',b.dataset.s==i));$('#sh').textContent=`Данные сектора ${i} (64 байта, hex — по 16 байт в строке)`;$('#hexa').value=rd.has(i)?fmt(dump.slice(i*64,i*64+64)):''}
$('#secs').onclick=e=>{const b=e.target.closest('button');if(b)pick(+b.dataset.s)};
const sb=i=>$(`#secs button[data-s="${i}"]`),mark=i=>{rd.add(i);sb(i).classList.add('rd')},unmark=i=>{rd.delete(i);sb(i).classList.remove('rd')};
function store(i,d){dump.set(d.subarray(0,64),i*64);mark(i)}
const key=(id,def)=>{const v=$(id).value.replace(/[^0-9a-f]/gi,'');return v.length==12?unhex(v):v.length==0?(def?FF:new Uint8Array(6)):null};
function keys(){const a=key('#ka',1),b=key('#kb',0);if(!a)bad($('#ka'),'Key A — ровно 12 hex-символов.');else if(!b)bad($('#kb'),'Key B — ровно 12 hex-символов.');return a&&b?{a,b,f:auth+1}:null}
function same(d,b,s){for(let i=s?0:16;i<48;i++)if(d[i]!=b[i])return 0;for(let i=54;i<58;i++)if(d[i]!=b[i])return 0;return 1}
let curUid='';
function fill(c){curUid=hex(c.uid).replace(/ /g,'');$('#mu').textContent=hex(c.uid);$('#ma').textContent=c.atqa.toString(16).toUpperCase().padStart(4,'0');$('#ms').textContent=c.sak<0?'?':hx(c.sak);$('#mt').textContent=tname(c.sak,c.atqa)}
async function cardInfo(){const c=await rdHf();if(!c)return null;await act();const s0=await rdSec(0,1,key('#ka',1)||FF,null);c.sak=s0&&s0.length>=16?s0[5]:-1;fill(c);return c}
$('#auth').onclick=e=>{auth=(auth+1)%3;e.target.textContent=['Key A','Key B','A + B'][auth]};
$('#mrc').onclick=e=>op(e.currentTarget,async()=>{log('Читаю карту 13.56 МГц…');const c=await cardInfo();if(!c)return log('Карта не найдена.'),toast('Карта не найдена.');log(`UID ${hex(c.uid).replace(/ /g,'')} · ${$('#mt').textContent}`)});
$('#mr').onclick=e=>op(e.currentTarget,async()=>{const k=keys();if(!k)return;log(`Читаю сектор ${sel}…`);await act();const d=await rdSec(sel,k.f,k.a,k.b);
 if(!d)return log(`Сектор ${sel}: нет карты или ключ не подошёл.`),toast('Не удалось прочитать сектор — проверьте карту и ключ.');store(sel,d);$('#hexa').value=fmt(d.slice(0,64));log(`Сектор ${sel}: прочитано ${Math.min(64,d.length)} байт.`)});
$('#secs').onclick=e=>{const b=e.target.closest('button');if(b)pick(+b.dataset.s)};
$('#mw').onclick=()=>{const v=$('#hexa').value.replace(/\s/g,'');if(!/^[0-9a-f]{128}$/i.test(v))return toast('Нужно ровно 64 байта (128 hex-символов).');
 confirmBox('Записать сектор '+sel+'?','Данные в секторе на карте будут перезаписаны и проверены обратным чтением.',()=>op($('#mw'),async()=>{const k=keys();if(!k)return;const d=unhex(v);if(!d.slice(48,54).some(x=>x))d.set(k.a,48);log(`Пишу сектор ${sel}…`);
  const ok=await pr('Запись сектора '+sel,async p=>{p(.2);await act();if(!await wrSec(sel,k.f,k.a,k.b,d))return 0;p(.6);await act();const b=await rdSec(sel,k.f,k.a,k.b);p(1);if(b&&same(d,b,sel)){store(sel,b);return 1}return 0});
  log(ok?`Сектор ${sel}: записан и проверен.`:`Сектор ${sel}: запись не подтверждена (нет ответа или данные не совпали).`);if(!ok)toast('Запись не подтверждена.')}))};
$('#mf2').onclick=()=>confirmBox('Форматировать сектор '+sel+'?','Данные станут 00, ключи — FF. Это действие нельзя отменить.',()=>op($('#mf2'),async()=>{const k=keys();if(!k)return;
 const ok=await pr('Форматирование сектора '+sel,async p=>{p(.3);const r=await fmtSec(sel,k.f,k.a,k.b);p(1);return r});if(ok){unmark(sel);$('#hexa').value=''}log(`Форматирование сектора ${sel}: ${ok?'ок':'ошибка'}`)}),1);
$('#mra').onclick=e=>op(e.currentTarget,async()=>{const k=keys();if(!k)return;log('Читаю все 16 секторов…');await cardInfo();let n=0;
 await pr('Чтение карты',async p=>{for(let i=0;i<16;i++){await act();const d=await rdSec(i,k.f,k.a,k.b);if(d){store(i,d);n++}else unmark(i);p((i+1)/16)}});pick(sel);log(`Готово: прочитано ${n} из 16 секторов.`);if(n<16)toast(`Прочитано ${n} из 16 — для остальных нужен другой ключ.`)});
$('#msv').onclick=()=>{if(!rd.size)return toast('Нет данных: сначала прочитайте карту или загрузите дамп.');const n=`card_${curUid||'dump'}.mfd`;saveFile(n,dump);log(`Дамп сохранён: ${n}`+(rd.size<16?` (прочитано только ${rd.size} из 16 секторов, остальное — нули)`:''))};
$('#mld').onclick=async()=>{const f=await pickFile();if(!f)return;if(f.d.length!=1024)return toast('Нужен дамп 1024 байта (Mifare Classic 1K).');dump.set(f.d);for(let i=0;i<16;i++)mark(i);pick(sel);log(`Дамп загружен: ${f.n} (16 секторов)`)};
$('#mwa').onclick=()=>rd.size?confirmBox('Записать весь дамп?',`Будет записано секторов: ${rd.size}. Данные на карте перезапишутся.`,()=>op($('#mwa'),async()=>{const k=keys();if(!k)return;let ok=0;log('Пишу все сектора…');
 await pr('Запись дампа на карту',async p=>{for(let i=0;i<16;i++){if(rd.has(i)){const d=dump.slice(i*64,i*64+64);if(!d.slice(48,54).some(x=>x))d.set(k.a,48);await act();if(await wrSec(i,k.f,k.a,k.b,d))ok++}p((i+1)/16)}});log(`Дамп записан: ${ok} из ${rd.size} секторов.`);if(ok<rd.size)toast('Не все сектора записались.')}),1):toast('Нет данных: сначала прочитайте карту или загрузите дамп.');
pick(0);
