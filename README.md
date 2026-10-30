# Summer Mo — Portfolio

A single-page portfolio for **Summer Mo** (host, speaker, creative and youth facilitator).

- Sections: Home, My Story, My Work, My Projects, My Impact, The Journey, Contact
- Smooth scroll animations, sharp-edged Apple-style layout
- No build step: just `index.html` (fonts load from Google Fonts)

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy
Push to GitHub, then go to **Settings → Pages → Deploy from branch → main / root**.

## Editing content
All text lives in the `DEFAULTS` object near the top of the `<script>` in `index.html`:
hero text, story chapters, work crafts, projects and journey milestones.
To add images, put files in an `images/` folder and change the `img()` helper
(or set an image field to a path such as `images/portrait.jpg`).

> The in-page **Edit site** panel and image uploads only work in the hosted Claude
> artifact version, which provides storage. On GitHub Pages the site shows
> the content written in `DEFAULTS`.

## Contact form
The form validates input but isn't connected to an inbox. Hook it up with a
service such as Formspree by setting the form's `action` and removing the
`preventDefault()` handler.
