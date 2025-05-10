const buildFeeds = (feeds) => {
  const container = document.createElement('div');
  const header = document.createElement('h2');
  header.textContent = 'Фиды';
  container.append(header);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-3');

  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `<h3 class="text-start">${title}</h3><p class="text-start">${description}</p>`;
    ul.append(li);
  });

  container.append(ul);
  return container;
};

const buildPosts = (posts, readPosts) => {
  const container = document.createElement('div');
  const header = document.createElement('h2');
  header.textContent = 'Посты';
  container.append(header);

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach(({ id, title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;

    a.classList.add('d-block', 'text-start');

    if (readPosts.has(id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = 'Просмотр';
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');

    li.append(a);
    li.append(button);
    ul.append(li);
  });

  container.append(ul);
  return container;
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
    const newFeedsEl = buildFeeds(state.feeds);
    feedsContainer.replaceChildren(newFeedsEl);
  }

  if (path.startsWith('posts') || path === 'readPosts') {
    const newPostsEl = buildPosts(state.posts, state.readPosts);
    postsContainer.replaceChildren(newPostsEl);
  }
};
