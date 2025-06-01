import os
import cv2
import shutil
import google.generativeai as genai
from PIL import Image

# ----------------------------------------
# Configuration
# ----------------------------------------
video_filename = "sign_language_video.avi"
frame_dir = "video_frames"
frame_rate = 3
record_duration = 6  # in seconds
output_sigml_filename = "output.sigml"

GEMINI_API_KEY = "AIzaSyCpUl7z10aDuGDa__Fw9MUayNF3Oog3nMo"  # Set this as env var
MAX_FRAMES = 8  # Limit frames to avoid exceeding token/image limit

# ----------------------------------------
# Step 1: Record webcam video
# ----------------------------------------
def record_video(filename, duration):
    cap = cv2.VideoCapture(0)
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    fps = 20.0
    frame_size = (int(cap.get(3)), int(cap.get(4)))
    out = cv2.VideoWriter(filename, fourcc, fps, frame_size)

    print(f"Recording {duration} seconds of video...")
    for _ in range(int(fps * duration)):
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        cv2.imshow("Recording...", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("Video saved as:", filename)

# ----------------------------------------
# Step 2: Extract frames from video
# ----------------------------------------
def extract_all_frames(video_path, output_dir):
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_path = os.path.join(output_dir, f"frame_{count:04}.jpg")
        cv2.imwrite(frame_path, frame)
        count += 1

    cap.release()
    print(f"Extracted {count} frames (100%) to '{output_dir}'.")

# ----------------------------------------
# Step 3: Talk to Gemini Vision API
# ----------------------------------------
def generate_sigml_from_frames(frame_dir):

    genai.configure(api_key=GEMINI_API_KEY)

    model = genai.GenerativeModel(
        model_name="models/gemini-1.5-flash",  # Use gemini-1.5-pro or gemini-1.5-flash
        safety_settings={"HARASSMENT": "BLOCK_NONE", "HATE": "BLOCK_NONE"}
    )

    image_files = sorted(os.listdir(frame_dir))[:MAX_FRAMES]
    images = [Image.open(os.path.join(frame_dir, f)) for f in image_files]

    word = "salute"
    example_sigml = """
<sigml>
  <hns_sign gloss="fan">
    <hamnosys_manual>
      <hamfinger2/>
      <hamextfingeru/>
      <hampalml/>
      <hamhead/>
      <hamlrat/>
      <hamcirclei/>
      <hamrepeatfromstart/>
    </hamnosys_manual>
  </hns_sign>
</sigml>
"""
    prompt = f"""
You are given a series of images that together form a single sign language gesture for the word {word}.

Each image is a frame from a video showing the same person performing **one complete gesture** using only **hands, wrists, and arms**.

❗ Do NOT include head, face, mouth, or shoulder components in the SiGML. Only include hand/arm/wrist movement elements.

Your job is to generate a SiGML (Signing Gesture Markup Language) XML block that accurately captures the gesture seen in the frames.

Here's an example of the format to follow:
{example_sigml}

Output ONLY the <sigml> XML block for this user's sign gesture, and make sure it contains only hand/arm elements.
"""

    print("Sending frames and prompt to Gemini...")
    response = model.generate_content(
        [prompt] + images,
        generation_config={"temperature": 0.4}
    )

    print("Gemini response received.")
    return response.text


# ----------------------------------------
# Step 4: Save to .sigml file
# ----------------------------------------
def save_sigml(content, filename):
    if "<sigml>" in content:
        start = content.index("<sigml>")
        end = content.index("</sigml>") + len("</sigml>")
        sigml_content = content[start:end]
    else:
        sigml_content = content

    with open(filename, "w") as f:
        f.write(sigml_content)
    print("Saved SiGML to:", filename)

# ----------------------------------------
# Full pipeline
# ----------------------------------------
if __name__ == "__main__":
    record_video(video_filename, record_duration)
    extract_all_frames(video_filename, frame_dir)
    sigml_output = generate_sigml_from_frames(frame_dir)
    save_sigml(sigml_output, output_sigml_filename)
