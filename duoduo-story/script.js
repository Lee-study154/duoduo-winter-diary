const cards = [...document.querySelectorAll('.card')];
const viewer = document.querySelector('#viewer');
const preview = viewer.querySelector('img');
cards.forEach(card => card.addEventListener('click', () => { preview.src = card.querySelector('img').src; viewer.showModal(); }));
viewer.querySelector('.close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('.canvas');
if (matchMedia('(pointer: fine)').matches) {
 canvas.addEventListener('pointermove', e => {
  if (reduced.matches) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
  cards.forEach(card => { const d = Number(card.style.getPropertyValue('--depth')); card.style.setProperty('--dx', `${x*d*4}px`); card.style.setProperty('--dy', `${y*d*4}px`); });
 });
 canvas.addEventListener('pointerleave', () => cards.forEach(card => { card.style.setProperty('--dx', '0px'); card.style.setProperty('--dy', '0px'); }));
}
