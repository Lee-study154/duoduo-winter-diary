const { progress, smooth, range } = Motion;
const root = document.documentElement;
const intro = document.querySelector('.intro');
const works = document.querySelector('.works');
const workImages = [...document.querySelectorAll('.work-image')];
const alternate = new URLSearchParams(location.search).get('version') === 'b';
const workflow = document.querySelector('#workflow');
const phone = document.querySelector('#phone');
const transition = document.querySelector('.phone-transition');
const workflowWrap = document.querySelector('.workflow-wrap');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const set = (name, value) => root.style.setProperty(name, value);
const sectionProgress = element => progress(-element.getBoundingClientRect().top, element.offsetHeight - innerHeight);
let scheduled = false;
let workflowCards = []; 
function update() {
 scheduled = false;
 if (reduce.matches) return;
 const a = sectionProgress(intro);
 set('--intro-y', `${-a * innerHeight * .58}px`);
 set('--tilt', `${a * 35}deg`);
 set('--intro-opacity', 1 - smooth(range(a,.64,1)));
 set('--heading-y', `${-smooth(range(a,.05,.85)) * (innerHeight / 2 - 24)}px`);
 set('--heading-scale', 1 - .48 * smooth(range(a,.05,.85)));
 set('--heading-opacity', 1 - smooth(range(a,.78,1)));
 set('--nav-name', smooth(range(a,.72,1)));
 const b = sectionProgress(works);
 const timeline = b * workImages.length;
 const exit = smooth(range(b,.91,1));
 workImages.forEach((image,index)=>{
  const incoming = index === 0 ? 1 : smooth(range(timeline,index-.5,index+.15));
  const outgoing = index === workImages.length-1 ? 0 : smooth(range(timeline,index+.5,index+1.15));
  image.style.opacity = incoming * (1-outgoing) * (1-exit);
  image.style.transform = `translate3d(${(1-incoming)*42-outgoing*42}vw, ${(1-incoming)*10-outgoing*8}vh, 0) rotate(${(1-incoming)*5-outgoing*5}deg)`;
 });
 set('--work-title-opacity', 1-exit); set('--title-x', `${-b*4}vw`);
 const current = Math.min(workImages.length-1, Math.floor(timeline+.2));
 document.querySelector('.work-description').innerHTML = (current < 3 ? 'MONCLER / BLUE DOWN JACKET' : 'MONCLER / MAIRE WHITE DOWN JACKET') + '<br>26 AW / WINTER EDITORIAL';
 workflowCards.forEach((card, index) => {
  const frameTop = workflow.getBoundingClientRect().top;
  const rect = card.getBoundingClientRect();
  const localScale = workflow.getBoundingClientRect().width / workflow.offsetWidth;
  const visualTop = frameTop + rect.top * localScale;
  const advancing = !alternate && transition.getBoundingClientRect().top < innerHeight;
  const arrival = smooth(progress(innerHeight * 1.02 - visualTop, innerHeight * .65));
  const settling = !alternate ? smooth(range(innerHeight + 220 - transition.getBoundingClientRect().top, 0, 220)) : 0;
  const amount = advancing ? 1 : Math.max(arrival, settling);
  card.style.setProperty('--entry-x', `${(1-amount) * (index % 2 ? innerWidth * .65 : -innerWidth * .65)}px`);
  card.style.setProperty('--entry-y', `${(1-amount) * 65}px`);
  card.style.setProperty('--entry-opacity', amount);
 });

 const c = sectionProgress(transition);
 const travel = smooth(range(c,0,.88));
 set('--scatter', travel);
 set('--diary-opacity', smooth(range(c,.12,.72)));
 set('--diary-scale', .88 + .12 * smooth(range(c,.12,.8)));
 set('--images-opacity', 1 - smooth(range(c,.76,1)));
 transition.classList.toggle('revealed', c > .92);
 if (!alternate) updateWorkflowJourney();
}
function updateWorkflowJourney(){
 const top = transition.getBoundingClientRect().top;
 const active = top < innerHeight && transition.getBoundingClientRect().bottom > innerHeight;
 const journey = progress(innerHeight - top, transition.offsetHeight);
 const travel = smooth(range(journey, .02, .85));
 const frameHeight = workflowWrap.getBoundingClientRect().height;
 document.body.classList.toggle('workflow-journey', active);
 if (active) {
  workflowWrap.style.height = `${frameHeight}px`;
  workflow.style.top = `${innerHeight - frameHeight}px`;
  workflow.style.transformOrigin = `50% ${frameHeight - innerHeight / 2}px`;
  workflow.style.transform = `scale(${1 + travel * 2.5})`;
  workflow.style.opacity = 1 - smooth(range(journey, .58, .9));
  workflowCards.forEach(card => {
   const x = Number(card.style.getPropertyValue('--x')) || 603;
   const y = Number(card.style.getPropertyValue('--y')) || 935;
   const dx = x / 1206 - .5, dy = y / 1870 - .78;
   card.style.setProperty('--journey-x', `${(dx * 700 + Math.sign(dx) * 90) * travel}px`);
   card.style.setProperty('--journey-y', `${(dy * 500 + Math.sign(dy) * 60) * travel}px`);
  });
 } else {
  workflowWrap.style.height = '';
  workflow.style.top = '';
  workflow.style.transformOrigin = '';
  workflow.style.transform = '';
  workflow.style.opacity = '';
  workflowCards.forEach(card => {card.style.removeProperty('--journey-x');card.style.removeProperty('--journey-y');});
 }
 set('--diary-opacity', smooth(range(journey, .22, .82)));
 set('--diary-scale', .92 + .08 * smooth(range(journey, .22, .85)));
 transition.classList.toggle('revealed', journey > .9);
}
function requestUpdate(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',requestUpdate,{passive:true}); addEventListener('resize',requestUpdate); requestUpdate();
if(matchMedia('(pointer:fine)').matches && !reduce.matches){
 let targetX=0, targetY=0, x=0, y=0, moving=false;
 function follow(){
  x += (targetX-x)*.055; y += (targetY-y)*.055;
  set('--mx', `${x}px`); set('--my', `${y}px`);
  if(Math.abs(targetX-x)>.05 || Math.abs(targetY-y)>.05) requestAnimationFrame(follow);
  else moving=false;
 }
 document.querySelector('.intro-sticky').addEventListener('pointermove',e=>{
  targetX=(e.clientX/innerWidth-.5)*120; targetY=(e.clientY/innerHeight-.5)*55;
  if(!moving){moving=true;requestAnimationFrame(follow);}
 });
}
workflow.addEventListener('load',()=>{
 const doc=workflow.contentDocument; if(!doc) return;
 const style=doc.createElement('style');
 style.textContent='html,body{background:transparent!important} header{display:none!important} .canvas{max-width:1600px} .card,.label{transition:translate .5s ease,box-shadow .45s ease;transform:translate3d(calc(var(--dx,0px) + var(--entry-x,0px) + var(--journey-x,0px)),calc(var(--dy,0px) + var(--entry-y,0px) + var(--journey-y,0px)),0);opacity:var(--entry-opacity,1)} @media(max-width:700px){main{overflow:visible}}';
 doc.head.append(style);
 const cards=[...doc.querySelectorAll('.card, .label')]; workflowCards=cards; requestUpdate();
 if(!matchMedia('(pointer:fine)').matches || reduce.matches) return;
 doc.addEventListener('pointermove',event=>{
  cards.forEach(card=>{const r=card.getBoundingClientRect(); const dx=r.left+r.width/2-event.clientX,dy=r.top+r.height/2-event.clientY; const distance=Math.hypot(dx,dy); const force=Math.max(0,1-distance/230)*18; card.style.translate=distance ? `${dx/distance*force}px ${dy/distance*force}px` : '0px';});
 });
 doc.addEventListener('pointerleave',()=>cards.forEach(card=>card.style.translate='0px'));
});
phone.addEventListener('load',()=>{
 const doc=phone.contentDocument; if(!doc) return;
 const style=doc.createElement('style'); style.textContent='body,.stage{background:#fff!important}.hint{display:none}'; doc.head.append(style);
 doc.addEventListener('wheel', event => {
  const feed = doc.querySelector('#feed');
  if (!feed || !transition.classList.contains('revealed')) return;
  const rect = feed.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
  feed.scrollBy({top: event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? feed.clientHeight : 1)});
  event.preventDefault();
 }, {passive:false});
});
// A stationary pointer can remain targeted at the parent as the iframe is revealed.
addEventListener('wheel', event => {
 if (scrollY + innerHeight < document.documentElement.scrollHeight - 2) return;
 const feed = phone.contentDocument?.querySelector('#feed');
 if (!feed) return;
 const frameRect = phone.getBoundingClientRect(), feedRect = feed.getBoundingClientRect();
 const scaleX = frameRect.width / phone.clientWidth, scaleY = frameRect.height / phone.clientHeight;
 const x = (event.clientX - frameRect.left) / scaleX, y = (event.clientY - frameRect.top) / scaleY;
 if (x < feedRect.left || x > feedRect.right || y < feedRect.top || y > feedRect.bottom) return;
 feed.scrollBy({top: event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? feed.clientHeight : 1)});
 event.preventDefault();
}, {passive:false});
document.querySelectorAll('[data-scramble]').forEach(link=>{
 const original=link.textContent, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let timer;
 link.addEventListener('pointerenter',()=>{if(reduce.matches)return; clearInterval(timer);let step=0;timer=setInterval(()=>{link.textContent=[...original].map((c,i)=>i<step?c:chars[Math.floor(Math.random()*chars.length)]).join('');step+=.7;if(step>=original.length){clearInterval(timer);link.textContent=original;}},35);});
 link.addEventListener('pointerleave',()=>{clearInterval(timer);link.textContent=original;});
});

if(alternate){
 const sources=['../duoduo-story/assets/raw/brown1.png','purple-1.png','../duoduo-story/assets/raw/brown2.png','purple-2.png','../duoduo-story/assets/raw/brown3.png','purple-1.png'];
 document.querySelectorAll('.transition-images img').forEach((image,index)=>image.src=sources[index]);
 document.body.classList.add('alternate');
}
