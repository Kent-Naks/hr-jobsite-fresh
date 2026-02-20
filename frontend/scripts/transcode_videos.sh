#!/usr/bin/env bash
set -euo pipefail

# Transcode all MP4 videos in frontend/public/videos to 720p MP4 and WebM
# and generate poster JPGs in frontend/public/videos/posters/
#
# Enhanced features:
#  - optional upload to S3 (CDN) after transcode
#  - optional delete of original large MP4s after successful upload
#  - can write NEXT_PUBLIC_VIDEO_BASE_URL to frontend/.env (local)
#
# Usage examples:
#  bash frontend/scripts/transcode_videos.sh                      # transcode only
#  bash frontend/scripts/transcode_videos.sh --upload-s3 --s3-bucket my-bucket --s3-prefix videos --set-env
#  bash frontend/scripts/transcode_videos.sh --upload-s3 --s3-bucket my-bucket --s3-prefix videos --delete-originals --cdn-base https://cdn.example.com/videos

VIDEO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../public/videos" && pwd)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.. && pwd)"

UPLOAD_S3=false
S3_BUCKET=""
S3_PREFIX=""
DELETE_ORIGINALS=false
SET_ENV=false
CDN_BASE=""

print_usage() {
  cat <<'USAGE'
Usage: transcode_videos.sh [options]

Options:
  --upload-s3            Upload generated files to S3 (requires --s3-bucket)
  --s3-bucket BUCKET     The S3 bucket name (required when --upload-s3)
  --s3-prefix PREFIX     Optional prefix/key prefix in the bucket (default: '')
  --delete-originals     Delete original MP4 files after successful upload
  --set-env              Write NEXT_PUBLIC_VIDEO_BASE_URL to frontend/.env
  --cdn-base URL         Explicit CDN base URL to set (overrides inferred S3 URL)
  --help                 Print this help

Examples:
  bash frontend/scripts/transcode_videos.sh --upload-s3 --s3-bucket my-bucket --s3-prefix videos --set-env
  bash frontend/scripts/transcode_videos.sh --delete-originals
USAGE
}

# simple long-arg parsing
while [[ $# -gt 0 ]]; do
  case "$1" in
    --upload-s3)
      UPLOAD_S3=true; shift ;;
    --s3-bucket)
      S3_BUCKET="$2"; shift 2 ;;
    --s3-prefix)
      S3_PREFIX="$2"; shift 2 ;;
    --delete-originals)
      DELETE_ORIGINALS=true; shift ;;
    --set-env)
      SET_ENV=true; shift ;;
    --cdn-base)
      CDN_BASE="$2"; shift 2 ;;
    --help)
      print_usage; exit 0 ;;
    *)
      echo "Unknown arg: $1"; print_usage; exit 1 ;;
  esac
done

if $UPLOAD_S3 && [[ -z "$S3_BUCKET" ]]; then
  echo "--upload-s3 requires --s3-bucket <bucket>"
  exit 1
fi

if $UPLOAD_S3; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "aws CLI not found; install and configure AWS credentials to use --upload-s3"
    exit 1
  fi
fi

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

  # Upload to S3 (if requested)
  if $UPLOAD_S3; then
    key_prefix="${S3_PREFIX#/}" # strip leading slash
    uploaded_ok=true

    for artifact in "$mp4_out" "$webm_out" "$poster_out"; do
      if [[ ! -f "$artifact" ]]; then
        echo "Skipping upload for missing artifact: $artifact"
        continue
      fi

      key_path="${key_prefix:+${key_prefix}/}${artifact}"
      echo "Uploading $artifact -> s3://$S3_BUCKET/$key_path"
      aws s3 cp --acl public-read "$artifact" "s3://$S3_BUCKET/$key_path"

      # verify upload via head-object
      if aws s3api head-object --bucket "$S3_BUCKET" --key "$key_path" >/dev/null 2>&1; then
        echo "Uploaded and verified: $artifact"
      else
        echo "Upload verification failed for: $artifact"
        uploaded_ok=false
        break
      fi
    done

    if $uploaded_ok; then
      echo "All artifacts uploaded for $f"

      # Optional: delete original large file after successful upload
      if $DELETE_ORIGINALS; then
        echo "Deleting original file: $f"
        rm -v -- "$f"
      fi

      # Prepare CDN base URL if requested
      if [[ -n "$CDN_BASE" ]]; then
        computed_cdn="$CDN_BASE"
      else
        # default to S3 public URL (works for standard S3 public buckets)
        computed_cdn="https://${S3_BUCKET}.s3.amazonaws.com/${S3_PREFIX#/}";
        # trim trailing slash
        computed_cdn="${computed_cdn%/}"
      fi

      if $SET_ENV; then
        env_file="$REPO_ROOT/frontend/.env"
        if [[ -f "$env_file" ]]; then
          # replace or add NEXT_PUBLIC_VIDEO_BASE_URL
          if grep -q '^NEXT_PUBLIC_VIDEO_BASE_URL=' "$env_file"; then
            sed -i.bak "s|^NEXT_PUBLIC_VIDEO_BASE_URL=.*|NEXT_PUBLIC_VIDEO_BASE_URL=${computed_cdn}|" "$env_file"
          else
            echo "NEXT_PUBLIC_VIDEO_BASE_URL=${computed_cdn}" >> "$env_file"
          fi
          echo "Updated $env_file -> NEXT_PUBLIC_VIDEO_BASE_URL=${computed_cdn}"
        else
          # create .env if missing
          echo "NEXT_PUBLIC_VIDEO_BASE_URL=${computed_cdn}" > "$env_file"
          echo "Created $env_file with NEXT_PUBLIC_VIDEO_BASE_URL=${computed_cdn}"
        fi
      else
        echo "CDN base (not written): $computed_cdn"
      fi
    else
      echo "Upload failed for $f; skipping delete or env update"
    fi
  fi

done

echo "\nAll done. Generated files are in: $VIDEO_DIR"
