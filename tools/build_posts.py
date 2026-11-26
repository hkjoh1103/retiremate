#!/usr/bin/env python3
"""블로그 원고(.md) → posts.js 변환기

사용법:  python3 tools/build_posts.py <원고 폴더>
결과:    posts.js (사이트 루트), 글 페이지 blog/{slug}/index.html, sitemap.xml 을 새로 씁니다.
         (글 페이지는 tools/render_pages.js가 만들어요. node가 필요해요.)

원고 약속 (README 기준)
- 맨 위 --- 사이 발행 정보(frontmatter)
- 본문 첫 줄 '# 제목', 그 다음 '**부제**' 한 줄
- '> **메이트 팁** …'  → 팁 상자
- '버튼: **문구** / 보조 문구' → 계산기 버튼
- '## 출처' 아래 목록 → 출처 상자
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 계산기 입력칸 이름(원고) → 계산기 코드 이름
FIELD = {
    '은퇴 나이': 'retireAge', '현재 나이': 'currentAge', '기대 수명': 'lifeExpectancy',
    '월 저축 금액': 'monthlySaving', '현재 자산': 'currentAssets', '월 소비 금액': 'monthlySpend',
    '수익률': 'returnRate', '인플레이션율': 'inflation',
}
ALIAS = {'ageRetire': 'retireAge'}  # 원고에 쓰인 다른 이름

# 계산기 화면 "먼저 읽어보세요"에 쓰는 대표 글 (입력칸 → 글)
GUIDE = {
    'retireAge': ('retirement-age-53', '은퇴 나이 참고'),
    'monthlySpend': ('retirement-living-cost', '월 소비 금액 참고'),
    'lifeExpectancy': ('how-long-to-plan-for', '기대 수명 참고'),
    'inflation': ('inflation-retirement', '인플레이션율 참고'),
    'currentAssets': ('net-worth-by-age', '현재 자산 참고'),
}
FEATURED = ['retirement-age-53', 'retirement-living-cost', 'retirement-wish-vs-reality', 'net-worth-by-age']


def inline(text):
    """마크다운 인라인(굵게, 링크) → 안전한 HTML"""
    out = html.escape(text, quote=True)
    out = re.sub(r'\[([^\]]+)\]\((https?://[^)\s]+)\)',
                 lambda m: f'<a href="{m.group(2)}" target="_blank" rel="noreferrer">{m.group(1)}</a>', out)
    out = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', out)
    return out


def parse_front(raw):
    meta = {}
    for line in raw.strip().splitlines():
        k, _, v = line.partition(':')
        v = v.strip()
        if v.startswith('[') and v.endswith(']'):
            v = [x.strip() for x in v[1:-1].split(',') if x.strip()]
        elif len(v) >= 2 and v[0] == v[-1] == '"':
            v = v[1:-1]
        meta[k.strip()] = v
    return meta


def parse_calculator(text):
    """'은퇴 나이 53세 (ageRetire=53)' → fields, search"""
    search = {}
    for k, v in re.findall(r'(\w+)=([\d.]+)', text):
        search[ALIAS.get(k, k)] = float(v) if '.' in v else int(v)
    head = re.sub(r'\(.*?\)', '', text)
    fields = []
    for part in head.split(','):
        part = re.sub(r'\s*\d.*$', '', part.strip())  # '은퇴 나이 53세' → '은퇴 나이'
        if part in FIELD and FIELD[part] not in fields:
            fields.append(FIELD[part])
    return fields, search


def strip_calc_marks(md):
    """원고의 '(계산)' 표시를 화면용으로 정리해요.
    본문: 표시를 지워요. 출처: '- (계산) …' 줄은 '- 계산식: …'으로 바꿔요.
    원고 파일은 그대로 두고, 화면에 나갈 때만 바뀌어요."""
    out, in_src = [], False
    for line in md.splitlines():
        if line.startswith('## '):
            in_src = line[3:].strip() == '출처'
        if in_src:
            line = re.sub(r'^(\s*[-*]\s+)\(계산\)은 리메이트가 발표 수치로 직접 계산한 값이에요\.\s*', r'\1', line)
            line = re.sub(r'^(\s*[-*]\s+)\(계산\)\s*', r'\1계산식: ', line)
        line = re.sub(r'\s*\(계산\)', '', line)
        out.append(line)
    return '\n'.join(out)


def parse_body(md):
    md = strip_calc_marks(md)
    lines = md.strip('\n').splitlines()
    title = subtitle = None
    blocks, sources, cta = [], [], None
    i, in_sources = 0, False

    def table(start):
        rows, j = [], start
        while j < len(lines) and lines[j].startswith('|'):
            cells = [c.strip() for c in lines[j].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-{3,}:?', c) for c in cells):
                rows.append([inline(c) for c in cells])
            j += 1
        return {'type': 'table', 'head': rows[0], 'rows': rows[1:]}, j

    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1; continue
        if line.startswith('# ') and title is None:
            title = line[2:].strip(); i += 1; continue
        m = re.fullmatch(r'\*\*(.+)\*\*', line.strip())
        if m and subtitle is None and title is not None and not blocks:
            subtitle = m.group(1); i += 1; continue
        if line.startswith('## '):
            h = line[3:].strip()
            in_sources = (h == '출처')
            if not in_sources:
                blocks.append({'type': 'h', 'html': inline(h)})
            i += 1; continue
        if in_sources:
            m = re.match(r'^(\s*)[-*]\s+(.*)', line)
            if m:
                item = inline(m.group(2))
                if m.group(1) and sources:
                    sources[-1].setdefault('sub', []).append(item)
                else:
                    sources.append({'html': item})
            else:
                sources.append({'html': inline(line.strip())})
            i += 1; continue
        if line.startswith('|'):
            b, i = table(i); blocks.append(b); continue
        if line.startswith('>'):
            text = line.lstrip('>').strip()
            m = re.match(r'\*\*(.+?)\*\*\s*(.*)', text)
            blocks.append({'type': 'note', 'title': m.group(1) if m else '메이트 팁',
                           'html': inline(m.group(2) if m else text)})
            i += 1; continue
        if line.startswith('버튼:'):
            m = re.match(r'버튼:\s*\*\*(.+?)\*\*\s*(?:/\s*(.+))?', line)
            cta = {'label': m.group(1).strip(), 'secondary': (m.group(2) or '').strip() or None}
            blocks.append({'type': 'cta'})
            i += 1; continue
        if re.match(r'^[-*]\s+', line):
            items = []
            while i < len(lines) and re.match(r'^[-*]\s+', lines[i]):
                items.append(inline(re.sub(r'^[-*]\s+', '', lines[i]).strip())); i += 1
            blocks.append({'type': 'ul', 'items': items}); continue
        if re.match(r'^\d+\.\s+', line):
            items = []
            while i < len(lines) and re.match(r'^\d+\.\s+', lines[i]):
                items.append(inline(re.sub(r'^\d+\.\s+', '', lines[i]).strip())); i += 1
            blocks.append({'type': 'ol', 'items': items}); continue
        # 문단: 빈 줄이 나올 때까지 이어 붙임
        para = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||>|[-*]\s|\d+\.\s|버튼:)', lines[i]):
            para.append(lines[i].strip()); i += 1
        blocks.append({'type': 'p', 'html': inline(' '.join(para))})
    return title, subtitle, blocks, sources, cta


def main(src):
    files = sorted(Path(src).glob('n*.md'), key=lambda p: int(re.match(r'n(\d+)', p.name).group(1)))
    posts, warnings = [], []
    for f in files:
        text = f.read_text(encoding='utf-8')
        m = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S)
        meta = parse_front(m.group(1))
        title, subtitle, blocks, sources, cta = parse_body(m.group(2))
        fields, search = parse_calculator(meta.get('calculator', ''))
        if title != meta['title']:
            warnings.append(f"{f.name}: 본문 제목과 title이 달라요")
        if cta:
            cta['fields'] = fields
            cta['search'] = search
        thumb_scene, _, thumb_text = meta.get('thumbnail', '').partition('/ 글자:')
        slug = meta['slug']
        post = {
            'id': meta['id'], 'slug': slug, 'title': meta['title'], 'subtitle': subtitle or '',
            'category': meta['category'], 'date': meta.get('checked', '').replace('-', '.'),
            'image': f'/assets/thumbs/{slug}.jpg',
            'thumbText': thumb_text.strip(), 'thumbScene': thumb_scene.strip(),
            'seoTitle': meta.get('seo_title'), 'seoDescription': re.sub(r'\s*\(계산\)', '', meta.get('seo_description') or '') or None,
            'keywords': meta.get('keywords', []),
            'body': blocks, 'sources': sources, 'cta': cta,
        }
        if slug in FEATURED:
            post['featured'] = True
        for field, (gslug, label) in GUIDE.items():
            if gslug == slug:
                post['field'], post['fieldLabel'] = field, label
        posts.append(post)

    order = ['은퇴 시기', '은퇴 자금', '은퇴 후 삶', '은퇴 후 건강']
    cats = [c for c in order if any(p['category'] == c for p in posts)]
    cats += sorted({p['category'] for p in posts} - set(cats))

    out = ROOT / 'posts.js'
    out.write_text(
        '/* 자동 생성 파일 — 직접 고치지 말고 원고(.md)를 고친 뒤\n'
        '   python3 tools/build_posts.py <원고 폴더> 로 다시 만드세요. */\n'
        f'const CATEGORIES = {json.dumps(cats, ensure_ascii=False)};\n'
        f'const POSTS = {json.dumps(posts, ensure_ascii=False, indent=1)};\n',
        encoding='utf-8')
    print(f'{len(posts)}편 → {out}')
    for w in warnings:
        print('주의:', w)
    subprocess.run(['node', str(ROOT / 'tools' / 'render_pages.js')], check=True)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
