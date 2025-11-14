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
const reviewTexts = document.querySelectorAll('.review-text');
const refreshBtn = document.getElementById('refreshQuotes');

async function loadQuotes() {
  reviewTexts.forEach(el => el.textContent = 'Загрузка...');
  
  for (let i = 0; i < reviewTexts.length; i++) {
    try {
      const res = await fetch('http://api.quotable.io/random');
      const data = await res.json();
      reviewTexts[i].textContent = data.content;
    } catch (err) {
      reviewTexts[i].textContent = 'Не удалось загрузить цитату 😔';
    }
  }
}

// Загружаем при старте и по кнопке
loadQuotes();
refreshBtn.addEventListener('click', loadQuotes);

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
