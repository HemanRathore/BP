# BP Enterprises — Website

A fast, mobile-first product website for **BP Enterprises**, packaging solutions supplier at
Kosi Kalan (Mathura) and Gurugram. White, editorial design. Every order and enquiry button
hands off to **WhatsApp** with the message already written out — the buyer only has to press send.

No build step, no database, no monthly platform fee. Plain HTML, CSS and JavaScript that can be
hosted free on GitHub Pages, Netlify, Vercel or any shared hosting with a cPanel file manager.

---

## 1. Quick start

Open `index.html` in a browser to view the site locally.

To run it the way it behaves online (recommended — some browsers restrict things on `file://`):

```bash
# from inside this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

To publish it, upload every file and folder in this directory to your hosting, keeping the
structure exactly as it is.

---

## 2. Editing the site — the two files that matter

You do **not** need to touch any HTML to run this site day to day. Almost everything lives in
two plain text files inside the `data/` folder.

### `data/site.config.js` — phone numbers, addresses, team, toggles

| What you want to change | Where to look |
|---|---|
| WhatsApp order number | `whatsapp.orders.number` |
| WhatsApp business / bulk number | `whatsapp.quotes.number` |
| Owner's number | `whatsapp.owner.number` |
| The greeting written into every WhatsApp message | `whatsappGreeting` |
| Email address | `contact.email` |
| Phone numbers shown in the header and footer | `contact.phones` |
| Office hours and reply promise | `contact.hours`, `contact.responseTime` |
| Any office or godown address, or its map link | `locations` |
| Team members shown on the About page | `team` |
| Client names in the scrolling strip | `clients` |
| The four numbers on the home page | `stats` |
| Show or hide prices | `catalogue.showPrices` |
| Say "Price on request" instead of rates | set `catalogue.showPrices` to `false` |
| Turn the floating WhatsApp button off | `features.floatingWhatsapp` |

### `data/products.js` — every product

Each product is one block between `{` and `},`. To add a product, copy an existing block,
paste it, and change the values. To remove one, delete its block. **Do not touch anything
outside the brackets.**

```js
{
  id: "3-ply-corrugated-box",   // unique code, lowercase, no spaces
  name: "3 Ply Corrugated Box", // shown on the card and in the WhatsApp message
  cat: "boxes",                 // must match a category id at the top of the file
  image: "assets/img/products/3ply-box.jpg",
  badges: ["Bestseller"],       // small labels on the photo — [] for none
  featured: true,               // true = also shown on the home page
  short: "One line shown on the card.",
  desc:  "Longer paragraph shown when the product is opened.",
  specs: { "Ply": "3 Ply (single wall)", "Paper GSM": "120 – 180 GSM" },
  sizes: "Any size from 4 × 4 × 4 in up to 24 × 18 × 18 in",
  print: "Plain, 1-colour or multi-colour flexo printing",
  moq:   "500 pcs",
  price: { from: 9, to: 32, unit: "per box", basis: "ex-godown" },
  search: "extra words people might type to find this"
}
```

Set `price: null` on a single product to show **"Price on request"** for that item only.

---

## 3. Adding product photos

1. Put the photo in `assets/img/products/`.
2. Name it something short and lowercase, e.g. `kraft-paper.jpg`.
3. Point the product's `image:` value at it.
4. Keep photos roughly **1200 × 900 px** (4:3) and under ~250 KB each.

**If a photo is missing or the file name is wrong, the site does not break.** A clean line
illustration is shown in its place with the words "Photo coming soon", so the layout always
looks finished. Fix the file name and the photo appears.

**Photo status:** 20 of the 21 products have a photograph. Only *Food-Grade Box
Assortment* is deliberately left without one, because it is a mixed range rather than a
single product — the site shows a clean line illustration for it by design.

If a product is ever left with no photo, or a filename is mistyped, the illustration appears
automatically and nothing breaks.

Drop a file with the right name into `assets/img/products/` and the illustration is replaced
automatically — no code change needed. Photograph items on a plain white or light surface in
daylight for the best match to the design.

---

## 4. How the WhatsApp ordering works

There are four places a buyer can start an order. All of them open WhatsApp with the message
already composed:

1. **Floating button** (bottom right, every page) — sends the general greeting.
2. **Per-product WhatsApp button** on each card — sends the product name, category and a request
   for rate, MOQ and delivery time.
3. **Enquiry list** — the buyer adds several products, sets quantities and adds a note per item.
   One tap sends a numbered list. This is saved in their browser, so it survives a page refresh.
   It is sent **from their device only** — the website itself stores nothing.
4. **Enquiry form** on the Contact page — name, phone, city, product and requirement are formatted
   into a WhatsApp message.

The number that receives all of them is `whatsapp.orders.number` in `data/site.config.js`.
Change it there and it updates on every page at once.

> **Important:** the number must be in full international format, digits only, no `+` and no spaces.
> `+91 74170 19146` becomes `"917417019146"`.

---

## 5. File map

```
.
├── index.html              Home page
├── products.html           Product catalogue (search, filters, sort)
├── about.html              Company profile, timeline, team, clients
├── contact.html            Contact details, enquiry form, locations
├── 404.html                Page-not-found page
│
├── data/                   ← EDIT THESE TWO FILES
│   ├── site.config.js         Numbers, addresses, team, prices on/off, security
│   └── products.js            The product catalogue
│
├── assets/                 What the website actually serves
│   ├── css/styles.min.css     Built — do not edit by hand
│   ├── js/app.min.js          Built — do not edit by hand
│   ├── js/layout.min.js       Built — do not edit by hand
│   ├── js/protect.min.js      Built — do not edit by hand
│   └── img/                   Logo, favicons, photographs
│
├── src/                    Readable source for the developer. NOT published.
│   ├── styles.css
│   ├── app.js
│   ├── layout.js
│   └── protect.js
│
├── tools/
│   ├── build.mjs           Minifies src/ into assets/
│   └── set-logo.py         Installs / replaces the brand mark
│
├── _headers                Security + caching headers (Netlify, Cloudflare)
├── _redirects              Blocks src/ and tools/ (Netlify, Cloudflare)
├── .htaccess               Same, for Apache / cPanel hosting
├── vercel.json             Same, for Vercel
├── package.json            Build tooling list
├── robots.txt              Search engine instructions
├── sitemap.xml             Page list for Google
└── site.webmanifest        "Add to home screen" settings for phones
```

### Why `src/` and `assets/` are separate

`assets/` holds only minified, hard-to-read copies of the code. `src/` holds the readable
versions with all the explanatory comments. Only `assets/` is published, so a visitor who
opens developer tools sees compressed code rather than the annotated original.

**If you never change the code, you can ignore `src/` completely.** It matters only when
someone edits the design, at which point:

```bash
npm install     # once — needs Node.js
npm run build   # recompiles src/ into assets/
```

`data/site.config.js` and `data/products.js` are deliberately **not** minified. Those are the
two files the business edits by hand, and compressing them would make this guide useless.

---

## 6. Going live checklist

- [ ] Put the real phone numbers and addresses into `data/site.config.js`
- [x] Email address set to `bpenterprises@gmail.com`
- [ ] Replace `bpentprises.in` with the real domain in `sitemap.xml`, `robots.txt` and the
      `<link rel="canonical">` / Open Graph tags in the four HTML files
- [ ] Cross-check every rate, MOQ and specification in `data/products.js`, or set
      `catalogue.showPrices` to `false` until the rates are confirmed
- [ ] Add the remaining product photos (section 3)
- [ ] Decide whether to show the GSTIN — put it in `gstin` in the config, or leave it `""` to hide
- [ ] Add the real founding year and volume figures to `stats` if the current ones need adjusting
- [ ] Test the WhatsApp buttons from a phone
- [ ] Submit `sitemap.xml` to Google Search Console

---

## 7. The brand mark

The logo is the ornate BP badge supplied by the business, exported at several sizes in
`assets/img/`.

**To install or replace the logo, run one command with the original artwork file:**

```bash
python3 tools/set-logo.py path/to/logobp.jpg
```

That script:

* archives your file **byte-for-byte** at `assets/img/bp-logo-master.jpg` — the artwork is
  never cropped, recoloured, redrawn or sharpened;
* produces every size the site needs (512, 256, 192, 48 and 32 px, plus the 180 px iPhone
  icon) by straight proportional downscaling;
* keeps the same filenames, so no HTML or CSS has to change;
* verifies the archived master is identical to your file, and warns you if the source is
  smaller than 200 px so the larger sizes would look soft.

It needs ImageMagick's `convert` command. Nothing else to configure — refresh the site
afterwards and the header, footer, browser tab and phone home-screen icons all update.

`data/site.config.js` -> `brand.logo` chooses which file the header and footer load; it
points at `assets/img/bp-logo-192.png` by default.

---

## 8. Protecting the site's code

**Read this first, because it matters:** this is a static website. Its code is sent to every
visitor's browser, so it can *never* be hidden completely. Anyone determined enough can read
it. What we have done is close all the easy routes, which stops casual copying.

### What is switched on

| Protection | Effect |
|---|---|
| Minified code | `assets/` holds compressed code with no comments |
| Sources kept out of the web root | `/src/` is not reachable on the live site |
| Right-click disabled | No context menu on page content |
| Developer-tool shortcuts | F12, Ctrl+Shift+I/J/C, Ctrl+U and Ctrl+S are blocked |
| Image protection | Images cannot be dragged out or saved by long-press |
| Console notice | A copyright line is printed in the browser console |
| Dev-tools notice | A dismissible copyright banner if developer tools are opened |
| Security headers | Anti-clickjacking, no MIME sniffing, referrer limits |

### What is deliberately left working

Copy and paste still work, and so does printing. Customers copy the phone number and address,
and purchase orders get printed — breaking those costs the business more than the protection
gains. Right-click is also left enabled on form fields (so people can paste) and on links (so
they can copy a product link to send to someone).

### Turning it off

`data/site.config.js` → `security`. Set `protectClient: false` to disable all of it at once,
or switch off any individual item.

### If a shortcut ever blocks something you need

It is all in `src/protect.js`, compiled into `assets/js/protect.min.js`. Edit the source, run
`npm run build`.

### The part that actually protects you

The server headers in `_headers`, `.htaccess` and `vercel.json` are real security, not a
deterrent. They stop other websites framing yours, stop browsers guessing file types, and
limit what the page is allowed to load.

---

## 9. Deploying

Upload the whole folder to your host, keeping the structure intact. Which host you use
determines which of the config files does the work — you do not need to edit any of them:

| Host | Reads | Notes |
|---|---|---|
| cPanel / shared hosting (Apache) | `.htaccess` | Most common in India. Upload and it just works. |
| Netlify | `_headers`, `_redirects` | Free, gives you a live URL in minutes |
| Cloudflare Pages | `_headers`, `_redirects` | Free |
| Vercel | `vercel.json` | Free |
| GitHub Pages | nothing | **Cannot block `/src/`** — see below |

**On GitHub Pages, publish `dist/` instead of the repository root.** GitHub Pages cannot block
any path, so `/src/` would be readable. Run:

```bash
npm run dist
```

That assembles a `dist/` folder containing only the files that should be public — no `src/`,
no `tools/`, no build config — and you publish that instead. `dist/` is generated, so it is
git-ignored and should never be committed.

---

## 10. Browser support & performance

Tested in Chrome, Safari, Firefox and Edge on desktop, tablet and mobile. Uses `IntersectionObserver`
for scroll animations, `localStorage` for the enquiry list (with an in-memory fallback if storage
is blocked) and progressive enhancement throughout — the product text is in the HTML, so the site
still reads correctly with JavaScript disabled.

No tracking scripts, no cookies, no third-party analytics and no external dependencies other than
the Google Fonts stylesheet. To go fully offline-capable, download the two font families into
`assets/fonts/` and swap the `<link>` tags for local `@font-face` rules in `styles.css`.
