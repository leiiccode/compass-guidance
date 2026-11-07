# COMPASS

Open `index.html` in a browser to use the site. All sections appear on one continuous, scrolling page. The original HTML file in Downloads also loads the CSS and JavaScript from this folder. No build step or external packages are required. The Location section embeds a Google Map and requires an internet connection.

The contact form uses Web3Forms' browser-side API client. Replace `PASTE_NEW_WEB3FORMS_ACCESS_KEY_HERE` in `app.js` with a newly generated Web3Forms access key. Web3Forms access keys are designed to be public in browser forms; restrict the key to your production domain in Web3Forms where available. The `api/contact.js` server function is retained temporarily but is not used by the current form.

## Deployment security

1. Since the previous Web3Forms key was committed to Git, rotate/revoke it in Web3Forms. Do not reuse the old key.
2. Put the newly generated access key in the marked field in `app.js`; this particular key is intended to be public. Never put private credentials (for example, account passwords or private API tokens) in browser code.
3. In Web3Forms, restrict the new key to your production domain where supported.
4. Keep GitHub and Vercel access restricted to trusted collaborators, enable two-factor authentication, and protect the production branch. These account permissions cannot be secured by changes to the website's frontend code.

## Project structure

- `index.html` — page structure and content
- `styles.css` — layout, colors, and responsive styles
- `app.js` — navigation, team profiles, and contact form behavior
- `assets/images/` - website images
