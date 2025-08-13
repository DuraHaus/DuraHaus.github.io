<script>
// === DuraHaus Additions (carousel + gallery modal + footer year) ===
(function(){
  // CAROUSEL: enhance any container that already groups multiple images for a service.
  // Strategy: locate blocks whose id/class contains 'service' and have >1 <img>, then wrap them.
  function makeCarousel(container, imgs){
    if (!imgs || imgs.length < 2) return;
    // Skip if already processed
    if (container.querySelector('.carousel')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'carousel';
    wrapper.setAttribute('data-carousel', '');

    const prev = document.createElement('button');
    prev.className = 'carousel-btn prev';
    prev.setAttribute('aria-label', 'Previous image');
    prev.setAttribute('data-prev','');
    prev.textContent = '‹';

    const next = document.createElement('button');
    next.className = 'carousel-btn next';
    next.setAttribute('aria-label', 'Next image');
    next.setAttribute('data-next','');
    next.textContent = '›';

    const track = document.createElement('div');
    track.className = 'carousel-track';
    track.setAttribute('data-track','');

    // Move existing images into track
    imgs.forEach(img => {
      img.setAttribute('loading','lazy');
      track.appendChild(img);
    });

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('data-dots','');

    wrapper.appendChild(prev);
    wrapper.appendChild(track);
    wrapper.appendChild(next);
    wrapper.appendChild(dots);

    // Replace original images with wrapper
    container.appendChild(wrapper);
  }

  // Find candidate service blocks
  const candidates = [];
  document.querySelectorAll('[class*="service"], [id*="service"]').forEach(sec => {
    const imgs = Array.from(sec.querySelectorAll('img')).filter(i=>!i.closest('.carousel'));
    if (imgs.length >= 2) {
      const firstThree = imgs.slice(0,3);
      let common = firstThree[0].parentElement;
      while (common && !firstThree.every(i => common.contains(i))) {
        common = common.parentElement;
      }
      const host = (common && common !== document.body) ? common : sec;
      candidates.push({host, imgs: firstThree});
    }
  });

  candidates.forEach(({host, imgs})=> makeCarousel(host, imgs));

  // Initialize behavior for all carousels (including ones added manually)
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach((c)=>{
    const track = c.querySelector('[data-track]');
    const slides = [...track.children];
    const prev = c.querySelector('[data-prev]');
    const next = c.querySelector('[data-next]');
    const dotsWrap = c.querySelector('[data-dots]');
    let i = 0, startX = 0, deltaX = 0, isDragging = false;

    slides.forEach((_, idx)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide '+(idx+1));
      b.addEventListener('click', ()=>go(idx));
      dotsWrap.appendChild(b);
    });

    function update(){
      track.style.transform = `translateX(${i * -100}%)`;
      [...dotsWrap.children].forEach((d, di)=> d.setAttribute('aria-current', di===i));
      if (prev) prev.style.visibility = (i===0)?'hidden':'visible';
      if (next) next.style.visibility = (i===slides.length-1)?'hidden':'visible';
    }
    function go(n){ i = Math.max(0, Math.min(slides.length-1, n)); update(); }
    function nextSlide(){ go(i+1); }
    function prevSlide(){ go(i-1); }

    prev && prev.addEventListener('click', prevSlide);
    next && next.addEventListener('click', nextSlide);

    // touch / drag
    track.addEventListener('touchstart', onStart, {passive:true});
    track.addEventListener('mousedown', onStart);

    function onStart(e){
      isDragging = true;
      startX = getX(e);
      deltaX = 0;
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchend', onEnd);
      document.addEventListener('mouseup', onEnd);
    }
    function onMove(e){
      if(!isDragging) return;
      deltaX = getX(e) - startX;
      track.style.transition = 'none';
      const pct = (deltaX / track.clientWidth) * 100;
      track.style.transform = `translateX(calc(${i * -100}% + ${pct}%))`;
      e.preventDefault?.();
    }
    function onEnd(){
      track.style.transition = '';
      if(Math.abs(deltaX) > track.clientWidth * 0.15){
        if(deltaX < 0) nextSlide(); else prevSlide();
      } else {
        update();
      }
      isDragging = false;
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('mouseup', onEnd);
    }
    function getX(e){ return (e.touches && e.touches[0]?.clientX) ?? e.clientX; }

    update();
  });

  // GALLERY MODAL
  (function(){
    const grid = document.getElementById('projectGallery');
    if(!grid) return;
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = modal.querySelector('.modal-close');

    grid.addEventListener('click', (e)=>{
      const img = e.target.closest('img');
      if(!img) return;
      modalImg.src = img.src;
      modalImg.alt = img.alt || 'Project image';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });

    function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  })();

  // FOOTER year
  const y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }
})();
</script>
