import CameraService from "../../services/camera.service.js";
import DetectionService from "../../services/detection.service.js";
import RootFactsService from "../../services/rootfacts.service.js";
import { hideElement, showElement, isValidDetection, getConfidenceTheme } from "../../utils/index.js";

class HomePresenter {
  constructor() {
    this.cameraService = new CameraService();
    this.detectionService = new DetectionService();
    this.rootFactsService = new RootFactsService();

    // DOM Elements
    this.video = document.getElementById("media-video");
    this.canvas = document.getElementById("media-canvas");
    this.btnToggle = document.getElementById("btn-toggle");
    this.cameraSelect = document.getElementById("camera-select");
    this.fpsSlider = document.getElementById("fps-slider");
    this.fpsLabel = document.getElementById("fps-label");
    this.toneSelect = document.getElementById("tone-select");

    this.stateIdle = document.getElementById("state-idle");
    this.stateLoading = document.getElementById("state-loading");
    this.stateResult = document.getElementById("state-result");

    this.detectedName = document.getElementById("detected-name");
    this.detectedConfidence = document.getElementById("detected-confidence");
    this.confidenceFill = document.getElementById("confidence-fill");
    
    this.funFactText = document.getElementById("fun-fact-text");
    this.funFactLoading = document.getElementById("fun-fact-loading");
    this.btnCopy = document.getElementById("btn-copy");
    this.btnSpeak = document.getElementById("btn-speak");

    this.statusDot = document.getElementById("status-dot");
    this.statusText = document.getElementById("status-text");
    this.cameraPlaceholder = document.getElementById("camera-placeholder");
    this.cameraOverlay = document.getElementById("camera-overlay");
    
    this.isDetecting = false;
  }

  async init() {
    this.updateStatus("Memuat model...", "yellow");
    
    try {
      // Memuat AI models
      await Promise.all([
        this.detectionService.loadModel(),
        this.rootFactsService.loadModel()
      ]);
      
      this.updateStatus("Siap", "green");

      // Setup Camera
      await this.cameraService.loadCameras(this.cameraSelect);
      await this.startCamera();

      // Listeners
      this.btnToggle.addEventListener("click", () => this.handleScan());
      this.cameraSelect.addEventListener("change", () => this.startCamera());
      this.fpsSlider.addEventListener("input", (e) => {
        const fps = parseInt(e.target.value);
        this.fpsLabel.textContent = `${fps} FPS`;
        this.cameraService.setFPS(fps);
      });
      this.toneSelect.addEventListener("change", (e) => {
        this.rootFactsService.setTone(e.target.value);
      });
      this.btnCopy.addEventListener("click", () => this.handleCopy());
      if (this.btnSpeak) {
        this.btnSpeak.addEventListener("click", () => this.handleSpeak());
      }

    } catch (error) {
      console.error(error);
      this.updateStatus("Gagal memuat model", "red");
    }
  }

  async startCamera() {
    try {
      await this.cameraService.startCamera("media-video", "media-canvas", this.cameraSelect);
      hideElement(this.cameraPlaceholder);
    } catch (e) {
      showElement(this.cameraPlaceholder);
    }
  }

  updateStatus(text, color) {
    if(this.statusText) this.statusText.textContent = text;
    if(this.statusDot) {
        this.statusDot.style.backgroundColor = color === 'green' ? '#10b981' : (color === 'red' ? '#ef4444' : '#f59e0b');
    }
  }

  async handleScan() {
    if (!this.cameraService.isActive() || this.isDetecting) return;

    this.isDetecting = true;
    hideElement(this.stateIdle);
    hideElement(this.stateResult);
    showElement(this.stateLoading);
    
    if (this.cameraOverlay) {
        this.cameraOverlay.classList.add("scanning");
    }

    try {
      // Delay to show scanning animation
      await new Promise(r => setTimeout(r, 500));

      const result = await this.detectionService.predict(this.video);

      if (isValidDetection(result)) {
        await this.showResult(result);
      } else {
        alert("Sayuran tidak dikenali atau tingkat kepercayaan terlalu rendah.");
        hideElement(this.stateLoading);
        showElement(this.stateIdle);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat deteksi.");
      hideElement(this.stateLoading);
      showElement(this.stateIdle);
    } finally {
      this.isDetecting = false;
      if (this.cameraOverlay) {
        this.cameraOverlay.classList.remove("scanning");
      }
    }
  }

  async showResult(result) {
    hideElement(this.stateLoading);
    showElement(this.stateResult);

    this.detectedName.textContent = result.label;
    this.detectedConfidence.textContent = `${result.confidence.toFixed(1)}%`;
    this.confidenceFill.style.width = `${result.confidence}%`;
    
    const theme = getConfidenceTheme(result.confidence);
    this.confidenceFill.style.backgroundColor = theme === 'green' ? '#10b981' : (theme === 'red' ? '#ef4444' : '#f59e0b');

    // Generate Fun Fact
    hideElement(this.funFactText);
    showElement(this.funFactLoading);
    
    try {
      const fact = await this.rootFactsService.generateFacts(result.label, this.rootFactsService.currentTone);
      this.funFactText.textContent = fact;
    } catch (e) {
      this.funFactText.textContent = "Gagal memuat fakta unik.";
    } finally {
      hideElement(this.funFactLoading);
      showElement(this.funFactText);
    }
  }

  async handleCopy() {
    const text = this.funFactText.textContent;
    if (text && text !== "Fakta menarik akan muncul di sini...") {
      try {
        await navigator.clipboard.writeText(text);
        
        const originalHTML = this.btnCopy.innerHTML;
        this.btnCopy.innerHTML = '<i data-lucide="check" width="18" height="18"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        setTimeout(() => {
          this.btnCopy.innerHTML = originalHTML;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  }

  handleSpeak() {
    const text = this.funFactText.textContent;
    if (text && text !== "Fakta menarik akan muncul di sini..." && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
}

export default HomePresenter;
