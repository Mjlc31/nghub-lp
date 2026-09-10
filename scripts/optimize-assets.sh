#!/usr/bin/env bash
set -e

PUBLIC_DIR="./public"
TMP_DIR="./public/_tmp_opt"
mkdir -p "$TMP_DIR"

echo "===> Optimizing NG-*.jpg assets in $PUBLIC_DIR..."

for file in "$PUBLIC_DIR"/NG-*.jpg; do
  [ -f "$file" ] || continue
  filename=$(basename "$file")
  name="${filename%.*}"

  echo "Processing: $filename"

  # 1. Generate AVIF (<200KB, max dimension 1200px)
  /usr/bin/sips -Z 1200 -s format avif "$file" --out "$PUBLIC_DIR/$name.avif" > /dev/null 2>&1

  # 2. Generate Optimized JPEG (<200KB, max dimension 1200px)
  QUALITY=65
  if [ "$name" = "NG-873" ] || [ "$name" = "NG-149" ]; then
    QUALITY=60
  fi

  /usr/bin/sips -Z 1200 -s format jpeg -s formatOptions $QUALITY "$file" --out "$TMP_DIR/$filename" > /dev/null 2>&1

  # Check size, if still >= 200000 bytes, recompress with quality 55
  size=$(wc -c < "$TMP_DIR/$filename" | tr -d ' ')
  if [ "$size" -ge 200000 ]; then
    echo "  Re-compressing $filename with lower quality (was $size bytes)..."
    /usr/bin/sips -Z 1200 -s format jpeg -s formatOptions 55 "$file" --out "$TMP_DIR/$filename" > /dev/null 2>&1
  fi

  # Replace raw JPEG in-place
  mv "$TMP_DIR/$filename" "$file"
done

rm -rf "$TMP_DIR"
echo "===> Asset optimization complete. Verifying file sizes:"
ls -lh "$PUBLIC_DIR"/NG-*
