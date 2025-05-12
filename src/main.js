import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

import * as yup from 'yup'
import onChange from 'on-change'
import i18next from 'i18next'

import axios from 'axios'
import { uniqueId } from 'lodash'
import javascriptLogo from './javascript.svg'
import view from './view.js'
import ru from './locales/ru.js'

import parseRss from './parseRss.js'

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
  })

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
                      aria-label="url"
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

<div class="modal fade" id="modal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog mt-3">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-start w-100" id="modal-title"></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${i18next.t('close')}"></button>
      </div>
      <div class="modal-body text-start" id="modal-body"></div>
      <div class="modal-footer">
        <a href="#" target="_blank" class="btn btn-primary" id="modal-full-article">${i18next.t('readFull')}</a>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18next.t('close')}</button>
      </div>
    </div>
  </div>
</div> 

        <div class="container mt-5">
        <div class="row">
          <div class="col-md-6" id="posts"></div>
          <div class="col-md-6" id="feeds"></div>
        </div>
      </div>
    </div>
  `

  const elements = {
    form: document.querySelector('#rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('#feedback'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
    successMessage: document.querySelector('#success-message'),
    modal: {
      title: document.querySelector('#modal-title'),
      body: document.querySelector('#modal-body'),
      fullArticle: document.querySelector('#modal-full-article'),
    },
  }

  const state = {
    feeds: [],
    posts: [],
    form: {
      status: null,
      error: null,
    },
    readPosts: new Set(),
  }

  const getValidationSchema = (feedUrls) => yup.string()
    .url()
    .notOneOf(feedUrls)
    .required()

  const watchedState = onChange(state, view(elements, state), { isShallow: false })

  const updateFeedsPeriodically = () => {
    const { feeds, posts } = watchedState

    const promises = feeds.map((feed) => axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        const { posts: newPosts } = parseRss(response.data.contents)
        const existingLinks = new Set(posts.map((post) => post.link))
        const freshPosts = newPosts
          .filter((post) => !existingLinks.has(post.link))
          .map((post) => ({
            ...post,
            id: uniqueId(),
            feedId: feed.id,
          }))

        if (freshPosts.length > 0) {
          watchedState.posts = [...watchedState.posts, ...freshPosts]
        }
      })
      .catch((error) => {
        console.error('Ошибка при обновлении фида:', error)
      }))

    Promise.all(promises)
      .finally(() => {
        setTimeout(updateFeedsPeriodically, 5000)
      })
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const url = elements.input.value.trim()

    watchedState.form.error = null
    watchedState.form.status = null

    const schema = getValidationSchema(state.feeds.map((f) => f.url))

    schema.validate(url)
      .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`))
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents)
        const feedId = uniqueId()

        const preparedFeed = {
          id: feedId,
          title: feed.title,
          description: feed.description,
          url,
        }

        const preparedPosts = posts.map((post) => ({
          ...post,
          id: uniqueId(),
          feedId,
        }))

        watchedState.feeds = [...state.feeds, preparedFeed]
        watchedState.posts = preparedPosts

        watchedState.form.status = 'success'
        elements.successMessage.textContent = i18next.t('success.rssLoaded')

        if (watchedState.feeds.length === 1) {
          updateFeedsPeriodically(watchedState)
        }
      })

      .catch((error) => {
        watchedState.form.status = 'error'
        document.querySelector('#success-message').textContent = ''

        if (error.name === 'ValidationError') {
          watchedState.form.error = error.message
        } else if (error.message === 'ParsingError') {
          watchedState.form.error = i18next.t('errors.parsing')
        } else {
          watchedState.form.error = i18next.t('errors.network')
        }
      })
  })

  elements.postsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
      const postId = e.target.dataset.id
      const post = state.posts.find((p) => p.id === postId)
      if (!post) return

      state.readPosts.add(postId)
      watchedState.readPosts = new Set(state.readPosts)

      elements.modal.title.textContent = post.title
      elements.modal.body.textContent = post.description
      elements.modal.fullArticle.href = post.link
    }
  })
})
