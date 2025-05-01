export default (elements, state) => (path, value) => {
    if (path === 'form.error') {
      const input = elements.input;
      const feedback = elements.feedback;
  
      input.classList.toggle('is-invalid', !!value);
      feedback.textContent = value || '';
    }
  
    if (path === 'form.status' && value === 'success') {
      elements.input.classList.remove('is-invalid');
      elements.feedback.textContent = '';
      elements.form.reset();
      elements.input.focus();
    }
  };
