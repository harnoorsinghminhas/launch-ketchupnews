# ketchupnews.com

Static site served by GitHub Pages. The custom domain is set in `CNAME`; do not delete it.

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
