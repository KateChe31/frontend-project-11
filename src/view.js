export default (elements) => (path, value) => {
  const { input, feedback, form } = elements;

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
};
