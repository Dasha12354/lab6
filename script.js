// === 1. КНОПКА "НАВЕРХ" ===
const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// === 2. АККОРДЕОН ===
document.querySelectorAll('.accordion-title').forEach(title => {
    title.addEventListener('click', () => {
        const content = title.nextElementSibling;
        const isOpen = content.classList.contains('open');

        // Закрываем все
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.classList.remove('open');
        });

        // Открываем текущий
        if (!isOpen) {
            content.classList.add('open');
        }
    });
});

// === 3. ФИЛЬТРАЦИЯ ГАЛЕРЕИ ===
const filterBtns = document.querySelectorAll('.filters button');
const images = document.querySelectorAll('.gallery img');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;

        images.forEach(img => {
            if (category === 'all' || img.dataset.category === category) {
                img.classList.remove('hidden');
            } else {
                img.classList.add('hidden');
            }
        });
    });
});

// === 4. МОДАЛЬНОЕ ОКНО ===
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.querySelector('.close');

images.forEach(img => {
    img.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalImg.src = img.src;
    });
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
// ===  ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ + localStorage ===
const lightBtn = document.getElementById('lightTheme');
const darkBtn = document.getElementById('darkTheme');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  } else {
    document.body.classList.remove('dark');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  }
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('light'); 
}

lightBtn.addEventListener('click', () => {
  applyTheme('light');
  localStorage.setItem('theme', 'light');
});

darkBtn.addEventListener('click', () => {
  applyTheme('dark');
  localStorage.setItem('theme', 'dark');
});

// === ОТЗЫВЫ С API ===
document.addEventListener('DOMContentLoaded', () => {
  const reviewTextEl = document.getElementById('reviewText');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');
  const refreshBtn = document.getElementById('refreshQuotes');

  let reviews = [];
  let currentIndex = 0;

  // === API ===
  async function fetchQuote() {
    try {
      const res = await fetch('https://programming-quotes-api.herokuapp.com/quotes/random');
      if (!res.ok) throw new Error("Сервер: " + res.status);
      const data = await res.json();
      return `"${data.quote}" — ${data.author}`;
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      return "Отзыв недоступен. Попробуйте позже.";
    }
  }

  // === ЗАГРУЗКА 3 ЦИТАТ ===
  async function loadReviews() {
    reviewTextEl.textContent = "Загрузка отзывов...";
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const promises = Array.from({ length: 3 }, () => fetchQuote());
    const results = await Promise.allSettled(promises);

    reviews = results.map(r => r.status === 'fulfilled' ? r.value : "Отзыв недоступен.");

    currentIndex = 0;
    displayReview();
  }

  // === ОТОБРАЖЕНИЕ ===
  function displayReview() {
    if (reviews.length === 0) {
      reviewTextEl.textContent = "Отзывы недоступны.";
    } else {
      reviewTextEl.textContent = reviews[currentIndex];
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === reviews.length - 1;
    }
  }

  // === ПЕРЕКЛЮЧЕНИЕ ← → ===
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      displayReview();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < reviews.length - 1) {
      currentIndex++;
      displayReview();
    }
  });

  // === ОБНОВИТЬ ===
  refreshBtn.addEventListener('click', loadReviews);

  loadReviews();
});

// === ДИНАМИЧЕСКАЯ ГАЛЕРЕЯ ===
const galleryContainer = document.getElementById('dynamicGallery');

async function loadImages() {
  galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Загрузка изображений...</p>';
  
  const images = [];
  for (let i = 0; i < 6; i++) {
    const img = document.createElement('img');
    img.src = `https://picsum.photos/400/300?random=${Date.now() + i}`;
    img.alt = 'Случайное изображение';
    img.dataset.category = i < 3 ? 'code' : 'design'; // 3 код, 3 дизайн
    img.style.opacity = 0;
    galleryContainer.appendChild(img);
    images.push(img);
  }
  
  // Ждём загрузки всех картинок
  await Promise.all(images.map(img => {
    return new Promise(resolve => {
      img.onload = () => {
        img.style.opacity = 1;
        img.style.transition = 'opacity 0.5s';
        resolve();
      };
    });
  }));
  
  galleryContainer.innerHTML = ''; // убираем "Загрузка"
  images.forEach(img => galleryContainer.appendChild(img));
  
  // Перепривязываем модалку к новым картинкам
  images.forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImg.src = img.src;
    });
  });
}

// Обновляем фильтры для новых картинок
function rebindFilters() {
  const newImages = document.querySelectorAll('#dynamicGallery img');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      newImages.forEach(img => {
        if (category === 'all' || img.dataset.category === category) {
          img.classList.remove('hidden');
        } else {
          img.classList.add('hidden');
        }
      });
    };
  });
}

// Загружаем при старте
loadImages().then(() => {
  rebindFilters();

});







