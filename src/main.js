import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.js';
import * as yup from 'yup';
import onChange from 'on-change';
import view from './view.js';

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
        <form id="rss-form" class="rss-form text-body" novalidate>
        <div class="row gx-2 align-items-start">
          <div class="col">
            <div class="form-floating">
              <input
                id="url-input"
                name="url"
                type="url"
                class="form-control"
                placeholder="Ссылка RSS"
                required
                autofocus
              />
              <label for="url-input">Ссылка RSS</label>
            </div>
            <p class="text-danger small m-1" id="feedback"></p>
            </div>
            <div class="col-auto">
            <button type="submit" class="btn btn-primary px-sm-5" style="height: 58px;">Добавить</button>
          </div>
        </div>
      </form>
    </div>
  </div>
`;

const elements = {
  form: document.querySelector('#rss-form'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('#feedback'),
};

const state = {
  feeds: [],
  form: {
    status: null,
    error: null,
  },
};

// Валидация ссылки + проверка на дублирование
const getValidationSchema = (feeds) => yup.string()
  .url('Ссылка должна быть валидным URL')
  .notOneOf(feeds, 'RSS уже существует')
  .required('Не должно быть пустым');

const watchedState = onChange(state, view(elements, state));

// Обработка отправки формы
elements.form.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = elements.input.value.trim();

  // Проверяем только на пустоту вручную
  if (url === '') {
    watchedState.form.status = 'invalid';
    watchedState.form.error = null;

    // Показать стандартную браузерную подсказку
    elements.input.value = '';
    elements.input.reportValidity();
    return;
  }

  const schema = getValidationSchema(state.feeds);

  schema.validate(url)
    .then(() => {
      watchedState.form.status = 'success';
      watchedState.form.error = null;
      state.feeds.push(url);
    })
    .catch((err) => {
      watchedState.form.status = 'invalid';
      watchedState.form.error = err.message;
    });
});
