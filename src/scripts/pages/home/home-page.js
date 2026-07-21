import {
  generateCameraSection,
  generateInfoPanel,
  generateFooter,
} from "../../templates.js";
import HomePresenter from "./home.presenter.js";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <main class="main-content">
        ${generateCameraSection()}
        ${generateInfoPanel()}
      </main>
      ${generateFooter()}
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter();
    await this.#presenter.init();
  }
}
