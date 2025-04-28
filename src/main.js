import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.js';


document.querySelector('#app').innerHTML = `
  <div class="hero-section">
    <div class="hero-container text-center">
      <!-- Логотипы -->
      <div class="logos-container">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src="${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">
          <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        </a>
      </div>
      
      <h1 class="display-3 fw-normal">RSS агрегатор</h1>
        <p class="lead">Начните читать RSS сегодня! Это легко, это красиво.</p>
        <form id="rss-form" class="rss-form text-body">
          <div class="row">
            <div class="col">
              <input
                id="url-input"
                name="url"
                type="url"
                autofocus=""
                required=""
                placeholder="Ссылка RSS"
                class="form-control"
              >
              <p class="m-0 position-absolute small text-danger" id="feedback"></p>
            </div>
            <div class="col-auto">
              <button type="submit" class="h-100 btn btn-primary px-sm-5">Добавить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
`;
