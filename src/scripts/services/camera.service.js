class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = null;
  }

  // TODO [Basic] inisiasi elemen video dan canvas
  initializeElements(videoId, canvasId) {
    this.video = document.getElementById(videoId);
    this.canvas = document.getElementById(canvasId);
  }

  // TODO [Basic] Tambahkan konfigurasi kamera untuk mendapatkan daftar perangkat input video
  // TODO [Basic] Dapatkan constraints kamera berdasarkan konfigurasi dan kamera yang dipilih
  async loadCameras(cameraSelect) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("API Kamera tidak didukung. Pastikan Anda menggunakan HTTPS atau localhost.");
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");

      cameraSelect.innerHTML = "";
      if (videoDevices.length === 0) {
        const option = document.createElement("option");
        option.text = "Tidak ada kamera";
        cameraSelect.appendChild(option);
        return [];
      }

      videoDevices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label || `Kamera ${index + 1}`;
        cameraSelect.appendChild(option);
      });
      return videoDevices;
    } catch (error) {
      console.error("Gagal memuat daftar kamera:", error);
      throw error;
    }
  }

  async startCamera(videoId, canvasId, cameraSelect) {
    this.initializeElements(videoId, canvasId);
    if (!this.video) return;

    this.stopCamera();

    const deviceId = cameraSelect?.value;
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          if (this.config?.fps) {
            this.setFPS(this.config.fps);
          }
          resolve();
        };
      });
    } catch (error) {
      console.error("Gagal memulai kamera:", error);
      throw error;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  setFPS(fps) {
    if (this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.applyConstraints) {
        videoTrack.applyConstraints({ frameRate: fps }).catch(e => {
          console.warn("Tidak dapat mengatur FPS kamera:", e);
        });
      }
    }
    if (!this.config) this.config = {};
    this.config.fps = fps;
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }
}

export default CameraService;
