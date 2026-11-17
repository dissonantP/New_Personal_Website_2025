This is Max's personal website, live at https://maxpleaner.com.

It is plain static HTML and CSS with no build step and no dependencies: `site/index.html`, `site/style.css` and the Topaz font in `site/fonts/`. Keep it that way; don't add a framework, bundler or package.json.

The whole page is one plain-text `<pre>`. Section headings are `<strong>` and links are ordinary `<a>` tags.

Pushing to `main` deploys `site/` to the `gh-pages` branch with GitHub Actions (`.github/workflows/deploy.yml`).

Preview locally with any static server pointed at `site/`, e.g. `python3 -m http.server -d site`.
