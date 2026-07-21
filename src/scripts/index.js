import "../styles/styles.css";
import App from "./pages/app.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    container: document.querySelector("#main-content"),
  });

  await app.renderPage();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker terdaftar.");
    } catch (error) {
      console.error("Gagal mendaftarkan Service Worker:", error);
    }
  }
});
