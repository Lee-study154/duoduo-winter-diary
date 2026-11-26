const feed = document.querySelector('#feed');
const topbar = document.querySelector('#top');
const nav = document.querySelector('#nav');
const sheet = document.querySelector('#sheet');
const storageKey = 'duoduo-diary-v2';
let state = { items: {} };
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (stored?.items && typeof stored.items === 'object' && !Array.isArray(stored.items)) state = stored;
} catch { /* Storage may be unavailable in private or file previews. */ }
let view = 'feed';
let feedPosition = 0;
let selectedColor = '';
let profileSaved = false;
let sheetTrigger;
let toastTimer;
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { toast('Unable to save in this browser. Changes last for this visit.'); }
}
function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 2400);
}
function render(next = 'feed', index = null) {
  if (view === 'feed') feedPosition = feed.scrollTop;
  view = next;
  topbar.innerHTML = headerMarkup(view);
  nav.innerHTML = navMarkup(view);
  if (view === 'feed') {
    feed.innerHTML = photos.map((_, i) => postMarkup(i)).join('') + '<div class="end"><span class="check">✓</span><strong>You’re all caught up</strong><p>A little warmth for winter.</p></div>';
  } else if (view === 'profile') feed.innerHTML = profileMarkup(profileSaved);
  else if (view === 'explore') {
    feed.innerHTML = `<div class="search-wrap"><input type="search" aria-label="Search looks" placeholder="Search colors and looks" autocomplete="off"></div><div class="filters">${['All', ...Object.keys(palette)].map(color => `<button data-filter="${color === 'All' ? '' : color}" aria-pressed="${selectedColor === (color === 'All' ? '' : color)}">${color === 'All' ? 'All' : palette[color][0]}</button>`).join('')}</div><div id="results"></div>`;
    filterGrid();
  } else if (view === 'liked') feed.innerHTML = gridMarkup(photos.map((_, i) => i).filter(i => state.items[photos[i]]?.liked));
  else if (view === 'reels') feed.innerHTML = `<div class="empty">${icon('reels')}<h2>No reels yet</h2><p>Duoduo’s winter moments are in photos for now.</p><button data-action="feed">Browse the feed</button></div>`;
  feed.scrollTop = 0;
  if (view === 'feed') {
    if (index !== null) {
      const target = document.querySelector(`#post-${index}`);
      feed.scrollTop = (target.getBoundingClientRect().top - feed.getBoundingClientRect().top) * feed.clientWidth / feed.getBoundingClientRect().width;
    } else feed.scrollTop = feedPosition;
  }
}
function filterGrid() {
  const query = feed.querySelector('input')?.value.trim().toLowerCase() || '';
  const indices = photos.map((_, i) => i).filter(i => {
    const color = photos[i].slice(0, 2);
    return (!selectedColor || selectedColor === color) && `${photos[i]} ${palette[color][0]} ${captions[i]}`.toLowerCase().includes(query);
  });
  document.querySelector('#results').innerHTML = gridMarkup(indices);
}
function openSheet(title, content) {
  sheetTrigger = document.activeElement;
  document.querySelector('#sheet-title').textContent = title;
  document.querySelector('#sheet-content').innerHTML = content;
  sheet.show();
  [feed, topbar, nav].forEach(element => { element.inert = true; });
  document.querySelector('#close-sheet').focus();
}
function closeSheet() {
  sheet.close();
  [feed, topbar, nav].forEach(element => { element.inert = false; });
  if (sheetTrigger?.isConnected) sheetTrigger.focus({ preventScroll: true });
}
function comments(index) {
  const rows = state.items[photos[index]]?.comments || [];
  openSheet('Comments', `<p>Comments are saved only in this browser.</p><div>${rows.map(text => `<div class="comment-row"><strong>You</strong>${escapeText(text)}</div>`).join('') || '<p>Share a thought about this look.</p>'}</div><form id="comment-form" data-index="${index}"><input aria-label="Add a comment" placeholder="Add a comment…" maxlength="200" required><button type="submit">Post</button></form>`);
}
function share(index = null) {
  const url = new URL(location.href);
  url.hash = index === null ? 'profile' : `look-${index + 1}`;
  openSheet('Share', `<p>Copy this local preview link to open it on this computer.</p><input aria-label="Preview link" value="${escapeText(url.href)}" readonly style="width:100%;font-size:9px;padding:8px;border:1px solid #ddd;border-radius:5px"><button class="sheet-action" data-action="copy">Copy link</button>`);
}
function toggle(index, field, button) {
  const item = state.items[photos[index]] ||= {};
  item[field] = !item[field];
  button.setAttribute('aria-pressed', String(item[field]));
  if (field === 'liked') button.innerHTML = heartIcon(item.liked);
  persist();
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.id === 'close-sheet') return closeSheet();
  if (button.dataset.open !== undefined) return render('feed', Number(button.dataset.open));
  if (button.dataset.color !== undefined) { selectedColor = button.dataset.color; return render('explore'); }
  if (button.dataset.filter !== undefined) {
    selectedColor = button.dataset.filter;
    feed.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === selectedColor)));
    return filterGrid();
  }
  if (button.dataset.tab !== undefined) { profileSaved = button.dataset.tab === 'saved'; return render('profile'); }
  const action = button.dataset.action;
  const index = Number(button.closest('[data-index]')?.dataset.index ?? 0);
  if (action === 'like' || action === 'save') return toggle(index, action === 'like' ? 'liked' : 'saved', button);
  if (action === 'comment') return comments(index);
  if (action === 'share' || action === 'share-profile') { if (sheet.open) closeSheet(); return share(action === 'share' ? index : null); }
  if (action === 'copy') {
    const input = sheet.querySelector('input');
    try { await navigator.clipboard.writeText(input.value); toast('Link copied'); }
    catch { input.focus(); input.select(); toast('Copy the selected link'); }
    return;
  }
  if (action === 'more') return openSheet('Post options', `<button class="sheet-action" data-action="share" data-index="${index}">Share this look</button><button class="sheet-action" data-action="profile">View duoduo.diary</button>`);
  if (action === 'feed-menu') return openSheet('Feed', '<button class="sheet-action" data-action="feed">All posts</button><button class="sheet-action" data-action="liked">Liked posts</button><button class="sheet-action" data-action="saved">Saved</button>');
  if (action === 'messages') return openSheet('Messages', '<p>No messages yet.</p><p>This local preview is not connected to Instagram messages.</p>');
  if (action === 'create') return openSheet('Create post', '<p>This lookbook contains 10 finished images.</p><p>Publishing is not connected to Instagram.</p><button class="sheet-action" data-action="explore">View all photos</button>');
  if (action === 'about') return openSheet('Duoduo’s winter diary', '<p>10 photos · 4 color stories.</p><p>Likes, saves and comments are stored in this browser.</p><button class="sheet-action" data-action="saved">View saved posts</button>');
  if (sheet.open) closeSheet();
  if (action === 'saved') { profileSaved = true; return render('profile'); }
  if (action === 'back') return render('feed');
  if (action === 'feed') return render('feed', 0);
  if (['explore', 'profile', 'liked', 'reels'].includes(action)) {
    if (action === 'explore') selectedColor = '';
    if (action === 'profile') profileSaved = false;
    render(action);
  }
});
feed.addEventListener('input', event => { if (event.target.matches('input[type="search"]')) filterGrid(); });
feed.addEventListener('dblclick', event => {
  if (!event.target.matches('.photo')) return;
  const article = event.target.closest('.post');
  const index = Number(article.dataset.index);
  if (!state.items[photos[index]]?.liked) toggle(index, 'liked', article.querySelector('.like'));
});
sheet.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const text = form.querySelector('input').value.trim();
  if (!text) return;
  const index = Number(form.dataset.index);
  const item = state.items[photos[index]] ||= {};
  (item.comments ||= []).push(text);
  persist();
  closeSheet();
  const post = document.querySelector(`#post-${index}`);
  post.querySelector('.comment-link').textContent = `View all ${item.comments.length} comments`;
  comments(index);
});
sheet.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); closeSheet(); }
  if (event.key !== 'Tab') return;
  const controls = [...sheet.querySelectorAll('button, input')];
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
function openHash() {
  const match = location.hash.match(/^#look-(\d+)$/);
  if (location.hash === '#profile') render('profile');
  else render('feed', match ? Math.max(0, Math.min(photos.length - 1, Number(match[1]) - 1)) : 0);
}
window.addEventListener('hashchange', openHash);
openHash();
