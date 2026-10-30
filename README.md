# Summer Mo — Portfolio

Portfolio site for **Summer Mo** (host, speaker, creative and youth facilitator), with a
password-protected editor at `/my-account` and a blog.

- Public site: Home, My Story, My Work, Projects, Impact, The Journey, Blog, Contact
- `/blog` lists all posts, `/blog/<post>` shows one post
- `/my-account` is where editors sign in to change text and images and write blog posts

Built with Next.js (App Router) and SQLite (via libSQL, so it can also run on Turso).

## First-time setup

```bash
npm install
npm run setup
```

`npm run setup` creates the database (`data/summer-mo.db`) and an admin account called `admin`,
then prints a **generated password once**. Save it in a password manager.

- Choose a different username: `npm run setup -- --user summer`
- Forgot the password: `npm run reset-password` (or `npm run reset-password -- --user summer`)
  prints a new one and signs out every device.
- After signing in, the **Account** tab lets you change the username and password.

## Run

```bash
npm run dev          # development, http://localhost:3000
npm run build && npm start   # production
```

## Editing the site

Go to `/my-account` and sign in.

| Tab | What it changes |
| --- | --- |
| Home | Roles line, headline, intro, portrait photo |
| My Story / My Work / Gallery / Projects / Journey | Add, edit, reorder, delete items and their images. Click **Save changes** to publish. |
| Blog | **New post** → title, summary, cover image, text → **Publish** (or **Save draft**). Drafts are only visible in the editor. |
| Account | Change username and password |

Images: JPG, PNG, WebP or GIF up to 10 MB. Blog text is plain text; leave an empty line between paragraphs.

## Where data lives

- Text, blog posts and accounts: SQLite database at `data/summer-mo.db`
- Uploaded images: `data/uploads/`

Back up the `data/` folder. It is git-ignored, so it never goes to GitHub.

## Hosting

The site needs a Node.js server (GitHub Pages can't run it).

- **A server with a permanent disk** (VPS, Railway or Render with a volume, Fly.io): works as is.
  Keep `data/` on the persistent disk.
- **Vercel**: its servers don't keep files, so use hosted storage instead:
  1. Create a Turso database and set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN=…`
  2. Add Vercel Blob to the project, which sets `BLOB_READ_WRITE_TOKEN` (images then go to Blob)
  3. Run `npm run setup` locally with those same variables in `.env.local` to create the admin account

See `.env.example` for all settings.

## Contact form
The form validates input but isn't connected to an inbox yet.
