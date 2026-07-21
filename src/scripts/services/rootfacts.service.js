import { pipeline, env } from "@huggingface/transformers";

class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = null;
    this.currentBackend = null;
    this.currentTone = "normal";
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
      const hasWebGPU = await this.checkWebGPU();
      let device = hasWebGPU ? "webgpu" : "wasm";
      this.currentBackend = device;
      
      console.log(`Loading transformers with device: ${device}`);
      
      try {
        this.generator = await pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-77M", {
          device: device,
          dtype: "q4"
        });
      } catch (e) {
        if (device === "webgpu") {
          console.warn("WebGPU init failed, fallback to wasm:", e);
          device = "wasm";
          this.currentBackend = device;
          this.generator = await pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-77M", {
            device: device,
            dtype: "q4"
          });
        } else {
          throw e;
        }
      }
      
      this.isModelLoaded = true;
      console.log("Model Generative AI berhasil dimuat");
    } catch (error) {
      console.error("Gagal memuat model Generative AI:", error);
      throw error;
    }
  }

  setTone(tone) {
    this.currentTone = tone;
  }

  async generateFacts(vegetable, tone = "normal") {
    if (!this.isReady()) throw new Error("Model belum dimuat");
    if (this.isGenerating) return null;

    try {
      this.isGenerating = true;
      
      // Sanitasi input (hapus karakter khusus, limit panjang)
      const cleanVegetable = vegetable.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50);
      
      let prompt = `Tell me an interesting fun fact about ${cleanVegetable}.`;
      if (tone === "funny") {
        prompt = `Tell me a funny and hilarious fact about ${cleanVegetable}.`;
      } else if (tone === "professional") {
        prompt = `Provide a scientific and nutritional fact about ${cleanVegetable}.`;
      } else if (tone === "casual") {
        prompt = `Tell me a casual and cool fact about ${cleanVegetable}.`;
      }

      const result = await this.generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true
      });

      return result[0]?.generated_text || "Maaf, saya tidak dapat menemukan fakta tentang sayuran ini.";
    } catch (error) {
      console.error("Gagal menghasilkan fakta:", error);
      return "Terjadi kesalahan saat menghasilkan fakta unik.";
    } finally {
      this.isGenerating = false;
    }
  }

  isReady() {
    return this.isModelLoaded && this.generator !== null;
  }
}

export default RootFactsService;
