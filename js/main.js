// main.js

// Utility to trap keyboard focus inside a modal element
function trapFocus(modal) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([type="hidden"]):not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  const focusableElements = modal.querySelectorAll(focusableSelectors.join(','));
  if (!focusableElements.length) return;
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];
  function handleKey(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      // Do nothing on escape to prevent accidental closing
      e.preventDefault();
    }
  }
  modal.addEventListener('keydown', handleKey);
  // Focus the first element
  firstEl.focus();
  return () => {
    modal.removeEventListener('keydown', handleKey);
  };
}

// Convert a numerical rating to a string of star icons (★ and ☆)
function getStarString(rating) {
  // Round to nearest whole star
  const fullStars = Math.round(rating);
  let stars = '';
  for (let i = 0; i < fullStars && i < 5; i++) {
    stars += '★';
  }
  for (let i = fullStars; i < 5; i++) {
    stars += '☆';
  }
  return stars;
}

function showAgeModal() {
  const modal = document.getElementById('age-modal');
  const main = document.getElementById('main-content');
  if (!modal || !main) return;
  modal.hidden = false;
  main.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'hidden';
  // Trap focus
  const removeTrap = trapFocus(modal);
  const confirmBtn = document.getElementById('confirm-age');
  const declineBtn = document.getElementById('decline-age');
  confirmBtn.addEventListener('click', () => {
    localStorage.setItem('ageConfirmed', 'true');
    modal.hidden = true;
    main.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = '';
    if (removeTrap) removeTrap();
    // move focus to main content
    main.focus();
  });
  declineBtn.addEventListener('click', () => {
    // Redirect to Google if under 18
    window.location.href = 'https://www.google.com';
  });
}

function buildGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  // Use data from global modelsData if available
  if (Array.isArray(window.modelsData)) {
    renderGallery(window.modelsData);
    return;
  }
  // Otherwise fetch from JSON file
  fetch('data/models.json')
    .then((resp) => {
      if (!resp.ok) throw new Error('Network error');
      return resp.json();
    })
    .then((models) => {
      renderGallery(models);
    })
    .catch((err) => {
      // Fallback: if fetch fails (e.g. when running from file:// scheme) use embedded data
      console.warn('Falling back to embedded model data:', err);
      const fallbackModels = [
        {
          name: 'Amber Rose',
          slug: 'amber-rose',
          images: ['amber1.webp'],
          rating: 4.7
        },
        {
          name: 'Bella Leone',
          slug: 'bella-leone',
          images: ['bella1.webp'],
          rating: 4.5
        },
        {
          name: 'Chloe Lynx',
          slug: 'chloe-lynx',
          images: ['chloe1.webp'],
          rating: 4.6
        },
        {
          name: 'Diana Velvet',
          slug: 'diana-velvet',
          images: ['diana1.webp'],
          rating: 4.8
        }
      ];
      renderGallery(fallbackModels);
    });
}

// Render gallery given a list of models
function renderGallery(models) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  models.forEach((model) => {
    const link = document.createElement('a');
    // Link to dynamic profile page
    link.href = `profile.html?slug=${encodeURIComponent(model.slug)}`;
    link.setAttribute('aria-label', `${model.name} profile`);
    // Image
    const img = document.createElement('img');
    const firstImage = Array.isArray(model.images) && model.images.length > 0 ? model.images[0] : '';
    img.src = `images/${firstImage}`;
    // Lazy load images for performance
    img.loading = 'lazy';
    img.alt = `${model.name}`;
    link.appendChild(img);
    // Info overlay
    const info = document.createElement('div');
    info.className = 'card-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = model.name;
    const ratingEl = document.createElement('div');
    ratingEl.className = 'rating';
    const starsEl = document.createElement('span');
    starsEl.className = 'stars';
    const ratingValue = typeof model.rating === 'number' ? model.rating : 0;
    starsEl.textContent = getStarString(ratingValue);
    const scoreEl = document.createElement('span');
    scoreEl.className = 'score';
    scoreEl.textContent = ratingValue.toFixed(1);
    ratingEl.appendChild(starsEl);
    ratingEl.appendChild(scoreEl);
    info.appendChild(nameEl);
    info.appendChild(ratingEl);
    link.appendChild(info);
    gallery.appendChild(link);
  });
}

