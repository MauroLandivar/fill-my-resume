let currentLang = 'en';

document.querySelectorAll('.lang-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll('.lang-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('[data-en]').forEach(el => {
      const val = el.dataset[currentLang] || el.dataset.en;
      if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
        el.textContent = val;
      }
    });
  });
});
