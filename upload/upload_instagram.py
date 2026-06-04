import os
import requests
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

API_VERSION = "v21.0"
MAX_POLL_WAIT = 180

def upload_file_to_hosting(file_path):
    services = [
        {
            "name": "file.io",
            "upload": lambda f: requests.post(
                "https://file.io", files={"file": ("video.mp4", f, "video/mp4")}, timeout=120
            ),
            "parse": lambda r: r.json().get("link"),
        },
        {
            "name": "tmpfiles.org",
            "upload": lambda f: requests.post(
                "https://tmpfiles.org/api/v1/upload",
                files={"file": ("video.mp4", f, "video/mp4")},
                timeout=120,
            ),
            "parse": lambda r: r.json()
                .get("data", {})
                .get("url", "")
                .replace("tmpfiles.org/", "tmpfiles.org/dl/"),
        },
        {
            "name": "catbox.moe",
            "upload": lambda f: requests.post(
                "https://catbox.moe/user/api.php",
                data={"reqtype": "fileupload"},
                files={"fileToUpload": ("video.mp4", f, "video/mp4")},
                timeout=120,
            ),
            "parse": lambda r: r.text.strip(),
        },
    ]

    for svc in services:
        try:
            with open(file_path, "rb") as f:
                resp = svc["upload"](f)
            if resp.status_code in (200, 201, 302):
                url = svc["parse"](resp)
                if url and url.startswith("http"):
                    print(f"[hosting] ✅ {svc['name']} → {url}")
                    return url
            print(f"[hosting] ⚠️ {svc['name']} returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[hosting] ❌ {svc['name']} error: {e}")
    raise Exception("All file hosting services failed")


def upload_thumbnail_to_hosting(thumbnail_path):
    try:
        with open(thumbnail_path, "rb") as f:
            resp = requests.post(
                "https://file.io",
                files={"file": ("thumb.jpg", f, "image/jpeg")},
                timeout=60,
            )
        if resp.status_code == 200:
            url = resp.json().get("link")
            if url:
                print(f"[hosting] ✅ thumbnail → {url}")
                return url
    except Exception as e:
        print(f"[hosting] ⚠️ thumbnail upload failed: {e}")
    return None


def upload_to_instagram(video_path, caption, is_story=False, thumbnail_path=None):
    media_type = "STORIES" if is_story else "REELS"

    print("\n" + "=" * 60)
    print("📸 INSTAGRAM UPLOAD STARTING")
    print("=" * 60)

    access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    user_id = os.getenv("INSTAGRAM_ACCOUNT_ID")

    def mask(s):
        return (
            f"{s[:4]}...{s[-4:]}"
            if s and len(s) > 8
            else ("PLACEHOLDER (***)" if s == "***" else "MISSING")
        )

    print(f"[instagram] User ID: {user_id}")
    print(f"[instagram] Access Token: {mask(access_token)}")

    if not access_token:
        raise ValueError("INSTAGRAM_ACCESS_TOKEN not set")
    if not user_id:
        raise ValueError("INSTAGRAM_ACCOUNT_ID not set")

    print("[instagram] ✅ Credentials loaded")

    video_path_obj = Path(video_path)
    if not video_path_obj.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    file_size_mb = video_path_obj.stat().st_size / (1024 * 1024)
    print(f"[instagram] ✅ Video file found: {video_path}")
    print(f"[instagram] Video size: {file_size_mb:.2f} MB")

    caption_limited = caption[:2200] if len(caption) > 2200 else caption
    print(f"[instagram] Caption length: {len(caption_limited)} characters")

    try:
        print("[instagram] 📤 Uploading video to public hosting...")
        video_url = upload_file_to_hosting(video_path)

        cover_url = None
        if thumbnail_path and os.path.exists(thumbnail_path):
            cover_url = upload_thumbnail_to_hosting(thumbnail_path)

        print("[instagram] ⏳ Waiting 5s for URL propagation...")
        time.sleep(5)

        print(f"[instagram] 📦 Creating Instagram {media_type} container...")
        container_url = f"https://graph.facebook.com/{API_VERSION}/{user_id}/media"
        container_params = {
            "media_type": media_type,
            "video_url": video_url,
            "access_token": access_token,
        }

        if cover_url and is_story:
            container_params["cover_url"] = cover_url

        if not is_story:
            container_params["caption"] = caption_limited
            container_params["share_to_feed"] = "false"

        container_response = requests.post(container_url, params=container_params, timeout=60)

        if container_response.status_code != 200:
            error_data = container_response.json() if container_response.text else {}
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            print(f"[instagram] ❌ Container creation failed: {error_msg}")
            print(f"[instagram] Full response: {container_response.text[:1000]}")
            raise Exception(f"Instagram Container Error: {error_msg}")

        container_id = container_response.json().get("id")
        print(f"[instagram] ✅ Container created: {container_id}")

        print("[instagram] ⏳ Polling for video processing...")
        waited = 0
        success = False

        while waited < MAX_POLL_WAIT:
            status_url = f"https://graph.facebook.com/{API_VERSION}/{container_id}"
            status_params = {
                "fields": "status_code,status,error_message",
                "access_token": access_token,
            }

            status_response = requests.get(status_url, params=status_params, timeout=30)
            status_data = status_response.json()

            status_code = (
                status_data.get("status_code")
                or status_data.get("status")
                or "UNKNOWN"
            )

            print(f"[instagram] Status: {status_code} (waited {waited}s)")

            if status_code == "FINISHED":
                print("[instagram] ✅ Video processing complete!")
                success = True
                break
            elif status_code == "ERROR":
                err = status_data.get("error_message", "Video processing failed")
                print(f"[instagram] ❌ {err}")
                print(f"[instagram] Full response: {status_data}")
                raise Exception(err)
            elif status_code == "UNKNOWN" and waited > 0 and waited % 60 == 0:
                print(f"[instagram] Full status response: {status_data}")

            time.sleep(10)
            waited += 10

        if not success:
            raise Exception("Video processing timed out")

        print("[instagram] 📤 Publishing to Instagram...")
        publish_url = f"https://graph.facebook.com/{API_VERSION}/{user_id}/media_publish"
        publish_params = {
            "creation_id": container_id,
            "access_token": access_token,
        }

        publish_response = requests.post(publish_url, params=publish_params, timeout=60)

        if publish_response.status_code != 200:
            error_data = publish_response.json() if publish_response.text else {}
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            print(f"[instagram] ❌ Publish failed: {error_msg}")
            raise Exception(f"Instagram Publish Error: {error_msg}")

        media_id = publish_response.json().get("id")

        print("[instagram] ✅ SUCCESS! Video published to Instagram!")
        print(f"[instagram] Media ID: {media_id}")
        print("=" * 60)

        return {"id": media_id, "platform": "instagram", "status": "success"}

    except Exception as e:
        print("[instagram] ❌ ERROR!")
        print(f"[instagram] {str(e)}")
        print("=" * 60)
        raise


if __name__ == "__main__":
    video_file = Path("output/final_video.mp4")
    if video_file.exists():
        try:
            result = upload_to_instagram(str(video_file), "Test upload")
            print(f"\n✅ Success! Result: {result}")
        except Exception as e:
            print(f"\n❌ Failed: {e}")
    else:
        print(f"❌ Video not found: {video_file}")
