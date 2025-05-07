const renderFeeds = (feeds, container) => {
  const feedsContainer = container;
  feedsContainer.innerHTML = '<h2>Фиды</h2>';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-3');
  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    ul.append(li);
  });
  feedsContainer.append(ul);
};

const renderPosts = (posts, container) => {
  const postsContainer = container;
  postsContainer.innerHTML = '<h2>Посты</h2>';
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.textContent = title;
    a.classList.add('fw-bold', 'text-decoration-underline');
    li.append(a);
    ul.append(li);
  });
  postsContainer.append(ul);
};

export default (elements, state) => (path, value) => {
  const {
    input, feedback, form, feedsContainer, postsContainer,
  } = elements;

  if (path === 'form.error') {
    input.classList.toggle('is-invalid', !!value);
    feedback.textContent = value || '';
  }

  if (path === 'form.status' && value === 'success') {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    form.reset();
    input.focus();
  }

  if (path.startsWith('feeds')) {
    renderFeeds(state.feeds, feedsContainer);
  }

  if (path.startsWith('posts')) {
    renderPosts(state.posts, postsContainer);
  }
};
