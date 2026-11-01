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

### Deploy on Vercel

1. Go to **vercel.com/new**, import the GitHub repo **summer-mo**, and click **Deploy**.
   No settings are needed for this step. The public site goes live right away with the default text.
2. To turn on the editor at `/my-account`, open the project in Vercel:
   - **Storage → Create Database → Turso**, and connect it to the project.
     (Or create a database at turso.tech yourself and set `DATABASE_URL` and `DATABASE_AUTH_TOKEN`.)
   - **Storage → Create → Blob**, and connect it to the project. Uploaded photos are stored there.
   - **Settings → Environment Variables**: add `ADMIN_PASSWORD` (at least 10 characters).
     Optionally add `ADMIN_USERNAME`; it defaults to `admin`.
3. **Deployments → ⋯ → Redeploy**, so the new settings take effect.
4. Open `https://<your-project>.vercel.app/my-account` and sign in.

`ADMIN_PASSWORD` only creates the first account. Change the password later in the editor's
**Account** tab. You can then delete the variable from Vercel.

Large photos are resized in the browser before upload (Vercel accepts uploads up to 4.5 MB).

Forgot the password on Vercel? On your computer, run `vercel env pull .env.local`, then `npm run reset-password`.

### Other hosts

On a server with a permanent disk (VPS, Railway or Render with a volume, Fly.io), it works as is.
Run `npm run setup` once, and keep `data/` on the persistent disk.

See `.env.example` for all settings.

## Contact form
The form validates input but isn't connected to an inbox yet.
