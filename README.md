# Root Facts AI Web App 🥕

Aplikasi web modern untuk mendeteksi jenis sayuran menggunakan Computer Vision (TensorFlow.js) dan menyajikan fakta-fakta unik serta menarik menggunakan Generative AI lokal/in-browser (Transformers.js).

Dibuat sebagai Proyek Akhir untuk Submission **Dicoding AI on Web**.

## 🌟 Fitur Utama
- **Computer Vision (TensorFlow.js)**: Deteksi otomatis jenis sayuran dari kamera dengan strategi *Backend Adaptive* (WebGPU / WebGL / CPU) & pencegahan *memory leak*.
- **Generative AI (Transformers.js)**: Pembuatan fakta unik secara lokal menggunakan model `Xenova/LaMini-Flan-T5-77M`.
- **Persona & Tone Dinamis**: Kemampuan mengubah gaya penulisan AI (Normal, Lucu, Profesional, Santai).
- **100% Offline Capability (PWA)**: Didukung *Workbox* dan *Web App Manifest* untuk precaching model AI dan aset statis.
- **Arsitektur MVP (Model-View-Presenter)**: Pemisahan logika UI dan AI yang rapi dan terstruktur.

## 🛠️ Panduan Menjalankan

### 1. Development Mode
```bash
npm install
npm run start-dev
```
Akses di browser melalui `http://localhost:8080`.

### 2. Production Build & Offline Testing
```bash
npm run build
npm run serve
```
Akses di browser melalui `http://127.0.0.1:8080`.

## 📜 Lisensi
Dikembangkan untuk submission Dicoding.
