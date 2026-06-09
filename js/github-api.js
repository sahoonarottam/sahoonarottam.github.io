// Fetches blog posts from the GitHub Contents API and parses frontmatter + markdown.
// Works against any public repo without authentication (60 requests/hr per IP is plenty).

const cfg = window.SITE_CONFIG;
const API_BASE = `https://api.github.com/repos/${cfg.githubOwner}/${cfg.githubRepo}`;
const RAW_BASE = `https://raw.githubusercontent.com/${cfg.githubOwner}/${cfg.githubRepo}/${cfg.githubBranch}`;

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

function slugFromFilename(name) {
  return name.replace(/\.md$/i, '');
}

async function listPosts() {
  const url = `${API_BASE}/contents/${cfg.postsPath}?ref=${cfg.githubBranch}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const files = await res.json();
  const posts = await Promise.all(
    files
      .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
      .map(async (f) => {
        const raw = await fetch(`${RAW_BASE}/${cfg.postsPath}/${f.name}`).then((r) => r.text());
        const { meta, body } = parseFrontmatter(raw);
        return {
          slug: slugFromFilename(f.name),
          title: meta.title || slugFromFilename(f.name),
          date: meta.date || '',
          excerpt: meta.excerpt || body.slice(0, 180).replace(/[#*_>`]/g, '').trim() + '…',
          body,
          meta,
        };
      })
  );
  return posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

async function getPost(slug) {
  const raw = await fetch(`${RAW_BASE}/${cfg.postsPath}/${slug}.md`).then((r) => {
    if (!r.ok) throw new Error('Post not found');
    return r.text();
  });
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    body,
    meta,
  };
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

window.BlogAPI = { listPosts, getPost, formatDate };
