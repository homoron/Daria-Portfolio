(function () {
  const video = document.getElementById("heroVideo");
  const hero = document.getElementById("inicio");
  const fill = document.getElementById("timelineFill");
  const dot = document.getElementById("timelineDot");
  const cue = document.querySelector(".scroll-cue");
  const typedGreeting = document.getElementById("typedGreeting");
  const greeting = "Hola. Hello. Ey. Ye com va. Priviet.";
  const compact = window.matchMedia("(max-width: 640px)");

  if (!video || !hero) return;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  let ticking = false;

  function setProgress(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    if (fill) fill.style.width = `${clamped * 100}%`;
    if (dot) dot.style.left = `${clamped * 100}%`;
    updateTypedGreeting(clamped);
  }

  function updateTypedGreeting(progress) {
    if (!typedGreeting) return;
    if (compact.matches) {
      typedGreeting.textContent = greeting;
      return;
    }
    const typeStart = 0.04;
    const typeEnd = 0.72;
    const typeProgress = Math.max(0, Math.min(1, (progress - typeStart) / (typeEnd - typeStart)));
    const visibleChars = Math.round(typeProgress * greeting.length);
    typedGreeting.textContent = greeting.slice(0, visibleChars);
  }

  function updateScrollState() {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    setProgress(progress);
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }

  function playHeroVideo() {
    video.muted = true;
    video.play().catch(() => {});
  }

  video.addEventListener("loadeddata", playHeroVideo);
  video.addEventListener("canplay", playHeroVideo);
  video.load();
  playHeroVideo();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  compact.addEventListener("change", requestTick);
  updateScrollState();

  if (cue) {
    cue.addEventListener("click", () => {
      window.scrollTo({
        top: Math.min(hero.offsetHeight - window.innerHeight, window.innerHeight * 0.9),
        behavior: "smooth"
      });
    });
  }
})();
