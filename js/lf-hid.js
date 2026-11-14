/* ===== 125 кГц / HID ===== */
const cmp=d=>hex(d).replace(/ /g,'');
let lastLf=null,lastHid=null;
function lfShow(d){lastLf=d;const n=d.length;$('#lid').textContent=cmp(d)||'—';if(n<5){$('#lcu').textContent=$('#lnu').textContent=$('#lfm').textContent='—';return}
 const c=d[n-5],u=((d[n-4]<<24)|(d[n-3]<<16)|(d[n-2]<<8)|d[n-1])>>>0;$('#lcu').textContent='0x'+hx(c);$('#lnu').textContent=u;$('#lfm').textContent=String(u>>>16&0xFFFF).padStart(5,'0')+','+String(u&0xFFFF).padStart(5,'0');$('#cid').value=cmp(d.slice(n-4));$('#pid').value=hx(c)}
function hidShow(d){lastHid=d;$('#hid').textContent=cmp(d)||'—';$('#hin').value=cmp(d)}
$('#lrd').onclick=e=>op(e.currentTarget,async()=>{log('Читаю 125 кГц…');const d=await rdLf();if(!d||!d.length)return log('125 кГц: метка не найдена.'),toast('Метка 125 кГц не найдена.');lfShow(d);log('LF: '+cmp(d))});
$('#lwr').onclick=()=>{if(!hexOk($('#cid').value,8))return bad($('#cid'),'Card ID — ровно 4 байта (8 hex-символов).');if(!hexOk($('#pid').value,2))return bad($('#pid'),'Plant ID — 1 байт hex, например 00.');
 confirmBox('Записать ID на метку?','Метка T5577/EM4305 будет перепрограммирована.',()=>op($('#lwr'),async()=>{const f=$('#fq').selectedIndex,id=unhex($('#cid').value),pl=parseInt($('#pid').value,16);log(`Пишу LF: частота #${f}, ID ${cmp(id)}, plant ${hx(pl)}`);
  const ok=await pr('Запись метки 125 кГц',async p=>{p(.3);const r=await exec(A(0x2D,f,...id,pl),10000);p(1);log(`LF write: ack=${r.ack?1:0} ms=${r.ms} raw=${r.d?hex(r.d.slice(0,r.n)):'нет ответа'}`);return r.ack});log(ok?'LF-запись подтверждена устройством.':'LF-запись: нет подтверждения.');if(!ok)toast('Запись не подтверждена.')}))};
$('#hrd').onclick=e=>op(e.currentTarget,async()=>{log('Читаю HID-прокси…');const d=await rdHid();if(!d||!d.length)return log('HID: метка не найдена.'),toast('HID-метка не найдена.');hidShow(d);log('HID: '+cmp(d))});
$('#hwr').onclick=()=>{if(!hexOk($('#hin').value,24))return bad($('#hin'),'HID ID — ровно 12 байт (24 hex-символа).');
 confirmBox('Записать HID?','12-байтный ID будет записан на метку.',()=>op($('#hwr'),async()=>{const id=unhex($('#hin').value);const ok=await pr('Запись HID-метки',async p=>{p(.3);const r=await exec(A(0x2E,...id),10000);p(1);log(`HID write: ack=${r.ack?1:0} ms=${r.ms} raw=${r.d?hex(r.d.slice(0,r.n)):'нет ответа'}`);return r.ack});log(ok?'HID-запись подтверждена.':'HID-запись: нет подтверждения.');if(!ok)toast('Запись не подтверждена.')}))};

$('#lsv').onclick=()=>{if(!lastLf||!lastLf.length)return toast('Нет данных: сначала прочитайте метку 125 кГц.');const n=`lf_${cmp(lastLf)}.lfd`;saveFile(n,lastLf);log('Дамп 125 кГц сохранён: '+n)};
$('#lld').onclick=async()=>{const f=await pickFile();if(!f)return;if(f.d.length<4||f.d.length>12)return toast('Файл не похож на дамп 125 кГц (4–12 байт).');lfShow(f.d);log(`Дамп 125 кГц загружен: ${f.n}`)};
$('#hsv').onclick=()=>{if(!lastHid||!lastHid.length)return toast('Нет данных: сначала прочитайте HID-метку.');const n=`hid_${cmp(lastHid)}.hid`;saveFile(n,lastHid);log('Дамп HID сохранён: '+n)};
$('#hld').onclick=async()=>{const f=await pickFile();if(!f)return;if(f.d.length!=12)return toast('Файл не похож на дамп HID (ровно 12 байт).');hidShow(f.d);log(`Дамп HID загружен: ${f.n}`)};
