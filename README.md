# Rishi Second Birthday Invite

Static invite website designed for GitHub Pages.

## What is included

- `index.html`: the public-facing invite page
- `tracker.html`: a simple RSVP tracker dashboard
- `styles.css`: the visual design
- `app.js`: RSVP form logic and tracker rendering
- `settings.js`: configuration for local mode or a real RSVP endpoint

## Photo setup

The site currently includes placeholder artwork here:

- `assets/photos/rishi-1.svg`
- `assets/photos/rishi-2.svg`
- `assets/photos/rishi-3.svg`

To use real photos, either:

- replace those files with your own images and keep the same filenames, or
- update the image paths in `index.html`

## RSVP tracking

GitHub Pages is static, so it cannot store RSVPs by itself.

This project supports two approaches:

1. Local demo mode
   - Default behavior
   - Saves RSVPs in the browser using `localStorage`
   - Useful for previewing the UX, but not for real guest collection

2. Remote mode
   - Update `settings.js`
   - Set `submitMode` to `"remote"`
   - Set `rsvpPostUrl` to a form endpoint
   - Optionally set `trackerDataUrl` to a JSON endpoint for the tracker page

Recommended backend options for GitHub Pages:

- Google Apps Script + Google Sheets
- Formspree
- Supabase edge function + table

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the `main` branch and `/root`.
5. Save and wait for the Pages URL.

## Local preview

Use either option from the project folder:

```bash
./serve.sh
```

or:

```bash
npm start
```

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/tracker.html`

## Content to customize before sharing

- Update the event date, time, and address in `index.html`
- Replace placeholder contact guidance in the details/footer
- Add real photos into `assets/photos/`
- Connect a real RSVP endpoint in `settings.js`
