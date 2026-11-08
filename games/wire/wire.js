/* THE MEASURE / THE WIRE — production modal adapter (MEASURE-WIRE-001/002).
 * Native dialog + scoped ShadowRoot. Ranked authority belongs exclusively to Worker.
 */
(() => {
  'use strict';
  const BASE='games/wire/';
  const ROLES=['entity','authority','action','consequence','beneficiary'];
  const SAMPLE={id:'wire-practice',date:'',title:'Who profits from displacement?',brief:'A fictional structural exercise.',classification:'fictional',article_id:''};
  const SAMPLE_ANSWERS={entity:'Acme Holdings',authority:'Zoning exemption',action:'Housing conversion',consequence:'Tenant displacement',beneficiary:'Property owners'};
  const DEFAULT_CONNECTORS={authority:'by way of',action:'enacted',consequence:'resulting in',beneficiary:'benefiting'};
  const dialog=document.getElementById('measureWireDialog');
  if(!dialog)return;
  const host=document.getElementById('measureWireHost');
  const root=host.attachShadow({mode:'open'});
  const $=id=>root.getElementById(id);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let ready=null,api='',mode='practice',puzzle={...SAMPLE},token='',state=null,waiting=false,muted=true;
  let previousFocus=null,previousBodyOverflow='',previousDocOverflow='',clockJob=0,bursts=0,settleTimer=0,drag=null,helpReturn=null;
  let observer=null,fx=null,pendingDrag=null,strings={game:{}};
  const out=(message,error=false)=>{const el=$('boardTip');if(el){el.textContent=String(message);el.classList.toggle('wire-error',error);}};
  const getStr=(key,vars={})=>{
    let value=strings;for(const part of key.split('.'))value=value?.[part];
    if(typeof value!=='string'){console.warn('WIRE missing string resource:',key);return key;}
    return value.replace(/\{([a-z_]+)\}/g,(_,k)=>String(vars[k]??''));
  };
  function shuffled(xs){const a=[...xs];for(let i=a.length-1;i>0;i--){const p=new Uint32Array(1);crypto.getRandomValues(p);const j=Math.floor(p[0]/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.every((x,i)=>x===xs[i]))[a[0],a[2]]=[a[2],a[0]];return a;}
  function localPractice(){
    const left=shuffled(ROLES).map((role,position)=>({id:crypto.randomUUID(),side:'L',label:role.toUpperCase(),position,role}));
    const right=shuffled(ROLES).map((role,position)=>({id:crypto.randomUUID(),side:'R',label:SAMPLE_ANSWERS[role],position,role}));
    const expected=ROLES.flatMap(role=>[left.find(n=>n.role===role).id,right.find(n=>n.role===role).id]);
    return {nodes:[...left,...right].map(({role,...n})=>n),expected,accepted:[],progress:0,outrage:0,started_at_ms:0,finished_at_ms:null,status:'intro',ranked:false,lastStageMs:0,completedStageMs:[]};
  }
  async function json(path,options={}){
    const r=await fetch(api+path,{cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    const body=await r.json().catch(()=>({error:'Invalid response from THE WIRE service.'}));
    if(!r.ok)throw new Error(body.error||`WIRE service HTTP ${r.status}`);return body;
  }
  function pacificToday(){const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const part=k=>parts.find(p=>p.type===k)?.value||"";return `${part("year")}-${part("month")}-${part("day")}`;}
  function savedToken(){try{return sessionStorage.getItem('measure-wire-ranked-session-v1')||'';}catch{return '';}}
  function storeToken(value){try{if(value)sessionStorage.setItem('measure-wire-ranked-session-v1',value);else sessionStorage.removeItem('measure-wire-ranked-session-v1');}catch{}}
  function visitor(){try{
    let id=localStorage.getItem('measure-wire-anonymous-id-v1');
    if(!id||!/^[a-zA-Z0-9-]{20,120}$/.test(id)){id=crypto.randomUUID();localStorage.setItem('measure-wire-anonymous-id-v1',id);}return id;
  }catch{return crypto.randomUUID();}}
  // THE WIRE / investigator aliases. Keep these two arrays synchronized with the Worker.
  const HANDLE_STORAGE_KEY='measure-wire-investigator-handle-v1';
  const HANDLE_PREFIXES=['Suspicious','Bureaucratic','Unlicensed','Rogue','Tax-Exempt','Institutional','Unauthorized','Procedural','Executive','Accidental','Subversive','Disgruntled','Regulatory','Structural','Ferocious','Contrarian','Clandestine','Unscheduled','Rebellious','Noncompliant','Anonymous','Unreasonable','Perpetual','Uninvited','Corporate','Forbidden'];
  const HANDLE_NOUNS=['Turnip','Menace','Philosopher','Accountant','Goblin','Nightmare','Auditor','Intern','Potato','Detective','Footnote','Committee','Algorithm','Rebel','Taxpayer','Researcher','Gremlin','Overlord','Observer','Specter','Mechanism','Paradox','Insurgent','Economist','Archivist','Raccoon'];
  const HANDLE_POOL=HANDLE_PREFIXES.flatMap(prefix=>HANDLE_NOUNS.map(noun=>prefix+' '+noun).filter(name=>name.length<=22));
  let investigatorHandle='';
  const validHandle=name=>typeof name==='string'&&HANDLE_POOL.includes(name);
  function randomHandle(previous=''){
    const candidates=HANDLE_POOL.filter(name=>name!==previous);
    const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
    return candidates[bytes[0]%candidates.length];
  }
  function savedHandle(){
    if(validHandle(investigatorHandle))return investigatorHandle;
    let stored='';try{stored=localStorage.getItem(HANDLE_STORAGE_KEY)||'';}catch{}
    investigatorHandle=validHandle(stored)?stored:randomHandle();
    try{localStorage.setItem(HANDLE_STORAGE_KEY,investigatorHandle);}catch{}
    return investigatorHandle;
  }
  function rerollHandle(){
    investigatorHandle=randomHandle(savedHandle());
    try{localStorage.setItem(HANDLE_STORAGE_KEY,investigatorHandle);}catch{}
    controlValue($('wireHandleValue'),investigatorHandle);
  }
  function auth(){return {'Authorization':'Bearer '+token};}
  const msfmt=(ms,detail=false)=>{const seconds=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}${detail?'.'+String(Math.max(0,ms)%1000).padStart(3,'0'):''}`;};
  const inRun=()=>state&&state.status==='active'&&!waiting;
  function controlValue(el,value){if(el)el.textContent=value;}
  function updatePhase(){
    const n=state?.progress||0;
    const stage=state?.status==='complete'?3:n>=4?2:n>=2?1:0;
    host.dataset.stage=String(stage);
    controlValue($('phaseName'),state?.status==='active'||state?.status==='complete'?getStr('game.phase_'+stage):'AWAITING INPUT');
    $('thermoFill')?.style.setProperty('--outrage-fraction',String((state?.outrage||0)/100));
    controlValue($('outrageNumber'),String(state?.outrage||0).padStart(2,'0'));
    const m=state?.outrage||0,threshold=m>=100?100:m>=80?80:m>=60?60:m>=40?40:m>=20?20:0;
    controlValue($('outrageLabel'),getStr('game.outrage_'+threshold));
    $('topProgress').innerHTML=`${String(n).padStart(2,'0')} <small>/ 05</small>`;
    [...$('stageDots').children].forEach((dot,i)=>dot.classList.toggle('on',i<n));
  }
  function updateInstructions(){
    const count=state?.accepted?.length||0;
    if(state?.status==='complete')controlValue($('instruction'),getStr('game.instructions_finished'));
    else if(state?.status!=='active')controlValue($('instruction'),'PRESS BEGIN TO INVESTIGATE');
    else if(!count)controlValue($('instruction'),getStr('game.instructions_entity'));
    else controlValue($('instruction'),count%2===1?getStr('game.instructions_answer',{role:ROLES[Math.floor(count/2)].toUpperCase()}):getStr('game.instructions_next',{role:ROLES[Math.floor(count/2)].toUpperCase()}));
    updatePhase();
  }
  function boardNodes(){return [...root.querySelectorAll('.node')];}
  function nodeFor(id){return boardNodes().find(n=>n.dataset.token===id);}
  function renderBoard(){
    const nodes=state?.nodes||[];
    for(const side of ['L','R']){
      const column=$(side==='L'?'leftNodes':'rightNodes');column.replaceChildren();
      nodes.filter(n=>n.side===side).sort((a,b)=>a.position-b.position).forEach((n,i)=>{
        const button=document.createElement('button');button.type='button';button.className='node';button.dataset.token=n.id;
        button.setAttribute('aria-label',(side==='L'?'Structural role':'Concrete answer')+': '+n.label);
        const numeral=document.createElement('span');numeral.className='node-index';numeral.textContent=side+'–0'+(i+1);
        const label=document.createElement('span');label.className='node-label';label.textContent=n.label;
        const socket=document.createElement('span');socket.className='node-socket';socket.setAttribute('aria-hidden','true');button.append(numeral,label,socket);
        button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();drag={id:n.id,pointer:e.pointerId};void choose(n.id);});
        button.addEventListener('click',e=>{if(e.detail===0)void choose(n.id);});
        column.append(button);
      });
    }
    refreshNodes();requestAnimationFrame(drawWire);
  }
  function refreshNodes(){
    const accepted=state?.accepted||[];
    for(const button of boardNodes()){
      const linked=accepted.includes(button.dataset.token),current=accepted.at(-1)===button.dataset.token;
      button.classList.toggle('is-linked',linked);button.classList.toggle('is-current',current&&inRun());
      button.setAttribute('aria-disabled',String(state?.status!=='active'||waiting));
    }
  }
  function coordsFor(id){
    const node=nodeFor(id),socket=node?.querySelector('.node-socket');if(!socket)return null;
    const r=socket.getBoundingClientRect(),b=$('boardInner').getBoundingClientRect();
    return {x:r.left+r.width*.5-b.left,y:r.top+r.height*.5-b.top};
  }
  function drawWire(pointer=null){
    if(!state)return;
    const board=$('boardInner').getBoundingClientRect();$('wireSvg').setAttribute('viewBox',`0 0 ${Math.max(1,board.width)} ${Math.max(1,board.height)}`);
    const points=state.accepted.map(coordsFor).filter(Boolean);
    const d=points.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    for(const id of ['wirePath','wireHalo','wireHighlight'])$(id).setAttribute('d',d);
    const last=points.at(-1);$('wirePreview').setAttribute('d',last&&pointer?`M ${last.x} ${last.y} L ${pointer.x} ${pointer.y}`:'');
  }
  function shout(message,wrong=false){
    const burst=$('burstLabel');clearTimeout(bursts);burst.textContent=message;
    burst.classList.remove('active','wrong');void burst.offsetWidth;
    burst.classList.toggle('wrong',wrong);burst.classList.add('active');
    bursts=setTimeout(()=>burst.classList.remove('active'),1050);
  }
  function feedbackWrong(id){
    const node=nodeFor(id);if(node){node.classList.add('is-wrong');setTimeout(()=>node.classList.remove('is-wrong'),420);}
    shout(getStr('game.feedback_wrong'),true);fx?.wrong();
  }
  function music(notes){
    if(muted||reduced.matches)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      music.context||=new AC();const ctx=music.context;void ctx.resume();let when=ctx.currentTime+.012;
      for(const [hz,duration] of notes){const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=hz;
        g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(.03,when+.02);g.gain.exponentialRampToValueAtTime(.0001,when+duration);
        o.connect(g);g.connect(ctx.destination);o.start(when);o.stop(when+duration+.02);when+=duration*.75;}
    }catch{}}
  function success(id){
    const matched=state.progress;
    shout(getStr('game.feedback_correct_'+matched));
    fx?.match(nodeFor(id),matched);
    music([[330+matched*60,.11],[510+matched*50,.14],[660+matched*60,.19]]);
  }
  function makeReveal(reveal){
    const target=$('revealText');target.replaceChildren();if(!reveal)return;
    if(reveal.full_sentence){target.textContent=reveal.full_sentence;}else{
    const answers=reveal.answers||{},c=reveal.connectors||{};
    ROLES.forEach((role,i)=>{
      const mark=document.createElement('mark');mark.textContent=answers[role]||'';
      if(i===0)target.append(mark);else target.append(document.createTextNode(' '+(c['connector_'+role]||DEFAULT_CONNECTORS[role])+' '),mark);
    });target.append(document.createTextNode('.'));}
    const references=Array.isArray(reveal.sources)?reveal.sources:[];
    const box=$('wirePublication');
    for(const old of [...box.querySelectorAll('[data-wire-source]')])old.remove();
    if(references.length){const title=document.createElement('small');title.dataset.wireSource='1';title.textContent='EVIDENCE / SOURCES';box.append(title);
      references.forEach(src=>{if(typeof src.url!=='string'||!src.url.startsWith('https://'))return;
        const link=document.createElement('a');link.dataset.wireSource='1';link.href=src.url;link.textContent=src.label||'Source';link.target='_blank';link.rel='noopener noreferrer';box.append(link);});}
  }
  async function rankings(serverBoard=null){
    const box=$('wireRanking');if(!box||state?.status!=='complete')return;
    box.replaceChildren();box.hidden=false;
    const title=document.createElement('h3');title.textContent=getStr('game.leaderboard_title');box.append(title);
    if(mode!=='ranked'){
      const text=document.createElement('p');text.textContent='Local practice run — no public score.';box.append(text);return;
    }
    const status=document.createElement('div');status.textContent=state.ranked?'LOADING YOUR RANK…':'YOUR TIME WAS NOT SUBMITTED';box.append(status);
    let board=serverBoard;
    if(!board){try{board=await json('/wire/leaderboard?date='+encodeURIComponent(puzzle.date));}catch(e){const p=document.createElement('p');p.textContent='Leaderboard unavailable: '+e.message;box.append(p);return;}}
    status.textContent=state.ranked?(board.my_rank?'YOUR RANK: #'+board.my_rank:'YOUR RANK IS UPDATING'):getStr('game.leaderboard_unlisted');
    const table=document.createElement('table');table.setAttribute('aria-label','Daily times sorted fastest first');
    const header=document.createElement('tr');for(const t of ['RANK','INVESTIGATOR','TIME','OUTRAGE']){const th=document.createElement('th');th.textContent=t;th.scope='col';header.append(th);}table.append(header);
    for(const row of (board.rows||[])){
      const tr=document.createElement('tr');if(row.me)tr.className='self';
      [row.rank,row.handle,msfmt(row.time_ms,true),row.outrage].forEach(v=>{const td=document.createElement('td');td.textContent=String(v);tr.append(td);});table.append(tr);
    }
    if(!(board.rows||[]).length){const empty=document.createElement('p');empty.textContent=getStr('game.leaderboard_no_scores');box.append(empty);}
    else box.append(table);
  }
  function linkArticle(){
    const box=$('wirePublication');if(!box)return;
    box.replaceChildren();box.hidden=false;
    if(puzzle.article_id && typeof window.measureWireArticleAvailable === "function" && window.measureWireArticleAvailable(puzzle.article_id)){
      const link=document.createElement('a');link.href='#/article/'+encodeURIComponent(puzzle.article_id);link.textContent='READ THE INVESTIGATION';
      link.addEventListener('click',e=>{e.preventDefault();close();window.location.hash=link.getAttribute('href');});box.append(link);
    }
  }
  async function finish(result,reveal,board,animate){
    state.status='complete';state.finished_at_ms=state.finished_at_ms||Date.now();
    $('caseOpen').hidden=true;$('caseComplete').hidden=false;$('welcomeLayer').hidden=true;
    $('boardPanel').classList.add('is-finished');
    const elapsed=result?.elapsed_ms??Math.max(0,state.finished_at_ms-state.started_at_ms);
    controlValue($('topClock'),msfmt(elapsed,false));controlValue($('finalTime'),msfmt(elapsed,true));
    controlValue($('finalOutrage'),state.outrage+'/100');
    const status=mode==='ranked'?(state.ranked?'WORKER VERIFIED · LEADERBOARD ENTRY':'WORKER VERIFIED · TIME NOT SUBMITTED'):'LOCAL PRACTICE · NOT RANKED';
    controlValue($('resultStatus'),status);
    controlValue($('outrageFinal'),state.outrage>=100?getStr('game.outrage_threat'):'INSTITUTIONAL RESPONSE PENDING');
    linkArticle();makeReveal(reveal);
    updateInstructions();refreshNodes();drawWire();
    out(`${state.progress} / 5 VERIFIED CONNECTIONS`);
    await rankings(board);
    if(animate){
      $('accountability').classList.remove('active','settled');void $('accountability').offsetWidth;
      $('accountability').classList.add('active');$('accountability').setAttribute('aria-hidden','false');
      clearTimeout(settleTimer);settleTimer=setTimeout(()=>$('accountability').classList.add('settled'),2900);
      fx?.victory();music([[392,.18],[494,.18],[587,.2],[784,.35],[988,.4]]);
    }else{$('accountability').classList.remove('active');$('accountability').classList.add('settled');}
  }
  async function choose(id){
    if(!inRun())return;
    waiting=true;refreshNodes();
    const oldCount=state.accepted.length;
    try{
      if(mode==='ranked'){
        const result=await json('/wire/step',{method:'POST',headers:auth(),body:JSON.stringify({from:state.accepted.at(-1)||null,to:id})});
        if(!result.accepted){feedbackWrong(id);return;}
        state={...state,...result.session};
        if(result.puzzle)puzzle=result.puzzle;
        if(state.progress>Math.floor(oldCount/2))success(id);
        else fx?.spark(nodeFor(id));
        if(state.status==='complete'){await finish(result.result,result.reveal,result.leaderboard,true);return;}
      }else{
        if(id!==state.expected[oldCount]){feedbackWrong(id);return;}
        state.accepted.push(id);
        if(state.accepted.length%2===0){
          const now=Date.now(),delta=now-state.lastStageMs;
          state.outrage+=10+Math.round(10*Math.max(0,1-delta/15000));state.lastStageMs=now;state.progress++;success(id);
        }else fx?.spark(nodeFor(id));
        if(state.accepted.length===10){
          state.finished_at_ms=Date.now();
          await finish({elapsed_ms:Date.now()-state.started_at_ms},{answers:SAMPLE_ANSWERS,connectors:DEFAULT_CONNECTORS,sources:[]},null,true);return;
        }
      }
    }catch(err){out(err.message,true);shout('NETWORK DELAY!',true);return;}
    finally{waiting=false;refreshNodes();if(pendingDrag){const next=pendingDrag;pendingDrag=null;queueMicrotask(()=>void choose(next));}}
    updateInstructions();drawWire();
    out(`${state.progress} / 5 VERIFIED CONNECTIONS`);
  }
  function setPuzzle(p){puzzle=p||SAMPLE;
    const flag=root.querySelector('.fiction-flag');if(flag)flag.textContent=puzzle.classification==='documented'?'DOCUMENTED CASE':'FICTIONAL CASE';
    const title=$('caseOpen')?.querySelector('h2');if(title)title.textContent=puzzle.title;
    const brief=$('caseOpen')?.querySelector('.case-open > p');if(brief)brief.textContent=puzzle.brief||'Trace five connected structural roles.';
    const label=root.querySelector('.case-topline');if(label)label.textContent=puzzle.classification==='documented'?'SOURCE-BACKED INVESTIGATION':'FICTIONAL CASE STUDY';
  }
  function presentIntro(){
    controlValue($('wireServiceStatus'),mode==='ranked'?'/ CLOUDFLARE VERIFIED':'/ PRACTICE MODE');
    $('welcomeLayer').hidden=false;$('caseOpen').hidden=false;$('caseComplete').hidden=true;
    $('accountability').setAttribute('aria-hidden','true');$('accountability').classList.remove('active','settled');
    $('boardPanel').classList.remove('is-finished');$('wireRanking').hidden=true;
    $('topClock').textContent='00:00';state=localPractice();if(mode==='ranked')state.nodes=[];
    $('beginButton').disabled=false;
    $('wireOptInPanel').hidden=mode!=='ranked';
    $('wireOptIn').checked=false;$('wireHandleWrap').hidden=true;
    controlValue($('wireHandleValue'),savedHandle());
    $('wireOptStatus').hidden=true;$('wireOptStatus').textContent='';
    if($('practiceButton'))$('practiceButton').hidden=true;
    renderBoard();updateInstructions();
    $('beginButton').focus({preventScroll:true});
  }
  async function start(){
    if(waiting)return;
    const optIn=mode==='ranked'&&$('wireOptIn').checked;
    const name=optIn?savedHandle():'';
    const error=$('wireOptStatus');error.hidden=true;error.textContent='';
    if(optIn&&!validHandle(name)){
      error.textContent=getStr('game.leaderboard_handle_error');error.hidden=false;
      $('wireHandleReroll').focus();return;
    }
    waiting=true;$('beginButton').disabled=true;
    out(mode==='ranked'?'REQUESTING VERIFIED SESSION…':'LOCAL PRACTICE MODE');
    try{
      if(mode==='ranked'){
        const data=await json('/wire/start',{method:'POST',headers:{'X-Wire-Visitor':visitor()},body:JSON.stringify({ranked:optIn,handle:name})});
        token=data.token;storeToken(token);puzzle=data.puzzle;state=data.session;
      }else{state=localPractice();state.status='active';state.started_at_ms=Date.now();state.lastStageMs=state.started_at_ms;}
      setPuzzle(puzzle);$('welcomeLayer').hidden=true;renderBoard();updateInstructions();startClock();
      boardNodes().find(n=>n.textContent.includes('ENTITY'))?.focus({preventScroll:true});
    }catch(err){out(err.message,true);error.textContent=err.message;error.hidden=false;$('beginButton').disabled=false;}
    finally{waiting=false;refreshNodes();if(pendingDrag){const next=pendingDrag;pendingDrag=null;queueMicrotask(()=>void choose(next));}}
  }
  function startClock(){clearInterval(clockJob);clockJob=setInterval(()=>{
    if(!dialog.open||document.hidden||state?.status!=='active')return;
    const s=Math.max(0,Date.now()-state.started_at_ms);controlValue($('topClock'),msfmt(s,false));
  },400);}
  async function resume(){
    const saved=savedToken();if(!saved||!api)return false;
    token=saved;
    try{
      const response=await json('/wire/session',{headers:auth()});
      if(response.puzzle?.date!==pacificToday() && (response.session?.status==='complete'||response.session?.status==='expired')){storeToken('');token='';return false;}
      if(!response.session?.nodes?.length){storeToken('');return false;}
      mode='ranked';state=response.session;puzzle=response.puzzle||puzzle;setPuzzle(puzzle);
      $('welcomeLayer').hidden=state.status!=='expired';
      renderBoard();updateInstructions();
      if(state.status==='complete')await finish(response.result,response.reveal,response.leaderboard,false);
      else if(state.status==='expired'){out('SESSION EXPIRED — START A NEW UNLISTED RUN OR PRACTICE',true);$('beginButton').disabled=true;$('practiceButton').hidden=false;}
      else{startClock();out(state.ranked?'LEADERBOARD SESSION RESTORED':'UNLISTED SESSION RESTORED');}
      return true;
    }catch(err){console.warn('WIRE resume failed:',err);out('Unable to recover session. Original token retained.',true);return 'unavailable';}
  }
  async function configure(){
    mode='practice';puzzle={...SAMPLE};
    try{const config=await fetch(BASE+'config.json',{cache:'no-store'}).then(r=>r.ok?r.json():{});
      api=typeof config.workerUrl==='string'&&/^https:\/\//.test(config.workerUrl)?config.workerUrl.replace(/\/$/,''):'';
      if(api){const response=await json('/wire/today');puzzle=response.puzzle;mode='ranked';}
    }catch(err){console.warn('THE WIRE: verified service unavailable; using unranked local practice.',err);}
    setPuzzle(puzzle);
    const tag=root.querySelector('.welcome-foot span:last-child');if(tag)tag.textContent=mode==='ranked'?'PUBLIC LEADERBOARD OPTIONAL · VERIFIED TIMER':'PRACTICE / UNRANKED';
    const ribbon=root.querySelector('.welcome-kicker');if(ribbon)ribbon.textContent=mode==='ranked'?'THE MEASURE / DAILY VERIFIED INVESTIGATION':'THE MEASURE / UNRANKED PRACTICE';
    $('wireOptInPanel').hidden=mode!=='ranked';
    controlValue($('wireServiceStatus'),mode==='ranked'?'/ CLOUDFLARE VERIFIED':'/ PRACTICE MODE');
  }
  let archiveReturnFocus=null;
  function openArchive(){
    archiveReturnFocus=root.activeElement;
    const today=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles'}));
    today.setDate(today.getDate()-1);
    $('wireArchiveDate').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    $('wireArchiveLayer').hidden=false;
    $('wireArchiveContent').textContent='Select a closed date and load its result.';
    $('wireArchiveDate').focus();
  }
  function closeArchive(){
    if($('wireArchiveLayer').hidden)return;
    $('wireArchiveLayer').hidden=true;
    archiveReturnFocus?.focus({preventScroll:true});
  }
  async function loadArchive(){
    const box=$('wireArchiveContent'),date=$('wireArchiveDate').value;box.replaceChildren();
    if(!api){box.textContent='The public archive requires the Cloudflare service. This is a local practice build.';return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){box.textContent='Choose a valid archive date.';return;}
    box.textContent='LOADING ARCHIVE…';
    try{
      const data=await json('/wire/archive?date='+encodeURIComponent(date));
      box.replaceChildren();const title=document.createElement('h3');title.textContent=data.puzzle?.title||date;box.append(title);
      const classification=document.createElement('div');classification.textContent=(data.puzzle?.classification||'').toUpperCase()+' / '+date;box.append(classification);
      const reveal=data.reveal||{},line=document.createElement('p');
      if(reveal.full_sentence)line.textContent=reveal.full_sentence;
      else{const words=ROLES.map((role,i)=>i===0?reveal.answers?.[role]||'':
        ((reveal.connectors?.['connector_'+role]||DEFAULT_CONNECTORS[role])+' '+(reveal.answers?.[role]||'')));
        line.textContent=words.join(' ').trim()+'.';}
      box.append(line);
      if(data.puzzle?.article_id&&window.measureWireArticleAvailable?.(data.puzzle.article_id)){
        const link=document.createElement('a');link.textContent='READ THE INVESTIGATION';link.href='#/article/'+encodeURIComponent(data.puzzle.article_id);
        link.addEventListener('click',e=>{e.preventDefault();close();window.location.hash=link.getAttribute('href');});box.append(link);
      }
      for(const src of (reveal.sources||[])){
        if(typeof src.url!=='string'||!src.url.startsWith('https://'))continue;
        const link=document.createElement('a');link.href=src.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=src.label||'SOURCE';box.append(link);
      }
      const ranking=document.createElement('h3');ranking.textContent='FASTEST / DAILY RESULTS';box.append(ranking);
      const table=document.createElement('table');for(const row of (data.leaderboard?.rows||[]).slice(0,15)){
        const tr=document.createElement('tr');for(const value of [row.rank,row.handle,msfmt(row.time_ms,true),row.outrage]){
          const td=document.createElement('td');td.textContent=String(value);tr.append(td);
        }table.append(tr);
      }box.append(table);
    }catch(e){box.textContent=e.message;}
  }
  function helpOpen(){helpReturn=root.activeElement;$('helpLayer').hidden=false;$('helpClose').focus();}
  function helpClose(){if($('helpLayer').hidden)return;$('helpLayer').hidden=true;helpReturn?.focus({preventScroll:true});}
  function close(){helpClose();closeArchive();if(dialog.open)dialog.close();}
  function onClose(){
    clearInterval(clockJob);clockJob=0;fx?.reset();clearTimeout(bursts);clearTimeout(settleTimer);
    document.body.classList.remove('measure-wire-active');
    document.documentElement.style.overflow=previousDocOverflow;document.body.style.overflow=previousBodyOverflow;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  async function mount(){
    const fragment=await fetch(BASE+'wire.html').then(r=>{if(!r.ok)throw new Error('Game markup unavailable');return r.text();});
    const style=document.createElement('link');style.rel='stylesheet';style.href=BASE+'wire.css';root.append(style);
    const surface=document.createElement('div');surface.innerHTML=fragment;while(surface.firstChild)root.append(surface.firstChild);
    try{strings=await fetch(BASE+'resources/strings.json',{cache:'no-store'}).then(r=>r.ok?r.json():strings);}catch{}
    fx=createEffects();
    $('wireOptInLabel').textContent=getStr('game.leaderboard_opt_in');$('wireHandleLabel').textContent=getStr('game.leaderboard_handle');$('wireHandleHint').textContent=getStr('game.leaderboard_handle_hint');$('wireHandleReroll').textContent=getStr('game.leaderboard_reroll');
    controlValue($('wireHandleValue'),savedHandle());
    $('wireOptIn').addEventListener('change',()=>{const on=$('wireOptIn').checked;$('wireHandleWrap').hidden=!on;$('wireOptStatus').hidden=true;if(on){controlValue($('wireHandleValue'),savedHandle());$('wireHandleReroll').focus();}});
    $('wireHandleReroll').addEventListener('click',rerollHandle);
    $('beginButton').addEventListener('click',()=>void start());
    $('practiceButton').addEventListener('click',()=>{mode='practice';puzzle={...SAMPLE};setPuzzle(puzzle);$('practiceButton').hidden=true;presentIntro();out('UNRANKED PRACTICE — NO OFFICIAL SCORE');});
    $('replayButton').addEventListener('click',()=>{
      if(mode==='ranked'&&state?.ranked){mode='practice';puzzle={...SAMPLE};setPuzzle(puzzle);}else if(mode==='ranked'){storeToken('');token='';}
      presentIntro();out(mode==='ranked'?'NEW VERIFIED RUN · LEADERBOARD OPTIONAL':'REPLAY IS PRACTICE / UNRANKED');
    });
    $('wireClose').addEventListener('click',close);
    $('wireArchiveButton').addEventListener('click',openArchive);$('wireArchiveClose').addEventListener('click',closeArchive);$('wireArchiveLoad').addEventListener('click',()=>void loadArchive());
    $('helpButton').addEventListener('click',helpOpen);
    $('helpClose').addEventListener('click',helpClose);$('helpDone').addEventListener('click',helpClose);
    $('helpLayer').addEventListener('click',e=>{if(e.target===$('helpLayer'))helpClose();});
    $('soundButton').addEventListener('click',()=>{muted=!muted;controlValue($('soundState'),muted?'OFF':'ON');$('soundButton').setAttribute('aria-pressed',String(!muted));});
    root.addEventListener('pointermove',e=>{if(!drag||!inRun())return;
      const r=$('boardInner').getBoundingClientRect();drawWire({x:e.clientX-r.left,y:e.clientY-r.top});});
    window.addEventListener('pointerup',e=>{if(!drag)return;const origin=drag.id;drag=null;drawWire();
      const target=root.elementFromPoint(e.clientX,e.clientY)?.closest('.node');if(target&&target.dataset.token!==origin){if(waiting)pendingDrag=target.dataset.token;else void choose(target.dataset.token);}
    },{passive:true});
    window.addEventListener('pointercancel',()=>{drag=null;drawWire();},{passive:true});
    observer=new ResizeObserver(()=>{fx?.resize();drawWire();});observer.observe(host);observer.observe($('boardInner'));
  }
  async function open(trigger){
    if(dialog.open){$('wireClose')?.focus();return;}
    previousFocus=trigger||document.activeElement;
    previousBodyOverflow=document.body.style.overflow;previousDocOverflow=document.documentElement.style.overflow;
    document.body.classList.add('measure-wire-active');document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
    try{dialog.showModal();if(!ready)ready=mount();await ready;await configure();
      const restored=await resume();if(restored===false)presentIntro();
      else if(restored==='unavailable'){$('welcomeLayer').hidden=false;$('beginButton').disabled=true;$('practiceButton').hidden=false;}
      $('wireClose').focus({preventScroll:true});fx?.resize();requestAnimationFrame(drawWire);
    }catch(err){console.error('THE WIRE modal failed',err);close();}
  }
  dialog.addEventListener('cancel',e=>{if($('helpLayer')&&!$('helpLayer').hidden){e.preventDefault();helpClose();}else if($('wireArchiveLayer')&&!$('wireArchiveLayer').hidden){e.preventDefault();closeArchive();}});
  dialog.addEventListener('close',onClose);
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  document.addEventListener('click',e=>{
    const launch=e.target.closest('[data-open-wire]');if(!launch)return;
    e.preventDefault();void open(launch);
  });
  window.MeasureWire={open,close};
  function createEffects(){
    const canvas=$('hexstorm'),ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return {resize(){},reset(){},spark(){},match(){},wrong(){},victory(){}};
    let width=1,height=1,raf=0,previous=0,dpr=1,flash=0;
    let particles=[],waves=[],timers=[];
    const tones=['#f1bd64','#4bea91','#cb97ff','#55c5ff','#ff6381'];
    function resize(){width=host.clientWidth||1;height=host.clientHeight||1;dpr=Math.min(1,window.devicePixelRatio||1,Math.sqrt(1300000/(width*height)));
      canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
    function clear(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);}
    function reset(){if(raf)cancelAnimationFrame(raf);raf=0;previous=0;particles=[];waves=[];flash=0;timers.forEach(clearTimeout);timers=[];clear();}
    function polygon(x,y,r,rot){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+rot;const X=x+Math.cos(a)*r,Y=y+Math.sin(a)*r;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.closePath();}
    function frame(t){raf=0;if(!dialog.open||document.hidden){reset();return;}if(t-previous<32){raf=requestAnimationFrame(frame);return;}
      const dt=previous?Math.min(.09,(t-previous)/1000):.033;previous=t;clear();ctx.globalCompositeOperation='lighter';
      waves=waves.filter(w=>{w.age+=dt;w.r+=185*dt;if(w.age>.9)return false;ctx.globalAlpha=(1-w.age/.9)*.55;ctx.strokeStyle=w.color;ctx.lineWidth=1.5;polygon(w.x,w.y,w.r,w.age*.6);ctx.stroke();return true;});
      particles=particles.filter(p=>{p.age+=dt;if(p.age>p.life)return false;p.vy+=110*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*2;
        ctx.globalAlpha=(1-p.age/p.life)*.9;ctx.strokeStyle=p.color;ctx.lineWidth=1.3;polygon(p.x,p.y,p.size,p.rot);ctx.stroke();return true;});
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      if(flash>.001){ctx.fillStyle=`rgba(243,190,100,${Math.min(.24,flash)})`;ctx.fillRect(0,0,width,height);flash=Math.max(0,flash-dt*1.5);}
      if(particles.length||waves.length||flash>.001)raf=requestAnimationFrame(frame);
      else{previous=0;clear();}
    }
    function kick(){if(reduced.matches||document.hidden||!dialog.open||raf)return;raf=requestAnimationFrame(frame);}
    function nodeCenter(node){if(!node)return{x:width/2,y:height/2};const r=node.getBoundingClientRect(),h=host.getBoundingClientRect();return{x:r.left+r.width/2-h.left,y:r.top+r.height/2-h.top};}
    function burst(x,y,n,color,power=1){if(reduced.matches)return;
      for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(55+Math.random()*190)*power;
        particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,size:2+Math.random()*4,age:0,life:.5+Math.random()*.75,rot:Math.random()*Math.PI,color});}
      if(particles.length>220)particles.splice(0,particles.length-220);
      kick();}
    function wave(x,y,color){waves.push({x,y,age:0,r:9,color});kick();}
    return {resize,reset,spark(node){const p=nodeCenter(node);burst(p.x,p.y,6,tones[0],.4);},
      match(node,n){const p=nodeCenter(node);burst(p.x,p.y,8+n*4,tones[n>=4?4:1],.7+n*.1);wave(p.x,p.y,tones[n>=4?4:2]);flash=n>=4?.16:.07;kick();},
      wrong(){flash=.08;kick();},
      victory(){if(reduced.matches)return;flash=.4;wave(width/2,height/2,tones[0]);
        for(let i=0;i<70;i++)burst(Math.random()*width,Math.random()*height*.8,1,tones[i%5],.6+Math.random());
        timers.push(setTimeout(()=>{for(let j=0;j<7;j++){const x=Math.random()*width,y=Math.random()*height*.8;wave(x,y,tones[j%5]);burst(x,y,8,tones[j%5],.9);}},600));kick();}};
  }
})();
