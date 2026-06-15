# Rishi Second Birthday Invite

Static invite website designed for GitHub Pages.

## What is included

- `index.html`: Rishi's personal website and time-capsule home page
- `archive.html`: archived page index for past events and milestones
- `archive-rishi-turns-two.html`: archived second birthday invitation
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

### Google Apps Script + Google Sheets setup

This keeps the custom RSVP form and stores responses in a Google Sheet.

1. Create a new Google Sheet, for example `Rishi Birthday RSVPs`.
2. In the Sheet, open `Extensions` -> `Apps Script`.
3. Replace the default Apps Script code with the contents of
   `google-apps-script/Code.gs` from this repo.
4. Optional but recommended: set `SHARED_TOKEN` in `Code.gs` to a private random
   value, such as `rishi-party-2026`.
5. Click `Deploy` -> `New deployment`.
6. Select type `Web app`.
7. Set `Execute as` to `Me`.
8. Set `Who has access` to `Anyone`.
9. Click `Deploy`, approve permissions, and copy the web app URL ending in
   `/exec`.
10. Update `settings.js`:

```js
window.RISHI_INVITE_CONFIG = {
  storageKey: "rishi-birthday-rsvps-v2",
  rsvpPostUrl: "YOUR_WEB_APP_EXEC_URL",
  trackerDataUrl: "YOUR_WEB_APP_EXEC_URL",
  submitMode: "remote",
  remoteProvider: "googleAppsScript",
  rsvpToken: "MATCH_THE_SHARED_TOKEN_OR_LEAVE_EMPTY"
};
```

11. Commit and push the updated `settings.js`.
12. Submit one test RSVP from the published invite.
13. Open the Google Sheet and confirm a row appears in the `RSVPs` tab.
14. Open `tracker.html` on the published site and confirm the response appears.

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
