(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.getElementById('counter');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressBar = document.getElementById('progress-bar');
  const dotsContainer = document.getElementById('slide-dots');
  let current = 0;
  let isAnimating = false;

  // ドットインジケーターを生成
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', `スライド ${i + 1} へ`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];

  function goTo(index, direction) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const dir = direction !== undefined ? direction : (index > current ? 1 : -1);
    const prev = current;
    current = Math.max(0, Math.min(index, slides.length - 1));

    // 退場アニメーション
    slides[prev].style.transition = 'opacity 0.38s ease, transform 0.38s ease';
    slides[prev].style.opacity = '0';
    slides[prev].style.transform = dir > 0 ? 'translateX(-60px)' : 'translateX(60px)';
    slides[prev].style.pointerEvents = 'none';

    // 入場の初期位置
    slides[current].style.transition = 'none';
    slides[current].style.transform = dir > 0 ? 'translateX(60px)' : 'translateX(-60px)';
    slides[current].style.opacity = '0';
    slides[current].classList.add('active');

    // 次フレームで入場アニメーション
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slides[current].style.transition = 'opacity 0.38s ease, transform 0.38s ease';
        slides[current].style.opacity = '1';
        slides[current].style.transform = 'translateX(0)';
        slides[current].style.pointerEvents = 'auto';
      });
    });

    setTimeout(() => {
      slides[prev].classList.remove('active');
      slides[prev].style.transform = 'translateX(60px)';
      slides[prev].style.opacity = '0';
      isAnimating = false;
    }, 420);

    // UI更新
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === slides.length - 1;

    // プログレスバー
    if (progressBar) {
      const pct = slides.length > 1 ? (current / (slides.length - 1)) * 100 : 100;
      progressBar.style.width = pct + '%';
    }

    // ドット更新
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1, -1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1, 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') goTo(current + 1, 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')                     goTo(current - 1, -1);
  });

  // スワイプ対応
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1, dx < 0 ? 1 : -1);
  });

  // 初期化
  if (slides.length > 0) {
    slides[0].classList.add('active');
    slides[0].style.opacity = '1';
    slides[0].style.transform = 'translateX(0)';
    slides[0].style.pointerEvents = 'auto';
  }
  if (counter) counter.textContent = `1 / ${slides.length}`;
  if (btnPrev) btnPrev.disabled = true;
  if (progressBar) progressBar.style.width = '0%';
  if (dots.length > 0) dots[0].classList.add('active');
}());