// Load and render a model profile dynamically
function loadProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;
  // Extract slug from query string
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) return;
  // Check if data is available on the global variable
  if (Array.isArray(window.modelsData)) {
    const model = window.modelsData.find((m) => m.slug === slug);
    if (model) {
      renderProfile(model);
      return;
    }
  }
  // Fetch model data from JSON as a fallback
  fetch('data/models.json')
    .then((resp) => resp.json())
    .then((models) => {
      const model = models.find((m) => m.slug === slug);
      if (!model) throw new Error('Model not found');
      renderProfile(model);
    })
    .catch((err) => {
      console.warn('Falling back to embedded model data for profile:', err);
      // Fallback: replicate fallback models with minimal data
      const fallbackModels = {
        'amber-rose': {
          name: 'Amber Rose',
          age: 23,
          bio: 'Amber is a charismatic model known for her natural beauty and elegant poise. She brings warmth and professionalism to every engagement and loves working with creative teams.',
          tags: ['elegant', 'fun', 'professional'],
          services: ['Companion', 'Photoshoot', 'Event Appearance'],
          locations: ['Mumbai', 'Delhi', 'Jaipur'],
          phone: '+912345678910',
          whatsapp: '+912345678910',
          images: ['amber1.webp', 'amber2.webp'],
          rating: 4.7
        },
        'bella-leone': {
          name: 'Bella Leone',
          age: 25,
          bio: 'Bella embodies grace and sophistication. With years of experience in fashion and corporate events, she has the adaptability to make every occasion memorable.',
          tags: ['sophisticated', 'stylish', 'adaptable'],
          services: ['Runway', 'Corporate Events', 'Promotional'],
          locations: ['Bengaluru', 'Chennai', 'Goa'],
          phone: '+919876543210',
          whatsapp: '+919876543210',
          images: ['bella1.webp', 'bella2.webp'],
          rating: 4.5
        },
        'chloe-lynx': {
          name: 'Chloe Lynx',
          age: 22,
          bio: 'Chloe is energetic and creative, bringing a fresh, dynamic presence to shoots and events. She is passionate about travel and connecting with new people.',
          tags: ['energetic', 'creative', 'dynamic'],
          services: ['Music Videos', 'Commercials', 'Travel Companion'],
          locations: ['Kolkata', 'Pune', 'Udaipur'],
          phone: '+918765432109',
          whatsapp: '+918765432109',
          images: ['chloe1.webp', 'chloe2.webp'],
          rating: 4.6
        },
        'diana-velvet': {
          name: 'Diana Velvet',
          age: 27,
          bio: 'Diana is the embodiment of luxury and refinement. She excels in high‑profile events and upscale gatherings, ensuring a polished and unforgettable experience.',
          tags: ['luxurious', 'refined', 'polished'],
          services: ['Gala Events', 'Fine Dining', 'Exclusive Parties'],
          locations: ['Hyderabad', 'Ahmedabad', 'Chandigarh'],
          phone: '+917654321098',
          whatsapp: '+917654321098',
          images: ['diana1.webp', 'diana2.webp'],
          rating: 4.8
        }
      };
      const model = fallbackModels[slug];
      if (model) {
        renderProfile(model);
      }
    });
}

