/* ===== 리메이트 공통: 글 데이터 · 헤더/푸터 · 카드 ===== */

// 글 데이터(CATEGORIES, POSTS)는 posts.js에 있습니다. (원고 .md → tools/build_posts.py로 생성)

const getPost = (slug) => POSTS.find((p) => p.slug === slug);
const postByField = (field) => POSTS.find((p) => p.field === field);

/* ---------- 아이콘 ---------- */
const svg = (cls, paths) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${paths}</svg>`;
const ICON = {
  arrowUpRight: (cls) => svg(cls, '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
  menu: (cls) => svg(cls, '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>'),
  x: (cls) => svg(cls, '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  chevronLeft: (cls) => svg(cls, '<path d="m15 18-6-6 6-6"/>'),
  chevronRight: (cls) => svg(cls, '<path d="m9 18 6-6-6-6"/>'),
  share: (cls) => svg(cls, '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>'),
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- 글 카드 ---------- */
const postHref = (p) => p.external || `/blog/${encodeURIComponent(p.slug)}/`;
const linkAttrs = (p) => p.external ? `href="${esc(p.external)}" target="_blank" rel="noreferrer"` : `href="${postHref(p)}"`;
const Badge = (text) => `<span class="inline-block rounded bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">${esc(text)}</span>`;

// 썸네일: assets/thumbs/{slug}.jpg. 파일이 없으면 그림 대신 원고의 '이미지 글자'를 보여줍니다.
// main: 글 본문 맨 위 대표 그림 (검색용 설명(alt)을 넣고 바로 불러옴)
function Thumb(p, size, main = false) {
  const box = size === 'row'
    ? 'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-placeholder'
    : 'relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-placeholder';
  const text = size === 'row' ? 'text-[11px]' : 'text-xl';
  return `<div class="${box}">`
    + `<span class="absolute inset-0 grid place-items-center px-2 text-center font-bold text-muted-foreground ${text}">${esc(p.thumbText || '')}</span>`
    + `<img src="${esc(p.image)}" alt="${main ? esc(p.title) : ''}" ${main ? 'fetchpriority="high"' : 'loading="lazy"'} width="1280" height="720" onerror="this.remove()" class="absolute inset-0 h-full w-full object-cover${size === 'row' ? '' : ' transition-transform duration-500 group-hover:scale-[1.03]'}">`
    + `</div>`;
}

// size: 'md'(기본, 16:9 그림) | 'row'(작은 썸네일 한 줄)
function PostCard(p, { hint, size = 'md' } = {}) {
  const inner = size === 'row'
    ? `<div class="flex items-center gap-4 border-b border-border py-3">${Thumb(p, 'row')}<div class="min-w-0"><p class="truncate font-semibold">${esc(p.title)}</p><p class="text-xs text-muted-foreground">${esc(p.category)}</p></div></div>`
    : `<div class="group">${Thumb(p, 'md')}`
      + `<p class="mt-3 font-semibold leading-snug">${esc(p.title)}${p.external ? ICON.arrowUpRight('ml-0.5 inline h-4 w-4 text-info') : ''}</p>`
      + `<p class="mt-1 text-sm text-muted-foreground">${esc(hint ?? p.subtitle)}</p>`
      + (hint ? '' : `<div class="mt-2">${Badge(p.category)}</div>`) + `</div>`;
  return `<a ${linkAttrs(p)}>${inner}</a>`;
}

// 글의 계산기 버튼 주소: 값이 있으면 넣고(?retireAge=53), 관련 입력칸을 강조(&focus=monthlySpend)
function calcHref(cta) {
  const q = new URLSearchParams(cta?.search || {});
  if (cta?.fields?.length) q.set('focus', cta.fields.join(','));
  const qs = q.toString();
  return '/' + (qs ? '?' + qs : '');
}

/* ---------- 글 본문 ----------
   글 페이지(/blog/{slug}/)는 tools/render_pages.js가 이 함수로 미리 그려 둡니다.
   본문 HTML(굵게·링크)은 tools/build_posts.py가 원고에서 안전하게 만들어 둔 것입니다. */
function CtaBox(p) {
  const c = p.cta || {};
  return `<div class="rounded-2xl bg-primary p-5 text-primary-foreground">
      <p class="font-bold">내 숫자로 그려볼까요?</p>
      <p class="mt-1 text-sm opacity-70">글에서 본 숫자를 계산기에 바로 넣어봐요.</p>
      <a href="${calcHref(c)}" class="mt-4 block rounded-lg bg-background py-3 text-center text-sm font-semibold text-foreground">${esc(c.label ?? '내 은퇴 계산해보기')} →</a>
      ${c.secondary ? `<a href="/" class="mt-2 block py-2 text-center text-sm opacity-70">${esc(c.secondary)}</a>` : ''}
    </div>`;
}

function PostBlock(b, post) {
  switch (b.type) {
    case 'p': return `<p>${b.html}</p>`;
    case 'h': return `<h2 class="pt-4 text-lg font-bold">${b.html}</h2>`;
    case 'ul': return `<ul class="list-disc pl-5 space-y-1.5">${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'ol': return `<ol class="list-decimal pl-5 space-y-1.5">${b.items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
    case 'table': return `<div class="table-wrap"><table class="w-full text-sm">
        <thead><tr class="border-b border-foreground">${b.head.map((h, i) => `<th class="py-2 font-semibold ${i ? 'text-right' : 'text-left'}">${h}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr class="border-b border-border">${r.map((c, i) => `<td class="py-2 ${i ? 'num text-right' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'note': return `<div class="rounded-xl bg-short-soft p-4 text-sm"><p class="font-semibold">${esc(b.title)}</p><p class="mt-1">${b.html}</p></div>`;
    case 'cta': return CtaBox(post);
    case 'stat': return `<div class="py-2"><p class="num text-4xl font-extrabold">${esc(b.value)}</p><p class="mt-1 text-xs text-muted-foreground">${esc(b.label)}</p></div>`;
    default: return '';
  }
}

// 글 한 편 전체(본문 + 출처 + 연관 글)
function PostPage(post) {
  const related = POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);
  const hasCta = post.body.some((b) => b.type === 'cta');
  return `
  <article class="mx-auto max-w-[760px] px-5 pt-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">${Badge(post.category)}<time datetime="${esc(post.date.replace(/\./g, '-'))}">${esc(post.date)}</time></div>
      <button id="share" class="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">${ICON.share('h-3.5 w-3.5')}공유하기</button>
    </div>
    <h1 class="mt-4 text-2xl font-bold leading-snug sm:text-3xl">${esc(post.title)}</h1>
    <p class="mt-2 text-muted-foreground">${esc(post.subtitle)}</p>
    <div class="mt-6">${Thumb(post, 'md', true)}</div>
    <div class="post-body mt-6 space-y-4 leading-[1.8]">${post.body.map((b) => PostBlock(b, post)).join('')}</div>
    ${hasCta ? '' : `<div class="mt-8">${CtaBox(post)}</div>`}
    ${post.sources?.length ? `<div class="post-sources mt-8 rounded-xl bg-surface p-4 text-xs text-muted-foreground"><p class="font-semibold text-foreground">출처</p>
      ${post.sources.map((s) => `<p class="mt-1.5">${s.html}</p>${s.sub ? `<ul class="list-disc pl-5">${s.sub.map((x) => `<li class="mt-0.5">${x}</li>`).join('')}</ul>` : ''}`).join('')}</div>` : ''}
    <div class="mt-8 flex justify-center"><a href="/blog/" class="rounded-full border border-border bg-card px-6 py-2.5 text-sm">블로그 홈으로 돌아가기</a></div>
  </article>
  ${related.length ? `<section class="mx-auto mt-16 max-w-[1200px] border-t border-border px-5 pt-10">
    <h2 class="text-xl font-bold">연관 콘텐츠</h2>
    <div class="mt-5 grid gap-6 sm:grid-cols-2">${related.map((p) => PostCard(p)).join('')}</div>
  </section>` : ''}`;
}

/* ---------- 헤더 / 푸터 ----------
   헤더와 푸터는 각 HTML 파일에 처음부터 들어 있습니다.
   (JS로 나중에 그리면 페이지를 열 때마다 본문이 아래로 밀려 덜컹거립니다.)
   여기서는 모바일 메뉴 열기/닫기만 연결합니다. */
function initMenu() {
  const btn = document.getElementById('menu-btn'), mnav = document.getElementById('mobile-nav');
  if (!btn || !mnav) return;
  btn.addEventListener('click', () => {
    mnav.hidden = !mnav.hidden;
    btn.innerHTML = mnav.hidden ? ICON.menu('h-5 w-5') : ICON.x('h-5 w-5');
  });
}
if (typeof document !== 'undefined') initMenu();
