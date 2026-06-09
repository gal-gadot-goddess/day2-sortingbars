import os
import sys
import json
import hashlib
from pathlib import Path

# Add the root directory to sys.path
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))

from upload.upload_instagram import upload_to_instagram
from upload.upload_facebook import upload_to_facebook, upload_to_facebook_story
from upload.upload_threads import upload_to_threads
from upload.upload_twitter import upload_to_twitter
from upload.upload_to_youtube import upload_to_youtube
from upload.upload_vk import upload_to_vk
from upload.upload_telegram import upload_to_telegram

HISTORY_FILE = Path("upload_history.json")

CREDENTIAL_CHECKS = {
    'instagram': ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
    'facebook': ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    'twitter': ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    'youtube': ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN'],
    'threads': ['THREADS_ACCESS_TOKEN', 'THREADS_USER_ID'],
}

def has_creds(platform):
    vars = CREDENTIAL_CHECKS.get(platform, [])
    return all(os.getenv(v) for v in vars)

def load_history():
    if not HISTORY_FILE.exists():
        return {}
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def save_history(history):
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2)

def get_content_hash(topic):
    return hashlib.md5(topic.encode('utf-8')).hexdigest()

def is_uploaded(history, content_hash, platform):
    if content_hash not in history:
        return False
    return platform in history[content_hash]

