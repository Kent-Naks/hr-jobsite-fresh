#!/usr/bin/env bash
set -euo pipefail

# Transcode all MP4 videos in frontend/public/videos to 720p MP4 and WebM
# and generate poster JPGs in frontend/public/videos/posters/
#
# Usage: cd repo && bash frontend/scripts/transcode_videos.sh

VIDEO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../public/videos" && pwd)"
cd "$VIDEO_DIR"

mkdir -p posters

echo "Processing videos in: $VIDEO_DIR"

shopt -s nullglob
for f in *.mp4; do
  # skip already-generated 720p outputs
  name="${f%.*}"
  mp4_out="${name}-720.mp4"
  webm_out="${name}-720.webm"
  poster_out="posters/${name}.jpg"

  if [[ -f "$mp4_out" && -f "$webm_out" && -f "$poster_out" ]]; then
    echo "Skipping $f (outputs exist)"
    continue
  fi

  echo "\n=== Processing $f ==="

  if [[ ! -f "$mp4_out" ]]; then
    echo "Transcoding MP4 -> $mp4_out (H.264 720p)"
    ffmpeg -y -i "$f" -c:v libx264 -preset medium -crf 23 -vf "scale=-2:720" -c:a aac -b:a 128k "$mp4_out"
  else
    echo "MP4 output already exists: $mp4_out"
  fi

  if [[ ! -f "$webm_out" ]]; then
    echo "Transcoding WebM -> $webm_out (VP9 720p)"
    ffmpeg -y -i "$f" -c:v libvpx-vp9 -b:v 1M -vf "scale=-2:720" -c:a libopus -b:a 96k "$webm_out"
  else
    echo "WebM output already exists: $webm_out"
  fi

  if [[ ! -f "$poster_out" ]]; then
    echo "Generating poster -> $poster_out"
    mkdir -p posters
    ffmpeg -y -i "$f" -ss 00:00:01 -vframes 1 -q:v 2 "$poster_out"
  else
    echo "Poster already exists: $poster_out"
  fi

done

echo "\nAll done. Generated files are in: $VIDEO_DIR"
