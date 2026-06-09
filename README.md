# sahoonarottam.github.io

The personal website and writing space of **Dr. Narottam Sahoo** — Former
Advisor &amp; Member Secretary, Gujarat Council on Science &amp; Technology
(GUJCOST); Senior Scientist, Gujarat Science City.

The site is a fully static set of HTML/CSS/JS files designed to be hosted on
GitHub Pages. There is no build step. Blog posts are plain Markdown files in
`content/posts/`, fetched live from the GitHub API and rendered in the
browser, so a new post appears on the live site within seconds of being
published — no rebuild required.

A small content-management interface lives at `/admin/`, powered by
[Decap CMS](https://decapcms.org/). Once set up, Dr. Sahoo can sign in with
GitHub, write a new post in a clean WYSIWYG editor, click **Publish**, and
the post appears on the website automatically.

---

## Site layout

```
.
├── index.html              ← home (bio, work, recent writings, contact)
├── blog.html               ← all writings
├── post.html               ← single post viewer (reads ?slug= from URL)
├── admin/
│   ├── index.html          ← Decap CMS entry point
│   └── config.yml          ← collections + GitHub backend config
├── content/
│   └── posts/
│       └── 2026-06-07-welcome.md   ← one Markdown file per post
├── css/styles.css
├── js/
│   ├── config.js           ← GitHub owner/repo names (edit before deploy)
│   └── github-api.js       ← fetches & parses posts via GitHub API
├── images/                 ← static images + uploads/
├── .nojekyll               ← tells GitHub Pages to skip Jekyll
└── README.md
```

---

## Deploying to GitHub Pages — one-time setup

Below is the simplest path. Each step is short. None of it requires any
local tooling.

### 1. Push this repo to GitHub

Create a new repository on GitHub (any name works, but
`<username>.github.io` gives you the prettiest URL). Push everything in
this folder to `main`.

### 2. Turn on GitHub Pages

In the repo on github.com:

- **Settings → Pages**
- **Source**: *Deploy from a branch*
- **Branch**: `main`, folder `/ (root)`
- Click **Save**

Within a minute the site will be live at
`https://<username>.github.io/` (or `https://<username>.github.io/<repo>/`
if you used a non-special repo name).

### 3. Tell the site which repo it lives in

Open `js/config.js` and update the first two lines to match your repo:

```js
githubOwner: 'sahoonarottam',     // your GitHub username
githubRepo:  'sahoonarottam',     // your repo name
```

Open `admin/config.yml` and update the `repo:` line in the same way:

```yaml
backend:
  name: github
  repo: <your-username>/<your-repo>
  branch: main
```

Commit and push.

---

## Setting up the CMS (one-time, ~15 min)

The `/admin/` page lets Dr. Sahoo sign in with his GitHub account and write
posts in a rich text editor. Behind the scenes, Decap CMS uses the GitHub
API to save new posts as Markdown files in `content/posts/`.

GitHub requires a tiny OAuth proxy in between (this is a free, one-time
setup). Here is the easiest path using [Render.com](https://render.com)'s
free tier.

### Step A — Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: `Dr Narottam Sahoo — CMS`
   - **Homepage URL**: `https://<username>.github.io`
   - **Authorization callback URL**: (leave blank for now — you will fill
     it in after Step B)
3. Click **Register application**. Keep this tab open — you will need the
   **Client ID** and **Client Secret** in Step B.

### Step B — Deploy the OAuth proxy (free)

1. Go to <https://render.com> and sign in with GitHub.
2. Click **New → Web Service** and connect to the public repository
   [`decaporg/decap-server`](https://github.com/decaporg/decap-server)
   (or fork it to your account first).
3. Render settings:
   - **Runtime**: Node
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Instance type**: Free
4. Under **Environment**, add:
   - `OAUTH_CLIENT_ID` &nbsp;= the Client ID from Step A
   - `OAUTH_CLIENT_SECRET` = the Client Secret from Step A
   - `ORIGIN` &nbsp;= `https://<username>.github.io`
5. Click **Create Web Service**. After a minute you will get a URL like
   `https://decap-server-xxxx.onrender.com`. Copy it.

### Step C — Wire the pieces together

1. Go back to the GitHub OAuth App (Step A) and set the
   **Authorization callback URL** to:
   `https://decap-server-xxxx.onrender.com/callback`
2. Open `admin/config.yml` in this repo and update the `base_url`:
   ```yaml
   backend:
     name: github
     repo: <username>/<repo>
     branch: main
     base_url: https://decap-server-xxxx.onrender.com
     auth_endpoint: /auth
   ```
3. Commit and push.

That is it. Visit `https://<username>.github.io/admin/`, click **Login with
GitHub**, and you are in.

---

## Writing a post (the everyday flow)

1. Visit `https://<username>.github.io/admin/`.
2. Sign in with GitHub (only the first time on each device).
3. Click **Writings → New Post**.
4. Fill in the title, pick a date, write the body in the rich editor (or
   paste from Word — formatting is preserved).
5. Click **Publish → Publish now**.
6. Within ~30 seconds the post is live at
   `https://<username>.github.io/blog.html`. No further action needed.

To edit or delete an existing post, open **Writings**, click the post, edit
or use the **Delete** button at the bottom.

---

## Running locally (optional)

If you ever want to preview changes before pushing, any tiny static server
will do. From this folder:

```bash
# Python 3 (already on macOS)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>. The `/admin/` page will not be able to
save posts locally (it needs the OAuth proxy and a real repo), but the
public pages — home, blog, post — all work.

---

## Credits

- Design &amp; build: hand-written HTML/CSS, no framework.
- Markdown rendering: [marked](https://marked.js.org/) +
  [DOMPurify](https://github.com/cure53/DOMPurify).
- CMS: [Decap CMS](https://decapcms.org/) (open-source, MIT).
- Fonts: Cormorant Garamond + Inter, served from Google Fonts.