def mark_uploaded(history, content_hash, platform):
    if content_hash not in history:
        history[content_hash] = []
    if platform not in history[content_hash]:
        history[content_hash].append(platform)
    save_history(history)

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/unified_uploader.py <video_path> [thumbnail_path]")
        sys.exit(1)

    video_path = Path(sys.argv[1])
    thumbnail_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    metadata_path = Path('metadata.json')

    if not video_path.exists():
        print(f"❌ Video not found at {video_path}")
        return

    if thumbnail_path and not thumbnail_path.exists():
        print(f"⚠️ Thumbnail not found at {thumbnail_path}, proceeding without it.")
        thumbnail_path = None

    if not metadata_path.exists():
        print("❌ metadata.json not found. Run generate_ai_metadata.js first.")
        sys.exit(1)

    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    title = metadata.get('title', 'Algorithm Visualization')
    ig_caption = metadata.get('ig_caption', '')
    fb_caption = metadata.get('fb_caption', '')
    threads_caption = metadata.get('threads_caption', '')
    yt_description = metadata.get('yt_description', '')
    hashtags = metadata.get('hashtags', '')

    if isinstance(hashtags, list):
        hashtags = " ".join(hashtags)

    instagram_full = f"{title}\n\n{ig_caption}\n\n{hashtags}"
    facebook_full = f"{title}\n\n{fb_caption}\n\n{hashtags}"
    threads_full = f"{title}\n\n{threads_caption}\n\n{hashtags}"

    content_hash = get_content_hash(f"UnifiedUpload_{title}")
    history = load_history()

    print(f"\n{'='*40}")
    print(f"🚀 PUBLISHING VIZ: {title}")
    print(f"{'='*40}")
    print(f"📂 Video Path: {video_path}")
    print(f"🔑 Content Hash: {content_hash}\n")

    # 1. Instagram Reel
    if not is_uploaded(history, content_hash, 'instagram_reel'):
        if not has_creds('instagram'):
            print("⏭️ Skipping Instagram Reel (credentials not configured)")
        else:
            print("📸 Starting Instagram Reel...")
            try:
                upload_to_instagram(str(video_path), instagram_full, is_story=False)
                mark_uploaded(history, content_hash, 'instagram_reel')
                print("✅ Instagram Reel Success")
            except Exception as e: print(f"❌ Instagram Reel failed: {e}")
    else: print("⏭️ Skipping Instagram Reel")

    # 2. Instagram Story
    if not is_uploaded(history, content_hash, 'instagram_story'):
        if not has_creds('instagram'):
            print("⏭️ Skipping Instagram Story (credentials not configured)")
        else:
            print("📸 Starting Instagram Story...")
            try:
                upload_to_instagram(str(video_path), title, is_story=True)
                mark_uploaded(history, content_hash, 'instagram_story')
                print("✅ Instagram Story Success")
            except Exception as e: print(f"❌ Instagram Story failed: {e}")
    else: print("⏭️ Skipping Instagram Story")

    # 3. Facebook Reel
    if not is_uploaded(history, content_hash, 'facebook_reel'):
        if not has_creds('facebook'):
            print("⏭️ Skipping Facebook Reel (credentials not configured)")
        else:
            print("📘 Starting Facebook Reel...")
            try:
                upload_to_facebook(str(video_path), facebook_full, title=title[:100], thumbnail_path=str(thumbnail_path) if thumbnail_path else None)
                mark_uploaded(history, content_hash, 'facebook_reel')
                print("✅ Facebook Reel Success")
            except Exception as e: print(f"❌ Facebook Reel failed: {e}")
    else: print("⏭️ Skipping Facebook Reel")

    # 4. Facebook Story
    if not is_uploaded(history, content_hash, 'facebook_story'):
        if not has_creds('facebook'):
            print("⏭️ Skipping Facebook Story (credentials not configured)")
        else:
            print("📘 Starting Facebook Story...")
            try:
                res = upload_to_facebook_story(str(video_path))
                if isinstance(res, dict) and res.get('status') == 'success':
                    mark_uploaded(history, content_hash, 'facebook_story')
                    print("✅ Facebook Story Success")
                else:
                    mark_uploaded(history, content_hash, 'facebook_story')
                    print(f"✅ Facebook Story Success (or warn: {res})")
            except Exception as e: print(f"❌ Facebook Story failed: {e}")
    else: print("⏭️ Skipping Facebook Story")

    # 5. Twitter / X
    if not is_uploaded(history, content_hash, 'twitter'):
        if not has_creds('twitter'):
            print("⏭️ Skipping Twitter (credentials not configured)")
        else:
            print("🐦 Starting Twitter...")
            try:
                short_caption = f"{title}\n\n{hashtags}"
                if len(short_caption) > 280:
                    short_caption = short_caption[:277] + "..."
                upload_to_twitter(str(video_path), short_caption)
                mark_uploaded(history, content_hash, 'twitter')
                print("✅ Twitter Success")
            except Exception as e: print(f"❌ Twitter failed: {e}")
    else: print("⏭️ Skipping Twitter")

    # 6. YouTube Shorts
    if not is_uploaded(history, content_hash, 'youtube'):
        if not has_creds('youtube'):
            print("⏭️ Skipping YouTube (credentials not configured)")
        else:
            print("🎥 Starting YouTube Shorts...")
            try:
                tags_list = [t.strip('#') for t in hashtags.split()] if hashtags else []
                upload_to_youtube(str(video_path), title[:100], yt_description, tags_list, thumbnail_path=str(thumbnail_path) if thumbnail_path else None)
                mark_uploaded(history, content_hash, 'youtube')
                print("✅ YouTube Success")
            except Exception as e: print(f"❌ YouTube failed: {e}")
    else: print("⏭️ Skipping YouTube")

    # 7. Threads
    if not is_uploaded(history, content_hash, 'threads'):
        if not has_creds('threads'):
            print("⏭️ Skipping Threads (credentials not configured)")
        else:
            print("🧵 Starting Threads...")
            try:
                upload_to_threads(str(video_path), threads_full)
                mark_uploaded(history, content_hash, 'threads')
                print("✅ Threads Success")
            except Exception as e: print(f"❌ Threads failed: {e}")
    else: print("⏭️ Skipping Threads")
    
    # 8. VK
    if not is_uploaded(history, content_hash, 'vk'):
        print("🇷🇺 Starting VK...")
        try:
            upload_to_vk(str(video_path), facebook_full, title=title[:128])
            mark_uploaded(history, content_hash, 'vk')
            print("✅ VK Success")
        except Exception as e: print(f"❌ VK failed: {e}")
    else: print("⏭️ Skipping VK")

    # 9. Telegram
    if not is_uploaded(history, content_hash, 'telegram'):
        print("✈️ Starting Telegram...")
        try:
            res = upload_to_telegram(str(video_path), f"<b>{title}</b>\n\n{yt_description}")
            if isinstance(res, dict) and res.get('status') != 'skipped':
                mark_uploaded(history, content_hash, 'telegram')
                print("✅ Telegram Success")
            elif res is None:
                # sometimes it returns none on success
                mark_uploaded(history, content_hash, 'telegram')
                print("✅ Telegram Success")
            else:
                 print(f"❌ Telegram failed (skipped): {res}")
        except Exception as e: print(f"❌ Telegram failed: {e}")
    else: print("⏭️ Skipping Telegram")

    print("\n✅ All platforms processed!")

if __name__ == "__main__":
    main()
