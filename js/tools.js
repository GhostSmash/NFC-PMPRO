/* ===== инструменты ===== */
const DICT='FFFFFFFFFFFF 000000000000 A0A1A2A3A4A5 D3F7D3F7D3F7 AABBCCDDEEFF 1A2B3C4D5E6F 010203040506 1234567890AB A0B0C0D0E0F0 4D3A99C351DD F0E1D2C3B4A5 A1B2C3D4E5F6 C0C1C2C3C4C5 DEADBEEFF00D 123456789ABC ABCDEF123456 5A5A5A5A5A5A 000000000001 000000000002 00000000000A FFFFFFFF0000 B0B1B2B3B4B5 AABBCCDDEE11 112233445566 505152535455 B7FF6711AC6C 6F6F6F6F6F6F 2A2A2A2A2A2A A0A1A2A3A4A4 A0A1A2A3A4A6 A0A1A2A3A4A7 AAFFBBCCDDEE'.split(' ').map(unhex);
$('#tf').onclick=e=>op(e.currentTarget,async()=>{const s=$('#ts').selectedIndex,ty=$('#tty').selectedIndex+1;log(`Подбираю ключ для сектора ${s}…`);let f=null,n=0;await act();
 await pr('Подбор ключа',async p=>{for(const k of DICT){f=await tryKeys(s*4,ty,[k]);n++;p(n/DICT.length);$('#tfr').textContent=`Проверено ключей: ${n} из ${DICT.length}…`;if(f)break}});
 if(f){const h=cmp(f);$('#tfr').innerHTML=`<span class="ok">Ключ найден: ${h}</span> (проверено ${n}). Подставлен в Key ${ty==1?'A':'B'}.`;$(ty==1?'#ka':'#kb').value=h;log(`Ключ найден: ${h} (проверено ${n}).`)}
 else{$('#tfr').innerHTML=`<span class="bad">Ключ не найден</span> среди ${DICT.length} частых. Проверьте, что карта лежит на считывателе.`;log('Ключ не найден.')}});
$('#tm').onclick=e=>op(e.currentTarget,async()=>{log('Проверяю magic-карту…');const o=(m,c)=>{$('#tmr').innerHTML=`<span class="${c}">${m}</span>`;log('Magic: '+m)};
 if(!await rdHf())return o('Нет HF-карты на считывателе.','bad');await act();
 for(let i=0;i<10;i++)if((await exec(A(0x1D,0),2000)).ack)return o('gen1a — отвечает на backdoor (1D), UID перезаписываемый.','ok');
 const a=key('#ka',1)||FF;await act();const s0=await rdSec(0,1,a,null);if(!s0||s0.length<16)return o('Сектор 0 не читается — укажите Key A и повторите.','bad');
 const b=new Uint8Array(64);b.set(s0.subarray(0,64));const orig=b[8];b[8]=orig^255;b.set(a,48);await act();await wrSec(0,1,a,null,b);await act();const back=await rdSec(0,1,a,null);const ch=back&&back.length>8&&back[8]==(orig^255);
 const r=new Uint8Array(64);r.set(s0.subarray(0,64));r.set(a,48);await act();const rs=await wrSec(0,1,a,null,r);
 o(ch?'gen2/CUID — блок 0 перезаписался, UID можно менять. Исходные данные '+(rs?'восстановлены.':'НЕ удалось восстановить — проверьте блок 0!'):'Блок 0 только для чтения — обычная (не magic) карта.',ch?(rs?'ok':'bad'):'')});
const dm={};$$('button[data-d]').forEach(b=>b.onclick=async()=>{const k=b.dataset.d,f=await pickFile();if(!f)return;if(f.d.length!=1024)return toast('Нужен дамп 1024 байта.');dm[k]=f.d;$('#d'+k.toLowerCase()).textContent=`${k}: ${f.n} (1024 байта)`;log(`Дамп ${k} загружен.`)});
$('#tc').onclick=()=>{if(!dm.A||!dm.B)return toast('Загрузите оба дампа (A и B).');const o=[];for(let i=0;i<64;i++){let n=0;for(let j=0;j<16;j++)if(dm.A[i*16+j]!=dm.B[i*16+j])n++;if(n)o.push(`блок ${i} (сектор ${i>>2}): ${n} байт`)}
 $('#tcr').innerHTML=o.length?`Различающиеся блоки (${o.length}):<br><span class="mono">${o.slice(0,40).join('<br>')}</span>`+(o.length>40?'<br>…':''):'<span class="ok">Дампы идентичны.</span>';log(`Сравнение дампов: различий ${o.length}.`)};

/* ===== консоль ===== */
$('#csd').onclick=e=>op(e.currentTarget,async()=>{const v=$('#cin').value.trim().replace(/\s+/g,' ').toUpperCase();
 if(!/^([0-9A-F]{2}( |$))+$/.test(v)){$('#cout').textContent='Некорректный hex.';return}
 log('TX: '+v);const r=await exec(unhex(v),3000);if(!r.d){$('#cout').textContent=`Нет ответа (${r.ms} мс).`;return log('RX: таймаут')}
 const h=hex(r.d.slice(0,r.n));$('#cout').textContent=`RX: len=${r.n} ack=${r.ack?1:0} ms=${r.ms}\n${h}`;log('RX: '+h)});
