# COMPASS

Open `index.html` in a browser to use the site. All sections appear on one continuous, scrolling page. The original HTML file in Downloads also loads the CSS and JavaScript from this folder. No build step or external packages are required. The Location section embeds a Google Map and requires an internet connection.

The contact form submits to the Vercel serverless function in `api/contact.js`, which forwards messages to Web3Forms. The Web3Forms access key is read from the `WEB3FORMS_ACCESS_KEY` environment variable and is not included in the browser code.

## Deployment security

1. Since the previous Web3Forms key was committed to Git, rotate/revoke it in Web3Forms. Do not reuse the exposed key.
2. In Vercel, open the project's **Settings → Environment Variables** and add `WEB3FORMS_ACCESS_KEY` with the newly generated key. Enable it for the production environment (and preview/development only if needed), then redeploy. Never put this value in `app.js`, a committed `.env` file, or other public files.
3. In Web3Forms, restrict the new key to your production domain where supported.
4. Keep GitHub and Vercel access restricted to trusted collaborators, enable two-factor authentication, and protect the production branch. These account permissions cannot be secured by changes to the website's frontend code.

## Project structure

- `index.html` — page structure and content
- `styles.css` — layout, colors, and responsive styles
- `app.js` — navigation, team profiles, and contact form behavior
- `assets/images/` - website images
