import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";

class DetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.config = null;
    this.performanceStats = {
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  async checkWebGPU() {
    if (typeof navigator === "undefined" || !navigator.gpu) return false;
    try {
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch (e) {
      return false;
    }
  }

  async loadModel() {
    try {
      let backendSet = false;
      const hasWebGPU = await this.checkWebGPU();
      
      // Coba WebGPU
      if (hasWebGPU) {
        try {
          await tf.setBackend("webgpu");
          await tf.ready();
          console.log("Backend WebGPU aktif");
          backendSet = true;
        } catch (e) {
          console.warn("WebGPU gagal, mencoba WebGL...");
        }
      }
      
      // Coba WebGL jika WebGPU gagal/tidak ada
      if (!backendSet) {
        try {
          await tf.setBackend("webgl");
          await tf.ready();
          console.log("Backend WebGL aktif");
          backendSet = true;
        } catch (e) {
          console.warn("WebGL gagal, fallback ke CPU...");
        }
      }

      // Fallback ke CPU
      if (!backendSet) {
        await tf.setBackend("cpu");
        await tf.ready();
        console.log("Backend CPU aktif");
      }

      const metadataResponse = await fetch("/model/metadata.json");
      const metadata = await metadataResponse.json();
      this.labels = metadata.labels;

      this.model = await tf.loadLayersModel("/model/model.json");
      console.log("Model CV berhasil dimuat");
    } catch (error) {
      console.error("Gagal memuat model:", error);
      throw error;
    }
  }

  async predict(imageElement) {
    if (!this.model) throw new Error("Model belum dimuat");

    const startTime = performance.now();
    let result = null;

    tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat();
        
      const offset = tf.scalar(127.5);
      const normalized = tensor.sub(offset).div(offset).expandDims();

      const predictions = this.model.predict(normalized);
      const data = predictions.dataSync();

      const maxConfidence = Math.max(...data);
      const maxIndex = data.indexOf(maxConfidence);

      result = {
        label: this.labels[maxIndex] || "Unknown",
        confidence: maxConfidence * 100,
        isValid: true
      };
    });

    const endTime = performance.now();
    this.updateStats(endTime - startTime);

    return result;
  }

  updateStats(time) {
    this.performanceStats.operations++;
    this.performanceStats.totalTime += time;
    this.performanceStats.averageTime = this.performanceStats.totalTime / this.performanceStats.operations;
  }
}

export default DetectionService;
