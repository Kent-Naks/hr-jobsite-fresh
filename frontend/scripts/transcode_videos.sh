#!/usr/bin/env bash
set -euo pipefail

# Transcode all MP4 videos in frontend/public/videos to 720p MP4 and WebM
# and generate poster JPGs in frontend/public/videos/posters/
#
# Optional upload to S3-compatible CDN and optional deletion of originals.
#
# Environment variables:
#   UPLOAD_BUCKET         - If set, uploads files to this S3 bucket (e.g. my-bucket)
#   S3_ENDPOINT           - Optional S3 endpoint URL for R2 or other S3-compatible (e.g. https://<account>.r2.cloudflarestorage.com)
#   AWS_REGION            - Optional AWS region (used by aws CLI)
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY - used by aws CLI when provided
#   DELETE_AFTER_UPLOAD   - If set to 1, delete the original large MP4 after successful upload of derivatives
#   DRY_RUN_UPLOAD        - If set to 1, perform a dry-run (no upload / delete)
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

  # Optional upload step (S3-compatible)
  if [[ -n "${UPLOAD_BUCKET-}" ]]; then
    if [[ "${DRY_RUN_UPLOAD-0}" == "1" ]]; then
      echo "DRY RUN: would upload $mp4_out, $webm_out, $poster_out to bucket: $UPLOAD_BUCKET"
    else
      if ! command -v aws >/dev/null 2>&1; then
        echo "aws CLI not found; skipping upload. Install AWS CLI or set up rclone for other providers."
      else
        echo "Uploading generated files to bucket: $UPLOAD_BUCKET"
        # upload files under 'videos/' prefix in the bucket
        S3_OPTS=( )
        if [[ -n "${S3_ENDPOINT-}" ]]; then
          S3_OPTS+=(--endpoint-url "$S3_ENDPOINT")
        fi

        upload_ok=1
        for upf in "$mp4_out" "$webm_out" "$poster_out"; do
          target="s3://${UPLOAD_BUCKET}/videos/$(basename "$upf")"
          echo "Uploading $upf -> $target"
          if ! aws "${S3_OPTS[@]}" s3 cp "$upf" "$target" --acl public-read >/dev/null 2>&1; then
            echo "ERROR uploading $upf"
            upload_ok=0
            break
          fi
        done

        if [[ "$upload_ok" -eq 1 ]]; then
          echo "Verifying uploads..."
          verify_ok=1
          for upf in "$mp4_out" "$webm_out" "$poster_out"; do
            target_key="videos/$(basename "$upf")"
            if ! aws "${S3_OPTS[@]}" s3 ls "s3://${UPLOAD_BUCKET}/${target_key}" >/dev/null 2>&1; then
              echo "Missing on remote: ${target_key}"
              verify_ok=0
              break
            fi
          done

          if [[ "$verify_ok" -eq 1 ]]; then
            echo "Upload verified for $name"
            if [[ "${DELETE_AFTER_UPLOAD-0}" == "1" ]]; then
              echo "Deleting original file: $f"
              rm -f -- "$f"
            fi
          else
            echo "Upload verification failed for $name; originals preserved"
          fi
        else
          echo "Upload failed for $name; originals preserved"
        fi
      fi
    fi
  fi

done

echo "\nAll done. Generated files are in: $VIDEO_DIR"
