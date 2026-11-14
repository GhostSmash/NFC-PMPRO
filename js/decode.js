/* ===== расшифровка ключей (Decode block): сетка секторов, словарь и брутфорс по маскам ===== */
const DB={n:16,keys:{},stop:false,running:false};
const khex=k=>[...k].map(hx).join('');
const dbCell=i=>$('#dbgrid').children[i];

function dbBuild(n){
  DB.n=n;DB.keys={};
  $('#dbgrid').innerHTML=[...Array(n).keys()].map(i=>`<button class="dbq" type="button" title="Сектор ${i}: не расшифрован">${i}</button>`).join('');
  $('#dbhint').textContent=`Секторов: ${n}. Нажмите «Расшифровать».`;
}
function dbSet(i,cls,title){
  const c=dbCell(i);if(!c)return;
  c.className='dbq'+(cls?' '+cls:'');
  if(title!==undefined)c.title=title;
}
/* словарь по уровню: 1 — 8 самых частых, 2 — 16, 3 — 24, 4 — весь словарь + FF/00 */
function dbDictKeys(lvl){
  const base=DICT.slice();
  const extra=[unhex('FFFFFFFFFFFF'),unhex('FFFFFFFF0000'),unhex('0000FFFFFFFF'),unhex('000000000000')];
  const uniq=[...base,...extra].filter((k,i,a)=>a.findIndex(x=>khex(x)==khex(k))===i);
  const n=lvl<=1?8:lvl==2?16:lvl==3?24:uniq.length;
  return uniq.slice(0,n);
}
/* маски (брутфорс по шаблонам): уровень 1 — 256, 2 — 512, 3 — 1280, 4 — 1792 */
function dbMaskKeys(lvl){
  const out=[],seen=new Set();
  const push=b=>{const k=Uint8Array.from(b),h=khex(k);if(!seen.has(h)){seen.add(h);out.push(k)}};
  for(let b=0;b<256;b++)push(Array(6).fill(b));                       // байт во всех позициях
  if(lvl>=2)for(let s=0;s<256;s++)push(Array.from({length:6},(_,i)=>(s+i)&255)); // последовательности
  if(lvl>=3){
    const v=[0x00,0x11,0x22,0x33,0x44,0x55,0xAA,0xFF];
    for(const a of v)for(const b of v)for(const c of v)push([a,a,b,b,c,c]); // парные маски XX XX YY YY ZZ ZZ
    for(const a of v)for(const b of v)for(const c of v)push([a,b,c,a,b,c]); // повтор тройки
  }
  if(lvl>=4){for(const k of DICT)push(k);for(const k of dbDictKeys(4))push(k);}
  return out;
}

/* запуск */
$('#dbGo').onclick=e=>op(e.currentTarget,async()=>{
  if(DB.running)return;
  const model=+$('#dbModel').value,lvl=+$('#dbLevel').value,mode=$('#dbMode').value;
  const n=model==1?16:40;
  dbBuild(n);
  const cand=(mode=='std'?dbDictKeys(lvl):dbMaskKeys(lvl)).map(k=>Uint8Array.from(k));
  log(`Расшифровка: ${mode=='std'?'словарь':'брутфорс по маскам'}, уровень ${lvl}, кандидатов ${cand.length}, секторов ${n}.`);
  DB.running=true;DB.stop=false;
  $('#dbGo').disabled=true;$('#dbStop').disabled=false;
  $('#dbhint').innerHTML='Идёт расшифровка… <span class="bad">красный</span> — перебор, <span class="ok">зелёный ✓</span> — ключ найден.';
  let found=0,failed=0;
  try{
    await act();
    await pr('Расшифровка ключей',async p=>{
      for(let s=0;s<n;s++){
        if(DB.stop)break;
        dbSet(s,'try');
        let key=null,ty=1;
        for(ty=1;ty<=2;ty++){
          key=await tryKeys(s*4,ty,cand);
          if(key||DB.stop)break;
        }
        if(DB.stop){dbSet(s,'',`Сектор ${s}: остановлено`);break}
        if(key){
          DB.keys[s]={key:khex(key),ty};
          dbSet(s,'ok',`Сектор ${s}: Key ${ty==1?'A':'B'} = ${DB.keys[s].key}`);
          found++;
          const ka=$('#ka');
          if(s===0||!ka.value.trim())ka.value=DB.keys[s].key;
          log(`Сектор ${s} расшифрован: Key ${ty==1?'A':'B'} = ${DB.keys[s].key}`);
        }else{
          dbSet(s,'fail',`Сектор ${s}: ключ не найден`);
          failed++;
        }
        p((s+1)/n);
      }
    });
  }finally{
    DB.running=false;$('#dbGo').disabled=false;$('#dbStop').disabled=true;
  }
  $('#dbhint').innerHTML=`Готово: расшифровано <b>${found}</b>, без ключа <b>${failed}</b> из ${n}.`+
    (found?' Найденные ключи подставлены в Key A.':' Попробуйте другой режим/уровень или словарь ключей.');
  log(`Расшифровка завершена: ${found} найдено, ${failed} без ключа.`);
});

$('#dbStop').onclick=()=>{DB.stop=true;log('Расшифровка остановлена.');};
$('#dbModel').onchange=e=>{dbBuild(+e.target.value==1?16:40);};
$('#dbMode').onchange=e=>{
  const brute=e.target.value=='brute';
  $('#dbLevel').title=brute?'Больше уровень — больше шаблонов ключей (дольше).':'Больше уровень — больше ключей из словаря.';
};
$('#dbSave').onclick=()=>{
  const ss=Object.keys(DB.keys).map(Number).sort((a,b)=>a-b);
  if(!ss.length)return toast('Сначала расшифруйте хотя бы один сектор.');
  const txt=ss.map(s=>`Sector ${s}: Key ${DB.keys[s].ty==1?'A':'B'} = ${DB.keys[s].key}`).join('\n');
  saveFile('mifare-keys.txt',new TextEncoder().encode(txt));
  log('Ключи сохранены в mifare-keys.txt');
};

/* начальное состояние */
dbBuild(16);
$('#dbStop').disabled=true;
