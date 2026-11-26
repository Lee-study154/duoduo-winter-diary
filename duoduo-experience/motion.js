(function(root){
 const progress = (value, max) => max <= 0 ? 1 : Math.max(0, Math.min(1, value / max));
 const smooth = value => { const t = progress(value, 1); return t * t * (3 - 2 * t); };
 const range = (value, start, end) => progress(value - start, end - start);
 const api = { progress, smooth, range };
 if (typeof module !== 'undefined') module.exports = api;
 else root.Motion = api;
})(typeof window === 'undefined' ? globalThis : window);
