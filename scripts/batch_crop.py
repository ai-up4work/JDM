import re
import numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage

INPUT_DIR  = Path("case_images")
OUTPUT_DIR = Path("case_images_cropped")

def detect_bg_color(data):
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    corners = [data[0,0], data[0,-1], data[-1,0], data[-1,-1]]
    avg = np.mean(corners, axis=0)
    if avg[0] < 30 and avg[1] < 30 and avg[2] < 30:
        return "black"
    return "white"

def crop_tight(img):
    data = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    bg = detect_bg_color(data)

    if bg == "black":
        is_bg = (r < 15) & (g < 15) & (b < 15)
    else:
        is_bg = (r > 245) & (g > 245) & (b > 245)

    # Flood fill from corners to get only outer background
    labeled, _ = ndimage.label(is_bg)
    w, h = img.size
    corner_labels = set()
    for cy, cx in [(0,0),(0,w-1),(h-1,0),(h-1,w-1)]:
        corner_labels.add(int(labeled[cy, cx]))
    corner_labels.discard(0)
    outer_bg = np.isin(labeled, list(corner_labels))

    # Bounding box of non-background pixels
    is_content = ~outer_bg
    rows = np.any(is_content, axis=1)
    cols = np.any(is_content, axis=0)
    if not rows.any() or not cols.any():
        return img
    row_min, row_max = np.where(rows)[0][[0,-1]]
    col_min, col_max = np.where(cols)[0][[0,-1]]

    return img.crop((col_min, row_min, col_max+1, row_max+1))

def main():
    print("=" * 55)
    print(" AKO Digital Mall — Batch Crop Case Images")
    print("=" * 55)

    if not INPUT_DIR.exists():
        print(f"Input folder not found: {INPUT_DIR.resolve()}")
        print("Run from E:/Business/up4work/JDM/")
        return

    exts   = {".jpg", ".jpeg", ".png", ".webp"}
    images = [f for f in INPUT_DIR.rglob("*") if f.suffix.lower() in exts]

    if not images:
        print(f"No images found in {INPUT_DIR.resolve()}")
        return

    print(f"Found {len(images)} images\n")

    success = 0
    failed  = []

    for img_path in sorted(images):
        relative = img_path.relative_to(INPUT_DIR)
        out_path = OUTPUT_DIR / relative.parent / (relative.stem + ".png")

        if out_path.exists():
            print(f"  [skip] {relative}")
            continue

        try:
            img     = Image.open(img_path)
            orig_w, orig_h = img.size
            cropped = crop_tight(img)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            cropped.save(out_path, "PNG")
            print(f"  [ok]   {relative}  {orig_w}x{orig_h} -> {cropped.width}x{cropped.height}")
            success += 1
        except Exception as e:
            print(f"  [err]  {relative} - {e}")
            failed.append(str(relative))

    print("\n" + "=" * 55)
    print(f"Done! {success}/{len(images)} images cropped.")
    print(f"Saved to: {OUTPUT_DIR.resolve()}")

    if failed:
        print(f"\nFailed ({len(failed)}):")
        for f in failed:
            print(f"  - {f}")

    print("\nFolder structure:")
    for brand in sorted(OUTPUT_DIR.iterdir()):
        if not brand.is_dir():
            continue
        print(f"\n  {brand.name}/")
        for model in sorted(brand.iterdir()):
            if model.is_dir():
                pngs = list(model.glob("*.png"))
                print(f"    {model.name}/ - {len(pngs)} images")

if __name__ == "__main__":
    main()