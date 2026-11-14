/* ===== подключение ===== */
function setConn(s){const t=['Нет подключения','Подключение…','Подключено'][s];$$('.chip').forEach(c=>{c.className='chip s'+s;c.lastChild.textContent=t});$('#ovst').textContent=s==2?'подключено':'не подключено';$('#ovst').className=s==2?'ok':'bad'}
let mode='pick';function setBegin(m){mode=m;const b=$('#begin');b.textContent=m=='go'?'Начать работу':'Выбрать устройство';b.disabled=false}
function failStart(a,b){setConn(0);$('#rg').classList.remove('go');$('#rgi').innerHTML=ic('scan');$('#st1').textContent=a;$('#st2').textContent=b;setBegin('pick')}
async function attach(d){setConn(1);$('#rg').classList.add('go');$('#st1').textContent='Подключение…';$('#begin').disabled=true;log('Открываю устройство VID_1629 PID_1831…');
 try{if(!d.opened)await d.open();dev=d;d.oninputreport=onrx;
  if(!(await handshake())){try{await d.close()}catch(e){}dev=null;log('Хендшейк не прошёл.');return failStart('Устройство не отвечает','Закройте NFC_Pro.exe и другие программы, занимающие USB, затем повторите.')}}
 catch(e){dev=null;log('Не удалось открыть: '+e.message);return failStart('Не удалось открыть устройство',e.message+' — закройте NFC_Pro.exe.')}
 const u=(d.collections&&d.collections[0]&&d.collections[0].usagePage)||0xFF00;
 $('#ovsn').textContent=INFO.sn||'—';$('#ovty').textContent=INFO.type!=null?'0x'+INFO.type.toString(16).toUpperCase().padStart(4,'0'):'—';$('#ovhs').textContent=INFO.ms+' мс';$('#ovrp').textContent='64 / 64 байта';$('#ovup').textContent='0x'+u.toString(16).toUpperCase();$('#ov06').textContent=INFO.raw;
 setConn(2);$('#rg').classList.remove('go');$('#rgi').innerHTML=ic('ok');$('#st1').innerHTML='<span class="ok">Устройство подключено</span>';$('#st2').textContent='Зав. номер: '+(INFO.sn||'—');setBegin('go');log('Подключено, хендшейк пройден (06 → 01 → 01 → 06).')}
async function boot(){$('#start').classList.remove('off');dev=null;setConn(0);$('#rg').classList.remove('go');$('#rgi').innerHTML=ic('scan');$('#st1').textContent='Ожидание устройства…';
 if(!navigator.hid){$('#st1').textContent='Браузер не поддерживается';$('#st2').textContent='Нужен Chrome или Edge (WebHID). Откройте страницу в одном из них.';$('#begin').disabled=true;return}
 $('#st2').textContent='Подключите кабель USB и нажмите «Выбрать устройство».';setBegin('pick');
 const l=(await navigator.hid.getDevices()).filter(x=>x.vendorId==VID&&x.productId==PID);if(l[0])attach(l[0])}
$('#begin').onclick=async()=>{if(mode=='go')return $('#start').classList.add('off');try{const[d]=await navigator.hid.requestDevice({filters:[{vendorId:VID,productId:PID}]});if(d)attach(d)}catch(e){log('Выбор устройства: '+e.message)}};
if(navigator.hid){navigator.hid.addEventListener('disconnect',e=>{if(e.device===dev){dev=null;log('Устройство отключено от USB.');toast('Устройство отключено.');boot()}});
 navigator.hid.addEventListener('connect',e=>{if(!dev&&e.device.vendorId==VID&&e.device.productId==PID&&$('#start').classList.contains('off')==false)attach(e.device)})}
$('#sgear').onclick=()=>$('#dset').showModal();
$('#disc').onclick=async()=>{const d=dev;dev=null;if(d){try{await d.close()}catch(e){}try{d.forget&&await d.forget()}catch(e){}}log('Устройство отключено.');boot()};
$('#beep').onclick=e=>op(e.currentTarget,async()=>{const r=await exec(A(9,1,2),1500);log('Писк: '+(r.ack?'ок':'нет ответа'))});
