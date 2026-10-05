/* ==========================================================================
   BP ENTERPRISES — BUILD STEP
   --------------------------------------------------------------------------
   Compiles src/ -> the minified files the website actually loads:

       src/styles.css   -> assets/css/styles.min.css
       src/app.js       -> assets/js/app.min.js
       src/layout.js    -> assets/js/layout.min.js
       src/protect.js   -> assets/js/protect.min.js

   The readable sources live in src/, which is OUTSIDE the folder that gets
   published. That matters: if the sources sat in assets/, a visitor could
   simply open /assets/js/app.js and read the whole commented original, and
   minifying would achieve nothing.

   Why this exists
     * Minified code is not readable at a glance, so the easy route to copying
       the site's internals is closed. (It is NOT real security — see the note
       at the top of assets/js/protect.js.)
     * Smaller files download faster, which is most of what makes the site
       feel quick on a phone on mobile data.

   What is deliberately NOT minified
     * data/site.config.js and data/products.js stay plain and commented,
       because those are the two files the business owner edits by hand.
       Minifying them would make the handover guide useless.

   Usage
       npm install      (once — needs Node.js)
       npm run build    compile src/ into assets/
       npm run dist     also assemble a clean dist/ folder to upload
   ========================================================================== */

import { readFile, writeFile, stat } from "node:fs/promises";
import { minify as minifyJs } from "terser";
import CleanCSS from "clean-css";

const JS_TARGETS = [
  ["src/app.js", "assets/js/app.min.js"],
  ["src/layout.js", "assets/js/layout.min.js"],
  ["src/protect.js", "assets/js/protect.min.js"],
];

const CSS_TARGETS = [["src/styles.css", "assets/css/styles.min.css"]];

const kb = (n) => (n / 1024).toFixed(1) + " KB";
const pct = (a, b) => Math.round((1 - b / a) * 100) + "% smaller";

let failures = 0;

/* -------------------------------------------------------------------------
   JavaScript
   ------------------------------------------------------------------------- */
for (const [src, out] of JS_TARGETS) {
  const code = await readFile(src, "utf8");

  const result = await minifyJs(
    { [src]: code },
    {
      ecma: 2018,
      compress: {
        passes: 3,
        drop_debugger: true,
        drop_console: false, // the console copyright notice must survive
        pure_getters: true,
      },
      mangle: { toplevel: true },
      format: { comments: false, ascii_only: true },
      sourceMap: false,
    }
  );

  if (!result.code) {
    console.error(`  FAIL  ${src} — terser produced no output`);
    failures++;
    continue;
  }

  /* A minifier that silently produces broken code is worse than no minifier.
     Parse the output back before writing it. */
  try {
    new Function(result.code);
  } catch (err) {
    console.error(`  FAIL  ${src} — minified output does not parse: ${err.message}`);
    failures++;
    continue;
  }

  await writeFile(out, result.code);
  console.log(`  ${out.padEnd(30)} ${kb(code.length).padStart(9)} -> ${kb(result.code.length).padStart(9)}   ${pct(code.length, result.code.length)}`);
}

/* -------------------------------------------------------------------------
   CSS
   ------------------------------------------------------------------------- */
for (const [src, out] of CSS_TARGETS) {
  const code = await readFile(src, "utf8");

  const result = await new CleanCSS({
    level: { 1: { specialComments: 0 }, 2: { restructureRules: false } },
  }).minify(code);

  if (result.errors && result.errors.length) {
    console.error(`  FAIL  ${src} — ${result.errors.join("; ")}`);
    failures++;
    continue;
  }

  await writeFile(out, result.styles);
  console.log(`  ${out.padEnd(30)} ${kb(code.length).padStart(9)} -> ${kb(result.styles.length).padStart(9)}   ${pct(code.length, result.styles.length)}`);
}

/* -------------------------------------------------------------------------
   Sanity check: the pages must reference the built files
   ------------------------------------------------------------------------- */
const pages = ["index.html", "products.html", "about.html", "contact.html", "404.html"];
console.log("");
for (const page of pages) {
  let html;
  try {
    html = await readFile(page, "utf8");
  } catch {
    continue;
  }
  const missing = [];
  for (const [, out] of [...JS_TARGETS, ...CSS_TARGETS]) {
    if (html.includes(out)) {
      try {
        await stat(out);
      } catch {
        missing.push(out);
      }
    }
  }
  if (missing.length) {
    console.error(`  FAIL  ${page} loads a file that does not exist: ${missing.join(", ")}`);
    failures++;
  }
}

/* -------------------------------------------------------------------------
   Optional: assemble dist/ — a folder containing ONLY the files that should
   be published.

   This is the bulletproof option. Most hosts can be told to block src/ and
   tools/ (see _redirects, .htaccess and vercel.json), but GitHub Pages cannot
   block anything, so on GitHub Pages you should publish dist/ instead of the
   repository root.
   ------------------------------------------------------------------------- */
if (process.argv.includes("--dist")) {
  const { cp, rm, mkdir } = await import("node:fs/promises");

  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  const SHIP = [
    "index.html", "products.html", "about.html", "contact.html", "404.html",
    "robots.txt", "sitemap.xml", "site.webmanifest",
    "_headers", "_redirects", ".htaccess",
    "assets", "data",
  ];

  for (const item of SHIP) {
    try {
      await cp(item, `dist/${item}`, { recursive: true });
    } catch {
      /* optional files may not exist; that is fine */
    }
  }

  /* The master logo is archived in the repository for reference, but the
     website itself uses the optimised copies, so it does not need to ship. */
  await rm("dist/assets/img/bp-logo-master.jpg", { force: true });

  console.log("  dist/ assembled — upload the contents of dist/ to your host.");
  console.log("  It contains no src/, no tools/ and no build config.\n");
}

console.log(
  failures
    ? `\n  ${failures} problem(s) — nothing was published.\n`
    : "\n  Build complete. All pages reference the built files.\n"
);

process.exit(failures ? 1 : 0);
