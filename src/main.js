import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';

import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

import javascriptLogo from './javascript.svg';
import view from './view.js';
import ru from '../locales/ru.js';

i18next.init({
  lng: 'ru',
  debug: false,
  resources: { ru },
}).then(() => {

  yup.setLocale({
    string: {
      url: () => i18next.t('feedback.notUrl'),
    },
    mixed: {
      required: () => i18next.t('feedback.required'),
      notOneOf: () => i18next.t('feedback.alreadyExists'),
    },
  });

  document.querySelector('#app').innerHTML = `
    <div class="hero-section">
      <div class="hero-container text-center">
        <div class="logos-container">
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
          </a>
          <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">
            <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
          </a>
        </div>

        <h1 class="display-3 fw-normal">${i18next.t('appName')}</h1>
        <p class="lead">${i18next.t('appDescription')}</p>
        <form id="rss-form" class="rss-form text-body" novalidate>
          <div class="row gx-2 align-items-start">
            <div class="col">
              <div class="form-floating">
                <input
                  id="url-input"
                  name="url"
                  type="url"
                  class="form-control"
                  placeholder="${i18next.t('placeholder')}"
                  required
                  autofocus
                />
                <label for="url-input">${i18next.t('placeholder')}</label>
              </div>
              <p class="text-danger small m-1" id="feedback"></p>
            </div>
            <div class="col-auto">
              <button type="submit" class="btn btn-primary px-sm-5" style="height: 58px;">
                ${i18next.t('buttonAdd')}
              </button>
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

  const getValidationSchema = (feeds) => yup.string()
    .url()
    .notOneOf(feeds)
    .required();

  const watchedState = onChange(state, view(elements, state));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    if (url === '') {
      watchedState.form.status = 'invalid';
      watchedState.form.error = null;
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
});
