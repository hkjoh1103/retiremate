#!/usr/bin/env node
/* 글 페이지 미리 그리기: posts.js + site.js의 PostPage()로 글마다
   blog/{slug}/index.html을 만들고, sitemap.xml도 새로 씁니다.
   직접 실행할 일은 없어요. tools/build_posts.py가 마지막에 불러요. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://retire-mates.com';

const ctx = { URLSearchParams };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'posts.js'), 'utf8') + '\n' + fs.readFileSync(path.join(ROOT, 'site.js'), 'utf8')
  + '\nthis.POSTS = POSTS; this.PostPage = PostPage; this.esc = esc;', ctx);
const { POSTS, PostPage, esc } = ctx;

const tpl = fs.readFileSync(path.join(__dirname, 'post_template.html'), 'utf8').replace(/^<!--.*?-->\n/, '');
const iso = (d) => d.replace(/\./g, '-');
const abs = (p) => SITE + p;

// 지난 생성물 지우기 (원고에서 빠진 글이 남지 않게)
for (const d of fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })) {
  if (d.isDirectory()) fs.rmSync(path.join(ROOT, 'blog', d.name), { recursive: true });
}

for (const p of POSTS) {
  const url = `${SITE}/blog/${p.slug}/`;
  const title = p.seoTitle || `${p.title} | 리메이트`;
  const desc = p.seoDescription || p.subtitle;
  const image = abs(p.image);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: desc, image: [image],
      datePublished: iso(p.date), dateModified: iso(p.date), inLanguage: 'ko-KR', mainEntityOfPage: url,
      keywords: (p.keywords || []).join(', '), articleSection: p.category,
      author: { '@type': 'Organization', name: '리메이트', url: SITE + '/' },
      publisher: { '@type': 'Organization', name: '리메이트', url: SITE + '/', logo: { '@type': 'ImageObject', url: abs('/assets/icons/apple-touch-icon.png') } } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '리메이트', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url } ] },
  ];
  const meta = [
    `<meta name="description" content="${esc(desc)}">`,
    p.keywords?.length ? `<meta name="keywords" content="${esc(p.keywords.join(', '))}">` : '',
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="리메이트 ReMate">`,
    `<meta property="og:locale" content="ko_KR">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="article:published_time" content="${iso(p.date)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('\n');
  const html = tpl.replace('{{TITLE}}', () => esc(title)).replace('{{META}}', () => meta).replace('{{MAIN}}', () => PostPage(p));
  const dir = path.join(ROOT, 'blog', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const latest = POSTS.map((p) => iso(p.date)).sort().pop() || today;
const urls = [[SITE + '/', today], [SITE + '/blog/', latest], ...POSTS.map((p) => [`${SITE}/blog/${p.slug}/`, iso(p.date)])];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`글 페이지 ${POSTS.length}개 → blog/{slug}/index.html, sitemap.xml 주소 ${urls.length}개`);
