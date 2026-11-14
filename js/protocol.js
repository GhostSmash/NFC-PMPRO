/* ===== протокол FURUI / FR-RATEL (WebHID) ===== */
const KEY=[0xB6,0x69,0x8A,0x37,0x40,0xA3,0x79,0x84,0x9B,0xF5,0x6D,0x16],VID=0x1629,PID=0x1831;
const hex=d=>[...d].map(hx).join(' '),unhex=t=>new Uint8Array(t.replace(/[^0-9a-f]/gi,'').match(/../g)||[]),A=(...x)=>new Uint8Array(x),FF=new Uint8Array(6).fill(255);
function rc4(d){const s=[...Array(256).keys()];let j=0,a=0,b=0;for(let i=0;i<256;i++){j=(j+s[i]+KEY[i%12])&255;[s[i],s[j]]=[s[j],s[i]]}return d.map(v=>{a=(a+1)&255;b=(b+s[a])&255;[s[a],s[b]]=[s[b],s[a]];return v^s[(s[a]+s[b])&255]})}
function crc(d,n){let c=0;for(let i=0;i<n;i++)for(let m=128;m;m>>=1){c=c&0x8000?(c<<1)^0x1021:c<<1;if(d[i]&m)c^=0x1021;c&=0xFFFF}return c}
function pack(p){const f=p.length+4,b=new Uint8Array(Math.ceil(f/64)*64);b[0]=f&255;b[1]=f>>8;b.set(p,2);const c=crc(b,p.length+2);b[p.length+2]=c&255;b[p.length+3]=c>>8;return rc4(b)}
let dev=null,rxq=[],rxw=null,chain=Promise.resolve(),INFO={};
function onrx(e){const u=new Uint8Array(e.data.buffer.slice(e.data.byteOffset,e.data.byteOffset+e.data.byteLength));if(rxw){const w=rxw;rxw=null;w(u)}else rxq.push(u)}
const nextRx=t=>rxq.length?Promise.resolve(rxq.shift()):new Promise(r=>{const id=setTimeout(()=>{rxw=null;r(null)},t);rxw=u=>{clearTimeout(id);r(u)}});
const exec=(p,t=3000)=>chain=chain.then(()=>exec1(p,t),()=>exec1(p,t));
async function exec1(p,t){const R={ack:false,n:0,d:null,p:new Uint8Array(0),ms:0},t0=performance.now();if(!dev||!dev.opened)return R;rxq=[];
 try{const tx=pack(p);for(let o=0;o<tx.length;o+=64)await dev.sendReport(0,tx.slice(o,o+64));
  const f=await nextRx(t);if(!f){R.ms=Math.round(performance.now()-t0);return R}
  const h=rc4(f),fl=h[0]|h[1]<<8,need=fl<4||fl>5120?64:Math.ceil(fl/64)*64,got=[f];
  while(got.length*64<need){const m=await nextRx(t);if(!m)break;got.push(m)}
  const b=new Uint8Array(got.length*64);got.forEach((u,i)=>b.set(u.subarray(0,64),i*64));const d=rc4(b),n=d[0]|d[1]<<8;
  R.ms=Math.round(performance.now()-t0);if(n<3||n>b.length)return R;R.d=d;R.n=n;R.ack=d[2]==1;R.p=d.slice(2,Math.max(2,n-2))}catch(e){log('USB: '+e.message)}return R}
async function handshake(){const t0=performance.now();let r=await exec(A(6),1500);if(!r.ack)return 0;
 INFO.raw=hex(r.d.slice(0,r.n));if(r.p.length>=7){INFO.type=r.p[1]|r.p[2]<<8;INFO.sn=[...r.p.slice(3,7)].map(hx).join('')}
 r=await exec(A(1,1,0,0x14,0x0F,4,0x90,0x14,0,0),1500);if(!r.ack||r.n<16||(r.d[8]|r.d[9]<<8|r.d[10]<<16|r.d[11]<<24)!=5264)return 0;
 r=await exec(A(1,...r.d.slice(12,16)),1500);if(!r.ack)return 0;if(!(await exec(A(6),1500)).ack)return 0;INFO.ms=Math.round(performance.now()-t0);return 1}
