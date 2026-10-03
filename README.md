# Ketchup News (ketchupnews.com)

A static Founders' Preview site, served by GitHub Pages at https://ketchupnews.com/. No build step, no dependencies, no secrets.
Made 2026-10-03 at Harnoor's request (approved 19:16: "go with all your choices, make them go on the website"). The design is the
winner of this domain's design arena (F:/projects/ironman/design/parked-arenas-20261003/ketchupnews/winner/).

## Files
| File | What it is |
|---|---|
| `index.html` | The page. Meta tags, the content security policy (a `<meta>` tag, because Pages cannot set headers) and all copy. |
| `assets/styles.css` | All styling. The palette is the `:root` block at the top. |
| `assets/*.js` | Sign-up box (posts to the Signal API with `site` = `ketchupnews.com`) and the page's small helpers. Every node is set with `textContent`, no `innerHTML`. |
| `assets/logo.svg` | PLACEHOLDER text wordmark: the logo slot. |
| `assets/favicon.svg` | Placeholder browser icon (a letter on the accent colour). |
| `CNAME` | The custom domain GitHub Pages serves. Do not delete it. |

## How to swap in the real logo (one place)
The logo appears once, as a single image in `index.html`:

```html
<img class="brand-logo" id="logo" src="assets/logo.svg" width="167" height="38" alt="Ketchup News">
```

1. **Same file name (easiest).** Replace `assets/logo.svg` with your logo saved as an SVG. Nothing else changes.
2. **PNG or another name.** Put the file in `assets/` (for example `assets/logo.png`) and edit that one tag: set `src="assets/logo.png"`,
   keep `height="38"` (the CSS shows it 38px tall and keeps the ratio), and set `width` to 38 x logo width / logo height. Keep the `alt` text.
3. Make sure the logo reads on this page's background (dark). Commit and push to `main`; GitHub Pages republishes in about a minute.
4. Optional: replace `assets/favicon.svg` the same way.

## Notes
- The sign-up posts the visitor's email to the Signal API (`request-link`), which emails a confirmation link. The API must allow this
  page's origin (`https://ketchupnews.com`, and `https://www.ketchupnews.com`) in its CORS list (done 2026-10-03 on the dev API; it must also be in the infra template parameter SignalApiAllowedOrigins).
- The content-security policy is in a `<meta>` tag in `index.html`. It allows this site's own files, the Google Fonts the design uses, a POST to the Signal API
  and, for the 'This hour' brief, a read of the public hourly file on media.theagentsignal.com.
  If you add anything external, add it to that policy.
- Everything on the site is a preview; example and placeholder content is labelled "example".
