# AI Passport Photo Generator

A local-only FastAPI + React application that turns one or many user photos into 413 × 531 JPEG passport-style photographs. It performs face **detection only**, removes backgrounds with RMBG-2.0 (BiRefNet fallback), crops professionally, composites a solid background, and provides downloads.

## Requirements
- Python 3.12+
- Node.js 20+
- Optional NVIDIA GPU with CUDA-compatible PyTorch

## Installation
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

```bash
cd frontend
npm install
```

## Model Download
The first backend startup downloads InsightFace and Hugging Face models. For offline runs, start once with internet, then set `HF_LOCAL_FILES_ONLY=true` in `backend/.env`.

## Running
```bash
cd backend
uvicorn app.main:app --reload
```
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173`.

## Folder Structure
- `backend/app/api` FastAPI routes
- `backend/app/models` InsightFace and RMBG-2.0 wrappers
- `backend/app/services` passport pipeline orchestration
- `backend/app/utils` validation, HEIC, ZIP helpers
- `frontend/src/components` reusable UI
- `frontend/src/pages` Home, About, Settings, History

## Configuration
All operational settings live in `backend/.env`: limits, output size, model names, CORS origins, and JPEG quality.

## API
- `GET /` service info
- `GET /health` model/device status
- `POST /api/passport/single` multipart `file`, `background`
- `POST /api/passport/multiple` multipart `files`, `background`
- `POST /api/passport/zip` multipart ZIP `file`, `background`
- `GET /api/download/{filename}`
- `GET /api/download/all`
- `DELETE /api/cleanup`

## Supported Formats
JPG, JPEG, PNG, WEBP, HEIC, HEIF, ZIP. Images are limited to 10 MB; ZIP files to 500 MB and 1000 valid images.

## AI Pipeline
Upload → validation → HEIC conversion → ZIP extraction → InsightFace largest-face detection → RMBG-2.0/BiRefNet background removal → adaptive crop → resize → alpha composite solid background → JPEG export → download.

## Screenshots
Add screenshots of the Home page, dark mode, result gallery, and settings screen after your local models are installed.

## Troubleshooting
- If InsightFace fails, install a matching `onnxruntime`/`onnxruntime-gpu` for your platform.
- If RMBG-2.0 cannot load offline, start once online or pre-populate your Hugging Face cache.
- If HEIC fails, confirm `pillow-heif` is installed in the active virtual environment.

## Future Improvements
WebSocket progress streaming, cancellable background jobs, advanced country presets, and printable contact sheets.
