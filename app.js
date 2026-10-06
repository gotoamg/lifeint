
document.querySelectorAll('.dropdown-wrapper').forEach(function(wrapper) {
  wrapper.addEventListener('mouseenter', function() {
    this.querySelector('.dropdown-menu').style.display = 'block';
  });
  wrapper.addEventListener('mouseleave', function() {
    this.querySelector('.dropdown-menu').style.display = 'none';
  });
});

// Hero slider
(function(){
  var slider = document.querySelector('.hero-slider');
  if (!slider) return;
  var slides = slider.querySelectorAll('.hero-slide');
  var dots = slider.querySelectorAll('.hero-dot');
  if (slides.length <= 1) return;
  var current = 0;
  var speed = parseInt(slider.getAttribute('data-autoplay')) || 5000;
  var paused = false;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = idx % slides.length;
    var content = slides[current].querySelector('.hero-content');
    if (content) { content.style.transition = 'none'; content.style.opacity = '0'; content.style.transform = 'translateY(30px)'; }
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
    if (content) { setTimeout(function(){ content.style.transition = ''; content.style.opacity = ''; content.style.transform = ''; }, 50); }
  }

  window.addEventListener('scroll', function(){
    var scrollY = window.pageYOffset;
    slides.forEach(function(s){ s.style.backgroundPositionY = 'calc(50% + ' + (scrollY * 0.3) + 'px)'; });
  }, { passive: true });

  var timer = setInterval(function(){ if (!paused) goTo(current + 1); }, speed);

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function(){ goTo(i); clearInterval(timer); timer = setInterval(function(){ if (!paused) goTo(current + 1); }, speed); });
  });

  slider.addEventListener('mouseenter', function(){ paused = true; });
  slider.addEventListener('mouseleave', function(){ paused = false; });
})();

// Scroll reveal
(function(){
  var sections = document.querySelectorAll('.section, .section-alt');
  sections.forEach(function(s){ s.classList.add('reveal'); });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        var cards = entry.target.querySelectorAll('.card');
        cards.forEach(function(card, i){
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = 'opacity 0.5s ease ' + (i * 100) + 'ms, transform 0.5s ease ' + (i * 100) + 'ms';
          setTimeout(function(){ card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        });
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(function(s){ observer.observe(s); });
})();