// Render profile page HTML into container
function renderProfile(model) {
  const container = document.getElementById('profile-content');
  if (!container) return;
  // Clear existing content
  container.innerHTML = '';
  // Build slider container
  const article = document.createElement('article');
  article.className = 'profile';
  const slider = document.createElement('div');
  slider.className = 'slider';
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'slides';
  model.images.forEach((imgName, idx) => {
    const img = document.createElement('img');
    img.src = `images/${imgName}`;
    img.alt = `${model.name} image ${idx + 1}`;
    img.loading = 'lazy';
    if (idx === 0) img.classList.add('active');
    slidesWrapper.appendChild(img);
  });
  slider.appendChild(slidesWrapper);
  // Slider controls
  const prevBtn = document.createElement('button');
  prevBtn.className = 'slider-control prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.textContent = '‹';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'slider-control next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.textContent = '›';
  slider.appendChild(prevBtn);
  slider.appendChild(nextBtn);
  article.appendChild(slider);
  // Contact buttons
  const contactWrapper = document.createElement('div');
  contactWrapper.className = 'contact-buttons';
  const waBtn = document.createElement('a');
  waBtn.href = `https://api.whatsapp.com/send?phone=${model.whatsapp.replace(/[^\d+]/g, '')}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener';
  waBtn.textContent = 'WhatsApp';
  waBtn.setAttribute('aria-label', `WhatsApp ${model.name}`);
  const callBtn = document.createElement('a');
  callBtn.href = `tel:${model.phone.replace(/[^\d+]/g, '')}`;
  callBtn.textContent = 'Call';
  callBtn.setAttribute('aria-label', `Call ${model.name}`);
  contactWrapper.appendChild(waBtn);
  contactWrapper.appendChild(callBtn);
  article.appendChild(contactWrapper);
  // Name and age
  const h2 = document.createElement('h2');
  h2.textContent = model.name;
  article.appendChild(h2);
  const ageP = document.createElement('p');
  ageP.innerHTML = `<strong>Age:</strong> ${model.age}`;
  article.appendChild(ageP);
  // Bio
  const bioP = document.createElement('p');
  bioP.textContent = model.bio;
  article.appendChild(bioP);
  // Tags list
  const tagsHeading = document.createElement('h3');
  tagsHeading.textContent = 'Tags';
  article.appendChild(tagsHeading);
  const tagsList = document.createElement('ul');
  tagsList.className = 'tags';
  model.tags.forEach((tag) => {
    const li = document.createElement('li');
    li.textContent = tag;
    tagsList.appendChild(li);
  });
  article.appendChild(tagsList);
  // Services list
  const servicesHeading = document.createElement('h3');
  servicesHeading.textContent = 'Services';
  article.appendChild(servicesHeading);
  const servicesList = document.createElement('ul');
  servicesList.className = 'services';
  model.services.forEach((serv) => {
    const li = document.createElement('li');
    li.textContent = serv;
    servicesList.appendChild(li);
  });
  article.appendChild(servicesList);
  // Locations list
  const locationsHeading = document.createElement('h3');
  locationsHeading.textContent = 'Locations';
  article.appendChild(locationsHeading);
  const locList = document.createElement('ul');
  locList.className = 'locations';
  model.locations.forEach((loc) => {
    const li = document.createElement('li');
    li.textContent = loc;
    locList.appendChild(li);
  });
  article.appendChild(locList);
  container.appendChild(article);
  // Initialize slider controls and swipe support for this profile
  initSliders();
}

function initSliders() {
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.slides img');
    const prevBtn = slider.querySelector('.slider-control.prev');
    const nextBtn = slider.querySelector('.slider-control.next');
    if (slides.length === 0) return;
    let index = 0;
    function showSlide(i) {
      slides.forEach((s) => s.classList.remove('active'));
      slides[i].classList.add('active');
    }
    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }
    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    }
    // Show first slide
    showSlide(index);
    // Auto-scroll interval
    let intervalId = setInterval(nextSlide, 5000);
    // Utility to restart auto-scroll after manual interaction
    function restartInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(nextSlide, 5000);
    }
    // Add control listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartInterval();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartInterval();
      });
    }
    // Add swipe support for touch devices
    let startX = null;
    slider.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX;
      }
      // Pause auto scroll on touch
      clearInterval(intervalId);
    });
    slider.addEventListener('touchend', (e) => {
      if (startX !== null && e.changedTouches && e.changedTouches.length > 0) {
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;
        const threshold = 30; // minimum swipe distance
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            // swipe right -> previous slide
            prevSlide();
          } else {
            // swipe left -> next slide
            nextSlide();
          }
        }
      }
      startX = null;
      // Restart auto scroll
      restartInterval();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Age confirmation
  if (localStorage.getItem('ageConfirmed') === 'true') {
    // Already confirmed; ensure modal hidden and main accessible
    const modal = document.getElementById('age-modal');
    const main = document.getElementById('main-content');
    if (modal) modal.hidden = true;
    if (main) main.setAttribute('aria-hidden', 'false');
  } else {
    showAgeModal();
  }
  // Build gallery on home page
  buildGallery();
  // Init sliders on profile pages
  initSliders();
  // Load dynamic model profile if present
  loadProfile();
});