const act=()=>exec(A(0x10),2000);
async function rdHf(){const r=await exec(A(0x21),3000),dl=r.n-5;if(!r.ack||dl<=0)return null;const raw=r.d.slice(3,3+dl),t=dl-3,ul=Math.min(10,[4,7,10].includes(t)?t:dl>=10?7:dl>=7?4:dl),tl=raw.slice(ul,ul+8);return{uid:raw.slice(0,ul),atqa:tl.length>=2?tl[0]|tl[1]<<8:0}}
const sc=(c,s,f,a,b)=>{const p=new Uint8Array(15);p[0]=c;p[1]=s;p[2]=f;p.set(a||FF,3);p.set(b||new Uint8Array(6),9);return p};
async function rdSec(s,f,a,b){const r=await exec(sc(0x17,s,f,a,b));if(!r.ack||r.n<6||r.d[3]==0)return null;const dl=Math.min(r.n-7,256);return dl>0?r.d.slice(5,5+dl):null}
async function wrSec(s,f,a,b,d){const p=new Uint8Array(79);p.set(sc(0x18,s,f,a,b));p.set(d.subarray(0,64),15);return(await exec(p)).ack}
async function fmtSec(s,f,a,b){await act();return(await exec(sc(0x16,s,f,a,b))).ack}
async function rdId(c,t){const r=await exec(c,t);if(!r.ack)return null;return r.n>5?r.d.slice(3,r.n-2):new Uint8Array(0)}
const rdLf=()=>rdId(A(0x28,1,0),5000),rdHid=()=>rdId(A(0x29),3000);
async function tryKeys(blk,ty,ks){for(let o=0;o<ks.length;o+=16){const c=ks.slice(o,o+16),p=new Uint8Array(4+c.length*6);p.set([0x13,blk,ty,c.length]);c.forEach((k,i)=>p.set(k,4+i*6));const r=await exec(p,5000);if(r.ack&&r.p.length>=6&&r.p.slice(0,6).some(x=>x))return r.p.slice(0,6)}return null}
function tname(s,a){const m={0:a==0x44?'Mifare Ultralight / NTAG':'Mifare Ultralight',8:'Mifare Classic 1K (S50)',9:'Mifare Mini',0x18:'Mifare Classic 4K (S70)',0x10:'Mifare Plus 2K (SL2)',0x11:'Mifare Plus 4K (SL2)',0x20:a==0x344?'Mifare DESFire / EV1':'Mifare Plus (SL3) / DESFire',0x28:'JCOP / SmartMX (Classic)',0x38:'SmartMX (Classic 4K)',0x88:'Infineon Mifare Classic 1K'};if(m[s])return m[s];const q={4:'Mifare Classic 1K (S50)',2:'Mifare Classic 4K (S70)',0x44:'Mifare Ultralight / NTAG',0x344:'Mifare DESFire'}[a];return q||(s<0?'неизвестно (нет доступа к SAK)':'неизвестный тип (SAK '+hx(s)+')')}
/* прогресс по реальному ходу операции */
async function pr(title,fn){const g=$('#pg');$('#pt').textContent=title;P=0;run=1;g.classList.add('on');requestAnimationFrame(function l(t){if(run){wave(t);requestAnimationFrame(l)}});
 try{return await fn(p=>{P=p;$('#pp').textContent=Math.round(p*100)+'%'})}finally{P=1;$('#pp').textContent='100%';await sleep(450);g.classList.remove('on');run=0}}
const ensure=()=>dev&&dev.opened?1:(toast('Устройство не подключено.'),0);
const op=(b,fn)=>busy(b,async()=>{if(!ensure())return;try{await fn()}catch(e){log('Ошибка: '+e.message);toast(e.message)}});
function saveFile(n,u){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u]));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const pickFile=()=>new Promise(r=>{const i=document.createElement('input');i.type='file';i.accept='.mfd,.lfd,.hid,.bin,.dump';i.onchange=async()=>r(i.files[0]?{n:i.files[0].name,d:new Uint8Array(await i.files[0].arrayBuffer())}:null);i.oncancel=()=>r(null);i.click()});
