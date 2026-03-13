const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPath) {
    link.classList.add('active');
  }
});

const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((el) => observer.observe(el));
}

const carousels = document.querySelectorAll('.js-carousel');
carousels.forEach((carousel) => {
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');

  if (!viewport || !track || !prev || !next) return;

  const getStep = () => {
    const firstItem = track.querySelector('.carousel-item');
    if (!firstItem) return viewport.clientWidth;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return firstItem.getBoundingClientRect().width + gap;
  };

  const updateButtons = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
    prev.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft >= maxScroll;
  };

  prev.addEventListener('click', () => {
    viewport.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    viewport.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  viewport.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateButtons);
  }, { passive: true });

  window.addEventListener('resize', updateButtons);
  updateButtons();
});

document.querySelectorAll('.year').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const franchiseForm = document.querySelector('.js-franchise-form');
if (franchiseForm) {
  const note = franchiseForm.querySelector('.form-note');
  const preview = franchiseForm.querySelector('.form-preview');
  const copyBtn = franchiseForm.querySelector('.form-copy-btn');
  const vkButton = franchiseForm.querySelector('.form-vk-btn');
  let preparedRequest = '';

  const setNote = (text, isError = false) => {
    if (!note) return;
    note.textContent = text;
    note.classList.toggle('error', isError);
  };

  const getFieldValue = (name) => {
    const field = franchiseForm.elements[name];
    if (!field || typeof field.value !== 'string') return '';
    return field.value.trim();
  };

  const buildRequestText = ({ name, city, phone, budget, comment }) => {
    const lines = [
      'Заявка на франшизу RUNA Cyber Club',
      `Имя: ${name}`,
      `Город: ${city}`,
      `Телефон: ${phone}`,
      budget ? `Бюджет: ${budget}` : 'Бюджет: не указан',
      comment ? `Комментарий: ${comment}` : 'Комментарий: нет',
    ];

    return lines.join('\n');
  };

  franchiseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = {
      name: getFieldValue('name'),
      city: getFieldValue('city'),
      phone: getFieldValue('phone'),
      budget: getFieldValue('budget'),
      comment: getFieldValue('comment'),
    };

    const missingFields = [];
    if (!formData.name) missingFields.push('Имя');
    if (!formData.city) missingFields.push('Город');
    if (!formData.phone) missingFields.push('Телефон');

    if (missingFields.length) {
      setNote(`Заполните обязательные поля: ${missingFields.join(', ')}.`, true);
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setNote('Проверьте телефон: должно быть не меньше 10 цифр.', true);
      return;
    }

    const consent = franchiseForm.elements.consent;
    if (consent && !consent.checked) {
      setNote('Нужно подтвердить согласие на обработку данных.', true);
      return;
    }

    preparedRequest = buildRequestText(formData);

    if (preview) {
      preview.hidden = false;
      preview.textContent = preparedRequest;
    }

    if (copyBtn) {
      copyBtn.disabled = false;
    }

    setNote('Заявка подготовлена. Скопируйте текст и отправьте его в сообщения VK.');
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!preparedRequest) return;

      try {
        await navigator.clipboard.writeText(preparedRequest);
        setNote('Текст заявки скопирован. Теперь откройте сообщения VK и вставьте его.');
      } catch (error) {
        setNote('Не удалось скопировать автоматически. Скопируйте текст из блока ниже вручную.', true);
      }
    });
  }

  if (vkButton) {
    vkButton.addEventListener('click', () => {
      if (preparedRequest) {
        setNote('Вставьте подготовленный текст в диалог с RUNA в VK.');
      }
    });
  }

  franchiseForm.addEventListener('input', () => {
    if (!preparedRequest) return;

    preparedRequest = '';
    if (copyBtn) {
      copyBtn.disabled = true;
    }
    if (preview) {
      preview.hidden = true;
      preview.textContent = '';
    }
    setNote('Поля изменены. Нажмите «Сформировать заявку», чтобы обновить текст.');
  });
}
