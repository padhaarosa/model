# Model Showcase & Booking Platform

Welcome to the **Model Showcase & Booking Platform**. This website is a static, client‑side application designed to display a curated list of professional models and allow visitors to view individual profiles and contact them directly. It includes an age‑confirmation gate, responsive gallery, and dynamic profile pages powered entirely by JavaScript.

## How to Run

1. **Download or clone** the project folder.
2. Open `index.html` in any modern web browser. The site runs completely in the browser and does not require a server.
3. On first visit you’ll be asked to confirm that you are over 18 years old and that you accept the site’s terms and conditions. Accepting stores a flag in `localStorage` so you won’t be prompted again.

## Adding or Editing Models

All model data is defined in two places for convenience:

1. **`data/models.js`** – A JavaScript file that assigns the array of models to `window.modelsData`. Editing this file is the most reliable way to add models, because it avoids browser restrictions on reading local JSON files.
2. **`data/models.json`** – A pure JSON version of the same data. If you prefer working with JSON, you can edit this file instead, but note that some browsers may block `fetch()` when the site is opened directly from the file system. In that case, the app will fall back to using `models.js`.

Each entry must follow the structure below:

```json
{
  "name": "Model Name",
  "slug": "model-name",
  "age": 25,
  "bio": "Short biography text…",
  "tags": ["tag1", "tag2"],
  "services": ["Service A", "Service B"],
  "locations": ["City 1", "City 2"],
  "phone": "+910000000000",
  "whatsapp": "+910000000000",
  "images": ["modelname1.webp", "modelname2.webp"],
  "rating": 4.5
}
```

**Important:**

- The `slug` must be unique and should be URL‑safe (lowercase letters, numbers and hyphens only). It is used in the profile page URL: `profile.html?slug=<slug>`.
- The `images` array should list the filenames of the model’s images, in the order you’d like them to appear in the slider. Place these image files in the `images/` directory.
- You do **not** need to manually create an HTML page for each model. When you click a model in the gallery, the site uses `profile.html` and reads from `models.js`/`models.json` at run time.

After editing `models.json` and adding your images, simply refresh the page—no build step is required.

## Image Guidelines

To keep the site performant on mobile devices while preserving quality:

- Use the **WebP** image format when possible. It offers excellent compression with high quality.
- Recommended resolution is **600×800 pixels** (portrait orientation). Larger images are downscaled automatically, but oversized files slow down page load.
- Maintain a consistent aspect ratio (e.g., 3:4) across all images for a harmonious gallery and slider.
- Save images with a reasonable quality setting (around 80–85%) to balance quality and file size.
- Place your images in the `images/` directory and reference them from `models.json`.

## Structure

- `index.html` – Home page with the gallery and age gate.
- `profile.html` – Dynamic profile template that loads a model’s data based on the `slug` query parameter.
- `data/models.json` – Configuration file for all models.
- `images/` – Contains WebP images for each model.
- `js/main.js` – Core JavaScript handling age confirmation, gallery rendering, dynamic profile rendering, and slider functionality (including swipe on mobile).
- `css/style.css` – Shared styles for the entire site.
- `about.html`, `terms.html`, `dmca.html` – Informational pages linked from the header and footer.
- `robots.txt` and `sitemap.xml` – Basic SEO files.

## End‑to‑End Flow

1. The visitor loads `index.html` and, if not previously confirmed, is shown the age gate.
2. Once confirmed, the gallery is populated from `data/models.json`. Each card displays the model’s name and rating and links to `profile.html?slug=<slug>`.
3. On the profile page, JavaScript reads the `slug` parameter, finds the matching model in `models.json`, and renders the slider, contact buttons, and other details dynamically.
4. The slider auto‑plays but also supports **swipe gestures** on touch devices and next/previous buttons on all devices.
5. The site header and footer remain consistent across pages, with links to **About Us**, **Terms & Conditions**, and **DMCA**. The footer sticks to the bottom of the viewport even when content is short.

## Notes

- This project is built without a backend. For real‑world deployment, you may want to integrate a server or headless CMS to manage model data more conveniently.
- For local testing on Chrome or Firefox, you may need to serve the files via a simple web server (e.g. `python3 -m http.server`) because some browsers restrict `fetch()` from `file://` URLs. The JavaScript falls back to embedded data for offline use.

Feel free to customize the styles and expand the functionality as needed!