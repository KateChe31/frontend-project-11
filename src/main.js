import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';

import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

import axios from 'axios';
import { uniqueId } from 'lodash';
import javascriptLogo from './javascript.svg';
import view from './view.js';
import ru from '../locales/ru.js';

import parseRss from './parseRss.js';

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

        <div class="container" style="max-width: 600px;">
          <h1 class="display-3 fw-normal text-center">${i18next.t('appName')}</h1>
          <p class="lead text-center">${i18next.t('appDescription')}</p>
            <form id="rss-form" class="text-body" novalidate>
              <div class="row g-2">
                <div class="col-9">
                  <div class="form-floating">
                    <input
                      type="url"
                      class="form-control"
                      id="url-input"
                      name="url"
                      placeholder="${i18next.t('placeholder')}"
                      required
                      autofocus
                    />
                    <label for="url-input">${i18next.t('placeholder')}</label>
                  </div>
                </div>
                <div class="col-3">
                  <button type="submit" class="btn btn-primary w-100 h-100">
                    ${i18next.t('buttonAdd')}
                  </button>
                </div>
                <div class="col-12">
                  <p class="text-danger small m-1" id="feedback"></p>
                  <p id="success-message" class="text-success small m-1"></p>
                </div>
              </div>
            </form>
          </div>

        <div class="container mt-5">
        <div class="row">
          <div class="col-md-6" id="posts"></div>
          <div class="col-md-6" id="feeds"></div>
        </div>
      </div>
    </div>
  `;

  const elements = {
    form: document.querySelector('#rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('#feedback'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
    successMessage: document.createElement('p'),
  };

  const state = {
    feeds: [],
    posts: [],
    form: {
      status: null,
      error: null,
    },
  };

  const getValidationSchema = (feedUrls) => yup.string()
    .url()
    .notOneOf(feedUrls)
    .required();

  const watchedState = onChange(state, view(elements, state), { isShallow: false });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    watchedState.form.error = null;
    watchedState.form.status = null;

    const schema = getValidationSchema(state.feeds.map((f) => f.url));

    schema.validate(url)
      .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`))
      .then((response) => {
        console.log(response.data.contents); // добавить лог
        const { feed, posts } = parseRss(response.data.contents);
        const feedId = uniqueId();

        const preparedFeed = {
          id: feedId,
          title: feed.title,
          description: feed.description,
          url,
        };

        const preparedPosts = posts.map((post) => ({
          ...post,
          id: uniqueId(),
          feedId,
        }));

        watchedState.feeds = [...state.feeds, preparedFeed];
        watchedState.posts = [...state.posts, ...preparedPosts];

        watchedState.form.status = 'success';
        document.querySelector('#success-message').textContent = 'RSS успешно загружен';
      })

      .catch((error) => {
        watchedState.form.status = 'error';
        document.querySelector('#success-message').textContent = '';

        if (error.name === 'ValidationError') {
          watchedState.form.error = error.message;
        } else if (error.message === 'ParsingError') {
          watchedState.form.error = 'Ошибка парсинга RSS';
        } else {
          watchedState.form.error = 'Ошибка сети или недопустимый адрес';
        }
      });
  });
});
