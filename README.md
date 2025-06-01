# Accessible AI

### Demo


https://github.com/user-attachments/assets/e7f063b4-c6a2-4e13-977f-57023c69a459


# Sign Language Extension Landing Page

This is the landing page and web application for the Sign Language Extension project, which converts digital content into sign language videos.

## Features

- User authentication with Supabase
- Profile management
- Content conversion to sign language
- History tracking
- Saved translations
- Dark mode support
- Responsive design

## 🔎Project Overview
The Digital Content to Sign Language Converter is a comprehensive tool that converts various forms of Digital media (YouTube videos, local videos, audio files, and text) into sign language videos. This project leverages several libraries and APIs to process and translate spoken or written content into Indian Sign Language (ISL) syntax, creating videos that can aid in communication for the deaf and hard-of-hearing community.

## 💡Project Objective
The primary objective of this project is to bridge the communication gap for individuals who rely on sign language. By converting various media formats into sign language videos, we aim to provide an accessible and efficient means of understanding content that is traditionally available only in spoken or written form.

![accessible_AI](https://github.com/user-attachments/assets/074d87b8-044b-4f54-8ba3-9ba01d48b9e3)

## 📚Features
- *YouTube Video Processing:* Download and convert YouTube videos into sign language videos.
- *Local File Processing:* Convert local video or audio files into sign language videos.
- *Text Input Processing:* Translate text into sign language videos.
- *Sign Language Translation:* Convert English sentences into ISL syntax.
- *Video Compilation:* Combine video clips and GIFs to form coherent sign language videos.
- *PINATA* A DECENTRALISED CLOUD STORAGE, COMES WITH HASHING FOR EVERY FILE, SO ESTABLISHING SECURED CONNECTION

## Technology/Libraries Used 🐍
- *Python:* Core programming language used for development.
- *Next Js* Framework for creating the web interface.
- *Google Cloud Speech-to-Text API:* For transcribing audio to text.
- *yt-dlp:* For downloading YouTube videos.
- *MoviePy:* For video processing and editing.
- *nltk:* For natural language processing tasks.
- *num2words:* For converting numbers to words.
- *pytube:* For downloading YouTube videos.
- *pandas:* For data manipulation and handling.
- **Stanford Parser:** Used for syntactic parsing of text, which involves analyzing the grammatical structure of sentences.
- **stanford-parser-3.9.1-models:** This package contains pre-trained models that the parser uses to analyze text.
- **HAMNOSYS** and **SIGML** - for creating 3D avatars
- **Unsloth** - for finetuning gemini models
- **WEBGL** - 3D renderer avatar

## Methodology 📝
### YouTube Video Processing 📽
1. *Download Audio:* Using yt-dlp, download the audio from the provided YouTube URL.
2. *Convert to Mono:* Ensure the audio is in mono format using pydub.
3. *Transcribe Audio:* Use Google Cloud Speech-to-Text API to transcribe the audio into text.
4. *Translate to ISL:* Convert the transcribed text to ISL syntax using nltk and Stanford Parser.
5. *Compile Video:* Use MoviePy to compile the translated text into a sign language video.

### Local File Processing 🎤
1. *Extract Audio:* Extract audio from the uploaded video or audio file using ffmpeg.
2. *Transcribe Audio:* Transcribe the extracted audio using Google Cloud Speech-to-Text API.
3. *Translate to ISL:* Convert the transcribed text to ISL syntax.
4. *Compile Video:* Compile the translated text into a sign language video.

### Text Input Processing ✏
1. *Translate to ISL:* Directly convert the input text to ISL syntax.
2. *Compile Video:* Compile the translated text into a sign language video using appropriate video clips and GIFs.

## Flow Diagram
![accessible_AI](https://github.com/user-attachments/assets/074d87b8-044b-4f54-8ba3-9ba01d48b9e3)

## How We Built It 🛠👷‍♂
1. *Setting Up Environment:*
   - Install necessary libraries and tools.
   - Set up Google Cloud credentials and APIs.

2. *Developing the Backend:*
   - Implement the VideoProcessor class to handle downloading, audio processing, and transcription.
   - Develop functions for text processing and translation to ISL.

3. *Creating the Frontend:*
   - Use Streamlit to create an intuitive web interface for users to input YouTube URLs, upload files, or enter text.
   - Integrate backend processing with the frontend to provide real-time feedback and results.

4. *Testing and Optimization:*
   - Test the application with various inputs to ensure accuracy and robustness.
   - Optimize the processing pipeline for efficiency and speed.
 
<br>
<br>
<br>

# Setting Up Google Cloud Credentials and APIs for Speech-to-Text

## Prerequisites

1. *Google Cloud Account*: Ensure you have a Google Cloud account. If not, you can sign up [here](https://cloud.google.com/).

2. *Google Cloud SDK*: Install the Google Cloud SDK by following the instructions [here](https://cloud.google.com/sdk/docs/install).

## Step 1: Create a New Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project drop-down menu at the top of the page.
3. Click *New Project*.
4. Enter a name for your project.
5. Click *Create*.

## Step 2: Enable APIs

1. Go to the [API Library](https://console.cloud.google.com/apis/library).
2. Search for *"Cloud Speech-to-Text API"*.
3. Click on the *"Cloud Speech-to-Text API"* result.
4. Click *Enable*.

## Step 3: Set Up Authentication

1. Go to the [Credentials](https://console.cloud.google.com/apis/credentials) page in the Cloud Console.
2. Click *Create credentials* and select *Service account*.
3. Enter a name for your service account and click *Create and continue*.
4. Assign the role *"Project" > "Editor"* and click *Continue*.
5. Click *Done*.
6. In the service account list, click on the newly created service account.
7. Click *Keys* and then *Add key* > *Create new key*.
8. Select *JSON* and click *Create*. Save the downloaded JSON file securely.

## Step 4: Set Up Google Cloud SDK

1. Open your terminal.
2. Initialize the Google Cloud SDK by running:
    sh
    gcloud init
   
3. Authenticate with your Google account and select your newly created project.
4. Set the environment variable to the path of your service account key file:
    sh
    export GOOGLE_APPLICATION_CREDENTIALS="[PATH_TO_YOUR_SERVICE_ACCOUNT_KEY_JSON]"
   
    Replace [PATH_TO_YOUR_SERVICE_ACCOUNT_KEY_JSON] with the actual file path.
<br>

## Step-5: Setting Up a Cloud Storage Bucket

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to *Storage* > *Browser*.
3. Click *Create bucket*.
4. Enter a unique name for your bucket.
5. Select a *Location type* and *Location* for your bucket.
6. Choose a *Default storage class*.
7. Configure *Access control*:
    - For simplicity, you can choose *Uniform*.
8. Click *Create*.
<br>

## Step 6: Update the Path

1. Update the paths of JSON file which you've downloaded in main code
2. Update the name of bucket correctly in main code

<br>
<br>
<br>
     
# How to Run 💻

1. **Download the stanford-parser.jar and stanford-parser-3.9.1-models.jar from the following link:**
   
   http://nlp.stanford.edu/software/stanford-parser-4.2.1.zip
   
   - Update the path location in textToISL.py
     
2. **Download the ffmpeg.exe for audio processing from the following link:**
   
   https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.7z
   
   - Update the path location in VideoProessor.py

3. **Download the latest version of JDK for creating the JAVA Environment to access the two .jar files from the below link:**
   
   https://download.oracle.com/java/22/latest/jdk-22_windows-x64_bin.zip
   
   - Update the Java.exe location in textToISL.py
   
4. *Clone the Repository:*
   
   git clone https://github.com/Twinn-github09/Web3conf-accessible-AI
   cd Web3conf-accessible-AI
   

5. *Install the required Libraries:*
   
   pip install -r requirements.txt
   
6. *Run the app.py file in the terminal:*

   npm run dev
