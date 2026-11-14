/* ===== сканер ===== */
$('#sgo').onclick=e=>op(e.currentTarget,async()=>{const R=$('#srings'),T=$('#sres');R.classList.add('go');T.className='big';T.textContent='Сканирование…';log('Ищу метку (13.56 → 125 кГц → HID)…');let k=null,o;
 try{const c=await cardInfo();if(c)k=['карта 13.56 МГц',`UID ${hex(c.uid).replace(/ /g,'')}   ATQA ${$('#ma').textContent}   SAK ${$('#ms').textContent}   ${$('#mt').textContent}`,'mf'];
  else{const l=await rdLf();if(l&&l.length){lfShow(l);k=['метка 125 кГц','ID '+cmp(l),'lf']}else{const h=await rdHid();if(h&&h.length){hidShow(h);k=['HID-метка','ID '+cmp(h),'hd']}}}}finally{R.classList.remove('go')}
 if(!k){T.textContent='Метка не найдена — положите её на считыватель.';T.className='big bad';$('#slast').textContent='—';return log('Метка не найдена — положите карту на считыватель.')}
 T.innerHTML='<span class="ok">Найдена '+k[0]+'</span>';$('#slast').textContent=k[1];log(`Найдена ${k[0]}: ${k[1]}`);await sleep(700);go(k[2])});
