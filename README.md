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

Current photos still to be supplied (the site is showing illustrations for these):

| File name | Product |
|---|---|
| `partition.jpg` | Corrugated Partitions & Dividers |
| `corrugated-roll.jpg` | Corrugated Roll |
| `corrugated-sheet.jpg` | Corrugated Sheets |
| `kraft-paper.jpg` | Kraft Paper |
| `duplex-board.jpg` | Duplex Board |
| `paper-bags.jpg` | Kraft Paper Bags |
| `poly-bags.jpg` | Poly Bags & Pouches |
| `stretch-film.jpg` | Stretch Film |
| `bubble-roll.jpg` | Bubble Roll & Pouches |
| `bopp-tape.jpg` | BOPP Self-Adhesive Tape |
| `pallets.jpg` | Wooden Pallets |
| `wooden.jpg` | Wooden Cases & Crates |

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
├── data/
│   ├── site.config.js      ← EDIT THIS: numbers, addresses, team, toggles
│   └── products.js         ← EDIT THIS: the product catalogue
├── assets/
│   ├── css/styles.css      All styling (design tokens at the top)
│   ├── js/
│   │   ├── layout.js       Header, footer and floating UI (shared by all pages)
│   │   └── app.js          Catalogue, filters, enquiry list, WhatsApp hand-offs
│   └── img/
│       ├── bp-logo-512.png Master brand mark (the ornate BP badge)
│       ├── bp-logo-256.png Header / footer mark
│       ├── bp-logo-192.png Small mark used in the site header
│       ├── favicon-32.png  Browser tab icon
│       ├── favicon-192.png Android home-screen icon
│       ├── apple-touch-icon.png  iPhone home-screen icon
│       ├── hero.jpg        Home page hero image
│       ├── facility.jpg    About page facility image
│       └── products/       Product photography
├── tools/
│   └── set-logo.py         Installs / replaces the brand mark at every size
├── robots.txt              Search engine instructions
├── sitemap.xml             Page list for Google
└── site.webmanifest        "Add to home screen" settings for phones
```

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

## 8. Browser support & performance

Tested in Chrome, Safari, Firefox and Edge on desktop, tablet and mobile. Uses `IntersectionObserver`
for scroll animations, `localStorage` for the enquiry list (with an in-memory fallback if storage
is blocked) and progressive enhancement throughout — the product text is in the HTML, so the site
still reads correctly with JavaScript disabled.

No tracking scripts, no cookies, no third-party analytics and no external dependencies other than
the Google Fonts stylesheet. To go fully offline-capable, download the two font families into
`assets/fonts/` and swap the `<link>` tags for local `@font-face` rules in `styles.css`.
