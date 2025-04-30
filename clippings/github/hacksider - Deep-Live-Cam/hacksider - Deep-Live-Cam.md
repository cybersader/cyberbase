---
title: "Deep-Live-Cam"
owner: "hacksider"
source: "https://github.com/hacksider/Deep-Live-Cam"
website: "https://deeplivecam.net/"
description: "real time face swap and one-click video deepfake with only a single image"
stars: 53.4
tags:
  - "clippings"
  - "clippings/github"
date created: Tuesday, April 29th 2025, 9:50 pm
---

## README

Real-time face swap and video deepfake with a single click and only a single image.

[![hacksider%2FDeep-Live-Cam | Trendshift](https://camo.githubusercontent.com/e5ee4b9cf6240aced1af42c04d7a2c94f65b583969c4202727674ecc9f74b7fe/68747470733a2f2f7472656e6473686966742e696f2f6170692f62616467652f7265706f7369746f726965732f3131333935)](https://trendshift.io/repositories/11395)

 [![Demo GIF](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/demo.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/demo.gif) [![Demo GIF](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/demo.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/demo.gif)## DisclaimerThis deepfake software is designed to be a productive tool for the AI-generated media industry. It can assist artists in animating custom characters, creating engaging content, and even using models for clothing design.

We are aware of the potential for unethical applications and are committed to preventative measures. A built-in check prevents the program from processing inappropriate media (nudity, graphic content, sensitive material like war footage, etc.). We will continue to develop this project responsibly, adhering to the law and ethics. We may shut down the project or add watermarks if legally required.

- Ethical Use: Users are expected to use this software responsibly and legally. If using a real person's face, obtain their consent and clearly label any output as a deepfake when sharing online.
- Content Restrictions: The software includes built-in checks to prevent processing inappropriate media, such as nudity, graphic content, or sensitive material.
- Legal Compliance: We adhere to all relevant laws and ethical guidelines. If legally required, we may shut down the project or add watermarks to the output.
- User Responsibility: We are not responsible for end-user actions. Users must ensure their use of the software aligns with ethical standards and legal requirements.

By using this software, you agree to these terms and commit to using it in a manner that respects the rights and dignity of others.

Users are expected to use this software responsibly and legally. If using a real person's face, obtain their consent and clearly label any output as a deepfake when sharing online. We are not responsible for end-user actions.

## Exclusive v2.0 Quick Start - Pre-built (Windows / Nvidia)[![](https://private-user-images.githubusercontent.com/136873090/400514008-7d993b32-e3e8-4cd3-bbfb-a549152ebdd5.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU5Nzc4OTQsIm5iZiI6MTc0NTk3NzU5NCwicGF0aCI6Ii8xMzY4NzMwOTAvNDAwNTE0MDA4LTdkOTkzYjMyLWUzZTgtNGNkMy1iYmZiLWE1NDkxNTJlYmRkNS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQzMFQwMTQ2MzRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00NGIwZjAyZDMzY2U4YzUzZjVhNjFmNDFlOWNkZWExMjI4NGMzYjY5NzBkMzQ4MWZmNTI1MzBiODY0YTFjZWVkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.bqJ5YuA25_6HFBZ8fjhUqyGfL6Wgp7R7Ypi09h_trpI)](https://deeplivecam.net/index.php/quickstart)

##### This is the fastest build you can get if you have a discrete NVIDIA GPU.###### These Pre-builts are perfect for non-technical users or those who don't have time to, or can't manually install all the requirements. Just a heads-up: this is an open-source project, so you can also install it manually. This will be 60 days ahead on the open source version.## TLDR; Live Deepfake in just 3 Clicks[![easysteps](https://private-user-images.githubusercontent.com/1267200/400732002-af825228-852c-411b-b787-ffd9aac72fc6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU5Nzc4OTQsIm5iZiI6MTc0NTk3NzU5NCwicGF0aCI6Ii8xMjY3MjAwLzQwMDczMjAwMi1hZjgyNTIyOC04NTJjLTQxMWItYjc4Ny1mZmQ5YWFjNzJmYzYucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MDQzMCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTA0MzBUMDE0NjM0WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9M2VkMGNlZmE5ZmNjODI0ZjM0NDBjNjM1ZmFjNzRjMDcyNmYwNzk4MjQwZmRiMWM5YTQxMWU0MGNmMWQ5MTc2NiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.O8WJLb7zuH_4dAep8xfO48_yMnkGulUUR_9xuEf6b-o)](https://private-user-images.githubusercontent.com/1267200/400732002-af825228-852c-411b-b787-ffd9aac72fc6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU5Nzc4OTQsIm5iZiI6MTc0NTk3NzU5NCwicGF0aCI6Ii8xMjY3MjAwLzQwMDczMjAwMi1hZjgyNTIyOC04NTJjLTQxMWItYjc4Ny1mZmQ5YWFjNzJmYzYucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MDQzMCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTA0MzBUMDE0NjM0WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9M2VkMGNlZmE5ZmNjODI0ZjM0NDBjNjM1ZmFjNzRjMDcyNmYwNzk4MjQwZmRiMWM5YTQxMWU0MGNmMWQ5MTc2NiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.O8WJLb7zuH_4dAep8xfO48_yMnkGulUUR_9xuEf6b-o)

1. Select a face
2. Select which camera to use
3. Press live!

## Features & Uses - Everything is in real-time### Mouth Mask**Retain your original mouth for accurate movement using Mouth Mask**

 [![resizable-gif](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/ludwig.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/ludwig.gif) [![resizable-gif](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/ludwig.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/ludwig.gif)### Face Mapping**Use different faces on multiple subjects simultaneously**

 [![face_mapping_source](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/streamers.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/streamers.gif) [![face_mapping_source](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/streamers.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/streamers.gif)### Your Movie, Your Face**Watch movies with any face in real-time**

 [![movie](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/movie.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/movie.gif) [![movie](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/movie.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/movie.gif)### Live Show**Run Live shows and performances**

 [![show](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/live_show.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/live_show.gif) [![show](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/live_show.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/live_show.gif)### Memes**Create Your Most Viral Meme Yet**

 [![show](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/meme.gif)](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/meme.gif) [![show](https://github.com/hacksider/Deep-Live-Cam/raw/main/media/meme.gif)

](https://github.com/hacksider/Deep-Live-Cam/blob/main/media/meme.gif)  
<sub>Created using Many Faces feature in Deep-Live-Cam</sub>

### Omegle**Surprise people on Omegle**

ishowspeed.mp4<video src="https://github.com/user-attachments/assets/2e9b9b82-fa04-4b70-9f56-b1f68e7672d0" data-canonical-src="https://github.com/user-attachments/assets/2e9b9b82-fa04-4b70-9f56-b1f68e7672d0" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>

## Installation (Manual)**Please be aware that the installation requires technical skills and is not for beginners. Consider downloading the prebuilt version.**

Click to see the process

### InstallationThis is more likely to work on your computer but will be slower as it utilizes the CPU.

**1\. Set up Your Platform**

- Python (3.10 recommended)
- pip
- git
- [ffmpeg](https://www.youtube.com/watch?v=OlNWCpFdVMA) - `iex (irm ffmpeg.tc.ht)`
- [Visual Studio 2022 Runtimes (Windows)](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**2\. Clone the Repository**

git clone https://github.com/hacksider/Deep-Live-Cam.git
cd Deep-Live-Cam

**3\. Download the Models**

1. [GFPGANv1.4](https://huggingface.co/hacksider/deep-live-cam/resolve/main/GFPGANv1.4.pth)
2. [inswapper\_128\_fp16.onnx](https://huggingface.co/hacksider/deep-live-cam/resolve/main/inswapper_128_fp16.onnx)

Place these files in the "**models**" folder.

**4\. Install Dependencies**

We highly recommend using a `venv` to avoid issues.

For Windows:

python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt

**For macOS:**

Apple Silicon (M1/M2/M3) requires specific setup:

# Install Python 3.10 (specific version is important)
brew install python@3.10

# Install tkinter package (required for the GUI)
brew install python-tk@3.10

# Create and activate virtual environment with Python 3.10
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

\*\* In case something goes wrong and you need to reinstall the virtual environment \*\*

# Deactivate the virtual environment
rm -rf venv

# Reinstall the virtual environment
python -m venv venv
source venv/bin/activate

# install the dependencies again
pip install -r requirements.txt

**Run:** If you don't have a GPU, you can run Deep-Live-Cam using `python run.py`. Note that initial execution will download models (~300MB).

### GPU Acceleration**CUDA Execution Provider (Nvidia)**

1. Install [CUDA Toolkit 11.8.0](https://developer.nvidia.com/cuda-11-8-0-download-archive)
2. Install dependencies:

pip uninstall onnxruntime onnxruntime-gpu
pip install onnxruntime-gpu==1.16.3

3. Usage:

python run.py --execution-provider cuda

**CoreML Execution Provider (Apple Silicon)**

Apple Silicon (M1/M2/M3) specific installation:

1. Make sure you've completed the macOS setup above using Python 3.10.
2. Install dependencies:

pip uninstall onnxruntime onnxruntime-silicon
pip install onnxruntime-silicon==1.13.1

3. Usage (important: specify Python 3.10):

python3.10 run.py --execution-provider coreml

**Important Notes for macOS:**

- You **must** use Python 3.10, not newer versions like 3.11 or 3.13
- Always run with `python3.10` command not just `python` if you have multiple Python versions installed
- If you get error about `_tkinter` missing, reinstall the tkinter package: `brew reinstall python-tk@3.10`
- If you get model loading errors, check that your models are in the correct folder
- If you encounter conflicts with other Python versions, consider uninstalling them:
	# List all installed Python versions
	brew list | grep python
	# Uninstall conflicting versions if needed
	brew uninstall --ignore-dependencies python@3.11 python@3.13
	# Keep only Python 3.10
	brew cleanup

**CoreML Execution Provider (Apple Legacy)**

1. Install dependencies:

pip uninstall onnxruntime onnxruntime-coreml
pip install onnxruntime-coreml==1.13.1

2. Usage:

python run.py --execution-provider coreml

**DirectML Execution Provider (Windows)**

1. Install dependencies:

pip uninstall onnxruntime onnxruntime-directml
pip install onnxruntime-directml==1.15.1

2. Usage:

python run.py --execution-provider directml

**OpenVINO™ Execution Provider (Intel)**

1. Install dependencies:

pip uninstall onnxruntime onnxruntime-openvino
pip install onnxruntime-openvino==1.15.0

2. Usage:

python run.py --execution-provider openvino

## Usage**1\. Image/Video Mode**

- Execute `python run.py`.
- Choose a source face image and a target image/video.
- Click "Start".
- The output will be saved in a directory named after the target video.

**2\. Webcam Mode**

- Execute `python run.py`.
- Select a source face image.
- Click "Live".
- Wait for the preview to appear (10-30 seconds).
- Use a screen capture tool like OBS to stream.
- To change the face, select a new source image.

## Tips and TricksCheck out these helpful guides to get the most out of Deep-Live-Cam:

- [Unlocking the Secrets to the Perfect Deepfake Image](https://deeplivecam.net/index.php/blog/tips-and-tricks/unlocking-the-secrets-to-the-perfect-deepfake-image) - Learn how to create the best deepfake with full head coverage
- [Video Call with DeepLiveCam](https://deeplivecam.net/index.php/blog/tips-and-tricks/video-call-with-deeplivecam) - Make your meetings livelier by using DeepLiveCam with OBS and meeting software
- [Have a Special Guest!](https://deeplivecam.net/index.php/blog/tips-and-tricks/have-a-special-guest) - Tutorial on how to use face mapping to add special guests to your stream
- [Watch Deepfake Movies in Realtime](https://deeplivecam.net/index.php/blog/tips-and-tricks/watch-deepfake-movies-in-realtime) - See yourself star in any video without processing the video
- [Better Quality without Sacrificing Speed](https://deeplivecam.net/index.php/blog/tips-and-tricks/better-quality-without-sacrificing-speed) - Tips for achieving better results without impacting performance
- [Instant Vtuber!](https://deeplivecam.net/index.php/blog/tips-and-tricks/instant-vtuber) - Create a new persona/vtuber easily using Metahuman Creator

Visit our [official blog](https://deeplivecam.net/index.php/blog/tips-and-tricks) for more tips and tutorials.

## Command Line Arguments (Unmaintained)```
options:
  -h, --help                                               show this help message and exit
  -s SOURCE_PATH, --source SOURCE_PATH                     select a source image
  -t TARGET_PATH, --target TARGET_PATH                     select a target image or video
  -o OUTPUT_PATH, --output OUTPUT_PATH                     select output file or directory
  --frame-processor FRAME_PROCESSOR [FRAME_PROCESSOR ...]  frame processors (choices: face_swapper, face_enhancer, ...)
  --keep-fps                                               keep original fps
  --keep-audio                                             keep original audio
  --keep-frames                                            keep temporary frames
  --many-faces                                             process every face
  --map-faces                                              map source target faces
  --mouth-mask                                             mask the mouth region
  --video-encoder {libx264,libx265,libvpx-vp9}             adjust output video encoder
  --video-quality [0-51]                                   adjust output video quality
  --live-mirror                                            the live camera display as you see it in the front-facing camera frame
  --live-resizable                                         the live camera frame is resizable
  --max-memory MAX_MEMORY                                  maximum amount of RAM in GB
  --execution-provider {cpu} [{cpu} ...]                   available execution provider (choices: cpu, ...)
  --execution-threads EXECUTION_THREADS                    number of execution threads
  -v, --version                                            show program's version number and exit
```

Looking for a CLI mode? Using the -s/--source argument will make the run program in cli mode.

## Press**We are always open to criticism and are ready to improve, that's why we didn't cherry-pick anything.**

- [*"Deep-Live-Cam goes viral, allowing anyone to become a digital doppelganger"*](https://arstechnica.com/information-technology/2024/08/new-ai-tool-enables-real-time-face-swapping-on-webcams-raising-fraud-concerns/) - Ars Technica
- [*"Thanks Deep Live Cam, shapeshifters are among us now"*](https://dataconomy.com/2024/08/15/what-is-deep-live-cam-github-deepfake/) - Dataconomy
- [*"This free AI tool lets you become anyone during video-calls"*](https://www.newsbytesapp.com/news/science/deep-live-cam-ai-impersonation-tool-goes-viral/story) - NewsBytes
- [*"OK, this viral AI live stream software is truly terrifying"*](https://www.creativebloq.com/ai/ok-this-viral-ai-live-stream-software-is-truly-terrifying) - Creative Bloq
- [*"Deepfake AI Tool Lets You Become Anyone in a Video Call With Single Photo"*](https://petapixel.com/2024/08/14/deep-live-cam-deepfake-ai-tool-lets-you-become-anyone-in-a-video-call-with-single-photo-mark-zuckerberg-jd-vance-elon-musk/) - PetaPixel
- [*"Deep-Live-Cam Uses AI to Transform Your Face in Real-Time, Celebrities Included"*](https://www.techeblog.com/deep-live-cam-ai-transform-face/) - TechEBlog
- [*"An AI tool that "makes you look like anyone" during a video call is going viral online"*](https://telegrafi.com/en/a-tool-that-makes-you-look-like-anyone-during-a-video-call-is-going-viral-on-the-Internet/) - Telegrafi
- [*"This Deepfake Tool Turning Images Into Livestreams is Topping the GitHub Charts"*](https://decrypt.co/244565/this-deepfake-tool-turning-images-into-livestreams-is-topping-the-github-charts) - Emerge
- [*"New Real-Time Face-Swapping AI Allows Anyone to Mimic Famous Faces"*](https://www.digitalmusicnews.com/2024/08/15/face-swapping-ai-real-time-mimic/) - Digital Music News
- [*"This real-time webcam deepfake tool raises alarms about the future of identity theft"*](https://www.diyphotography.net/this-real-time-webcam-deepfake-tool-raises-alarms-about-the-future-of-identity-theft/) - DIYPhotography
- [*"That's Crazy, Oh God. That's Fucking Freaky Dude... That's So Wild Dude"*](https://www.youtube.com/watch?time_continue=1074&v=py4Tc-Y8BcY) - SomeOrdinaryGamers
- [*"Alright look look look, now look chat, we can do any face we want to look like chat"*](https://www.youtube.com/live/mFsCe7AIxq8?feature=shared&t=2686) - IShowSpeed

## Credits- [ffmpeg](https://ffmpeg.org/): for making video-related operations easy
- [deepinsight](https://github.com/deepinsight): for their [insightface](https://github.com/deepinsight/insightface) project which provided a well-made library and models. Please be reminded that the [use of the model is for non-commercial research purposes only](https://github.com/deepinsight/insightface?tab=readme-ov-file#license).
- [havok2-htwo](https://github.com/havok2-htwo): for sharing the code for webcam
- [GosuDRM](https://github.com/GosuDRM): for the open version of roop
- [pereiraroland26](https://github.com/pereiraroland26): Multiple faces support
- [vic4key](https://github.com/vic4key): For supporting/contributing to this project
- [kier007](https://github.com/kier007): for improving the user experience
- [qitianai](https://github.com/qitianai): for multi-lingual support
- and [all developers](https://github.com/hacksider/Deep-Live-Cam/graphs/contributors) behind libraries used in this project.
- Footnote: Please be informed that the base author of the code is [s0md3v](https://github.com/s0md3v/roop)
- All the wonderful users who helped make this project go viral by starring the repo ❤️

[![Stargazers](https://camo.githubusercontent.com/7cd5c10297cdf7a0bde997a57f93ddec5076f7b98d1b7d49f90998712aa8bb98/68747470733a2f2f7265706f726f737465722e636f6d2f73746172732f6861636b73696465722f446565702d4c6976652d43616d)](https://github.com/hacksider/Deep-Live-Cam/stargazers)

## Contributions[![Alt](https://camo.githubusercontent.com/57cedcfdb819f0772ad37a8b000f68815f5db448809cbffc5835f60500dc9db5/68747470733a2f2f7265706f62656174732e6178696f6d2e636f2f6170692f656d6265642f666563386532396334356466646239633539313666336137383330653132343933303864323065312e737667 "Repobeats analytics image")](https://camo.githubusercontent.com/57cedcfdb819f0772ad37a8b000f68815f5db448809cbffc5835f60500dc9db5/68747470733a2f2f7265706f62656174732e6178696f6d2e636f2f6170692f656d6265642f666563386532396334356466646239633539313666336137383330653132343933303864323065312e737667)

## Stars to the Moon 🚀  [![Star History Chart](https://camo.githubusercontent.com/3a7b7a9d084f11a90b6ca0f894860a4bc0caff2cf29876c9046ad2dae6f4e2f2/68747470733a2f2f6170692e737461722d686973746f72792e636f6d2f7376673f7265706f733d6861636b73696465722f646565702d6c6976652d63616d26747970653d44617465)](https://star-history.com/#hacksider/deep-live-cam&Date)

