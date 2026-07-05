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

  const aboutSection = document.getElementById("quien-soy");
  const workSection = document.getElementById("que-hago");
  const viewLinks = document.querySelectorAll("[data-view-link]");
  const workTabs = document.querySelectorAll("[data-work-tab]");
  const workPanels = document.querySelectorAll("[data-work-panel]");
  const workChooser = document.querySelector("[data-work-view='index']");
  const projectButtons = document.querySelectorAll("[data-project]");
  const projectDetails = document.querySelectorAll("[data-project-detail]");
  const closeProjectButtons = document.querySelectorAll("[data-close-project]");
  const videoModal = document.querySelector("[data-video-modal]");
  const videoOpen = document.querySelector("[data-video-open]");
  const videoClose = document.querySelector("[data-video-close]");
  const detailVideo = videoModal ? videoModal.querySelector("video") : null;

  function showView(view, shouldScroll = true) {
    if (!aboutSection || !workSection) return;
    const isWork = view === "work";
    aboutSection.classList.toggle("is-hidden", isWork);
    workSection.classList.toggle("is-hidden", !isWork);
    viewLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.viewLink === view));
    if (isWork) {
      closeProject();
      workSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        sectionVideo.play().catch(() => {});
      });
    }
    if (shouldScroll) {
      (isWork ? workSection : aboutSection).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function showWorkPanel(panelName) {
    workTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.workTab === panelName));
    workPanels.forEach((panel) => {
      panel.hidden = panel.dataset.workPanel !== panelName;
    });
  }

  function openProject(project) {
    const activeDetail = document.querySelector(`[data-project-detail="${project}"]`);
    if (!workChooser || !activeDetail) return;
    workChooser.classList.add("is-hidden");
    projectDetails.forEach((detail) => {
      detail.classList.toggle("is-hidden", detail.dataset.projectDetail !== project);
    });
    if (activeDetail) {
      activeDetail.querySelectorAll("video[autoplay]").forEach((projectVideo) => {
        projectVideo.play().catch(() => {});
      });
    }
    workSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeProject() {
    if (workChooser) workChooser.classList.remove("is-hidden");
    projectDetails.forEach((detail) => {
      detail.querySelectorAll("video").forEach((projectVideo) => projectVideo.pause());
    });
    projectDetails.forEach((detail) => detail.classList.add("is-hidden"));
    closeVideoModal();
  }

  function openVideoModal() {
    if (!videoModal || !detailVideo) return;
    videoModal.classList.remove("is-hidden");
    videoModal.setAttribute("aria-hidden", "false");
    detailVideo.currentTime = 0;
    detailVideo.play().catch(() => {});
  }

  function closeVideoModal() {
    if (!videoModal || !detailVideo) return;
    videoModal.classList.add("is-hidden");
    videoModal.setAttribute("aria-hidden", "true");
    detailVideo.pause();
  }

  viewLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.dataset.viewLink === "about" || link.dataset.viewLink === "work") {
        event.preventDefault();
        history.replaceState(null, "", link.getAttribute("href"));
        showView(link.dataset.viewLink);
      }
    });
  });

  workTabs.forEach((tab) => {
    tab.addEventListener("click", () => showWorkPanel(tab.dataset.workTab));
  });

  projectButtons.forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.project));
  });

  closeProjectButtons.forEach((button) => {
    button.addEventListener("click", closeProject);
  });

  if (videoOpen) {
    videoOpen.addEventListener("click", openVideoModal);
  }

  if (videoClose) {
    videoClose.addEventListener("click", closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener("click", (event) => {
      if (event.target === videoModal) closeVideoModal();
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeVideoModal();
  });

  if (window.location.hash === "#que-hago") {
    showView("work", true);
  } else {
    showView("about", false);
  }
})();
