const palette = { '棕色': ['cocoa', '#b49a84'], '白色': ['snow', '#eee9df'], '粉色': ['blush', '#e7c0c8'], '蓝色': ['blue', '#aebdce'] };
const captions = ['A little calendar for winter days.', 'A cozy day in cocoa.', 'Soft knits and slower days.', 'A song for a snowy day.', 'A little moment in the light.', 'A little pink, a little joy.', 'Headphones on, winter world off.', 'A little blue to share with you.', 'Coffee, sunshine and soft blue.', 'Collecting little November moments.'];
const src = index => `assets/${encodeURIComponent(photos[index])}`;
const escapeText = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icon = name => icons[name] || '';
const avatar = (small = false) => `<span class="${small ? 'mini-avatar' : 'avatar'}"><img src="${src(1)}" alt="" width="58" height="58"></span>`;
const iconButton = (name, label, action, extra = '') => `<button class="icon-button ${action}" aria-label="${label}" data-action="${action}" ${extra}>${icon(name)}</button>`;
function heartIcon(liked) {
  return liked ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.6C10 20.1 1 13.7 1 8.3 1 2 8.5.3 12 5.1 15.5.3 23 2 23 8.3c0 5.4-9 11.8-11 13.3Z"/></svg>' : icon('like');
}
function postMarkup(index) {
  const item = state.items[photos[index]] || {};
  const color = palette[photos[index].slice(0, 2)][0];
  return `<article class="post" id="post-${index}" data-index="${index}" aria-label="look ${index + 1}">
    <header class="post-head"><button data-action="profile" aria-label="Duoduo’s profile">${avatar()}</button>
      <button class="identity" data-action="profile">duoduo.diary<small>Winter diary · ${color}</small></button>
      ${iconButton('more-detail', 'More options', 'more')}</header>
    <img class="photo" src="${src(index)}" width="1200" height="1600" alt="${escapeText(`${color} look ${index + 1}`)}" ${index > 1 ? 'loading="lazy"' : ''}>
    <div class="actions"><button class="icon-button like" data-action="like" aria-label="Like" aria-pressed="${!!item.liked}">${heartIcon(item.liked)}</button>
      ${iconButton('comment', 'Comment', 'comment')}${iconButton('share', 'Share', 'share')}
      ${iconButton('save', 'Save', 'save', `aria-pressed="${!!item.saved}"`)}</div>
    <div class="caption"><p><strong>duoduo.diary</strong> ${captions[index]}</p>
      <button class="comment-link" data-action="comment">${item.comments?.length ? `View all ${item.comments.length} comments` : 'Add a comment…'}</button>
      <time>November · Winter diary</time></div></article>`;
}
function gridMarkup(indices) {
  return indices.length ? `<div class="grid">${indices.map(i => `<button data-open="${i}" aria-label="View photo ${i + 1}"><img src="${src(i)}" width="1200" height="1600" alt="${escapeText(`${palette[photos[i].slice(0, 2)][0]} look ${i + 1}`)}" loading="lazy"></button>`).join('')}</div>` : '<div class="empty"><h2>No photos yet</h2><p>Try another color or save a favorite look.</p></div>';
}
function profileMarkup(saved = false) {
  const savedCount = photos.filter(file => state.items[file]?.saved).length;
  return `<section class="profile"><div class="profile-top">${avatar()}<div class="stats"><div><strong>10</strong>posts</div><div><strong>4</strong>colors</div><div><strong>${savedCount}</strong>saved</div></div></div>
    <p class="bio"><strong>Duoduo</strong>Winter outfit diary ☁️<br>little moments, warm winter.</p>
    <div class="profile-actions"><button data-action="feed">View feed</button><button data-action="share-profile">Share profile</button></div>
    <div class="highlights">${Object.entries(palette).map(([color, [name, hex]]) => `<button data-color="${color}" aria-label="View ${name} looks"><span class="highlight-cover"><span style="background:${hex}"></span></span>${name}</button>`).join('')}</div></section>
    <div class="profile-tabs" role="tablist" aria-label="Profile photos"><button role="tab" aria-label="Posts" aria-selected="${!saved}" data-tab="all"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/></svg></button><button role="tab" aria-label="Saved" aria-selected="${saved}" data-tab="saved">${icon('save')}</button></div>
    ${gridMarkup(photos.map((_, i) => i).filter(i => !saved || state.items[photos[i]]?.saved))}`;
}
function headerMarkup(view) {
  if (view === 'feed') return `<button class="wordmark" data-action="feed-menu" aria-label="Switch feed">${icon('instagram')}<span class="chevron"></span></button><div class="top-icons">${iconButton('like', 'Liked posts', 'liked')}${iconButton('messages', 'Messages', 'messages')}</div>`;
  const titles = { explore: 'Explore', profile: 'duoduo.diary', liked: 'Liked posts', reels: 'Reels' };
  return `<button class="back-button" data-action="back" aria-label="Back to feed">‹</button><span class="top-title">${titles[view]}</span>${iconButton('more-detail', 'More options', 'about')}`;
}
function navMarkup(view) {
  return [['home', 'Home', 'feed'], ['search', 'Explore photos', 'explore'], ['create', 'Create post', 'create'], ['reels', 'Reels', 'reels'], ['', 'Profile', 'profile']].map(([name, label, action]) => `<button data-action="${action}" aria-label="${label}" ${view === action ? 'aria-current="page"' : ''}>${name ? icon(name) : avatar(true)}</button>`).join('');
}
