/* nav */
const NAV=[['ov','info','Обзор'],['sc','scan','Сканер'],['mf','card','MIFARE · 13.56'],['lf','wave','125 кГц'],['hd','hid','HID Prox'],['tl','key','Инструменты'],['cn','term','Консоль']];
const nav=$('#nav');nav.insertAdjacentHTML('afterbegin',`<button class="fab" data-fab>${ic('scan')}Сканировать</button>`);
nav.insertAdjacentHTML('beforeend',NAV.map(n=>`<button data-p="${n[0]}">${ic(n[1])}${n[2]}</button>`).join('')+`<span class="gap"></span><button data-set>${ic('gear')}Настройки</button><button data-help>${ic('help')}Инструкция</button>`);
function go(id){$$('section').forEach(s=>s.classList.toggle('on',s.id==id));$$('nav button[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p==id));
 const b=$(`nav button[data-p=${id}]`);$('.ind',nav).style.cssText=`transform:translate(${b.offsetLeft}px,${b.offsetTop}px);width:${b.offsetWidth}px;height:${b.offsetHeight}px`;$('#main').scrollTop=0}
nav.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.help!==undefined)$('#dhelp').showModal();else if(b.dataset.set!==undefined)$('#dset').showModal();else if(b.dataset.fab!==undefined){go('sc');$('#sgo').click()}else go(b.dataset.p)};
addEventListener('resize',()=>go($('section.on').id));
