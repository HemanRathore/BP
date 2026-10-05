#!/usr/bin/env python3
"""
set-logo.py — install the official BP brand mark into the website.

WHY THIS EXISTS
    The artwork is supplied as one master image. A website needs it in several
    physical sizes (header, footer, browser tab, phone home screen). This
    script produces those sizes WITHOUT retouching the artwork: the master is
    archived byte-for-byte, and every other file is a straight proportional
    downscale. Nothing is cropped, recoloured, redrawn or sharpened.

USAGE
    python3 tools/set-logo.py path/to/logo.jpg

WHAT IT WRITES
    assets/img/bp-logo-master.<ext>   exact copy of your file, untouched
    assets/img/bp-logo-512.png        master size, also used for link previews
    assets/img/bp-logo-256.png        larger placements
    assets/img/bp-logo-192.png        header and footer mark (shown at 42px)
    assets/img/favicon-192.png        Android home screen
    assets/img/favicon-48.png         browser tab
    assets/img/favicon-32.png         browser tab (small)
    assets/img/apple-touch-icon.png   iPhone home screen

    The filenames never change, so no HTML or CSS edits are needed — the site
    simply starts using your artwork.

REQUIREMENTS
    ImageMagick (the `convert` command). Present on most Linux and macOS
    systems; on Windows, install ImageMagick and run from Git Bash.
"""

import hashlib
import os
import shutil
import subprocess
import sys

OUT_DIR = "assets/img"

# output name -> pixel size. All are square because the mark is square.
DERIVATIVES = [
    ("bp-logo-512.png", 512),
    ("bp-logo-256.png", 256),
    ("bp-logo-192.png", 192),
    ("favicon-192.png", 192),
    ("apple-touch-icon.png", 180),
    ("favicon-48.png", 48),
    ("favicon-32.png", 32),
]

SQUARE = (512, 512)


def die(msg):
    print("\n  ERROR: " + msg + "\n")
    sys.exit(1)


def run(cmd):
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    except FileNotFoundError:
        die("ImageMagick not found. Install it so the `convert` command works.")
    except subprocess.CalledProcessError as exc:
        die("convert failed:\n" + exc.stderr.decode("utf-8", "replace"))


def dimensions(path):
    """Read width/height with `identify`."""
    try:
        out = subprocess.run(["identify", "-format", "%w %h", path],
                             check=True, capture_output=True).stdout.decode()
        w, h = out.split()
        return int(w), int(h)
    except Exception:
        die("Could not read the image dimensions — is the file a valid image?")


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        die("Give the path to the logo image, e.g.\n"
            "  python3 tools/set-logo.py ~/Downloads/logobp.jpg")

    src = sys.argv[1]
    if not os.path.isfile(src):
        die("No such file: " + src)

    w, h = dimensions(src)
    print(f"\n  Source : {src}")
    print(f"  Size   : {w} x {h} px")

    if w != h:
        print(f"  NOTE   : the artwork is {w}x{h}, not square. It will be centred on a\n"
              f"           square canvas using its own edge colour, so no detail is cut off.")

    os.makedirs(OUT_DIR, exist_ok=True)

    # ---- 1. archive the master, byte for byte ----------------------------
    ext = os.path.splitext(src)[1].lower() or ".png"
    if ext == ".jpeg":
        ext = ".jpg"
    master = os.path.join(OUT_DIR, "bp-logo-master" + ext)
    shutil.copyfile(src, master)

    src_bytes = hashlib.sha256(open(src, "rb").read()).hexdigest()
    dst_bytes = hashlib.sha256(open(master, "rb").read()).hexdigest()
    if src_bytes != dst_bytes:
        die("The archived master does not match the source file.")
    print(f"  Master : {master}  (verified byte-identical)")
    print(f"           sha256 {src_bytes[:16]}…")

    # ---- 2. derive the web sizes ----------------------------------------
    print("\n  Derived sizes:")
    for name, size in DERIVATIVES:
        out_path = os.path.join(OUT_DIR, name)
        target = f"{size}x{size}"
        cmd = [
            "convert", src,
            "-resize", target,          # proportional downscale, never enlarges
            "-background", "black",     # only fills if the source is not square
            "-gravity", "center",
            "-extent", target,
            "-strip",                   # drop EXIF, keep the file small
            out_path,
        ]
        run(cmd)
        kb = os.path.getsize(out_path) / 1024
        print(f"    {name:<24} {target:<9} {kb:6.1f} KB")

    print("\n  Done. Refresh the site — the header, footer, browser tab and\n"
          "  phone home-screen icons all use the new artwork.\n")

    if w < 200:
        print("  WARNING: the source is smaller than 200px, so the larger sizes are\n"
              "           being upscaled and will look soft. Supply the biggest\n"
              "           original you have.\n")


if __name__ == "__main__":
    main()
