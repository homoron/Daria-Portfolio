(function () {
  const video = document.getElementById("heroVideo");
  const hero = document.getElementById("inicio");
  const fill = document.getElementById("timelineFill");
  const dot = document.getElementById("timelineDot");
  const railFill = document.getElementById("vfRailFill");
  const railDot = document.getElementById("vfRailDot");
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
    if (railFill) railFill.style.height = `${clamped * 100}%`;
    if (railDot) railDot.style.top = `${clamped * 100}%`;
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
  const thinkSection = document.getElementById("que-pienso");
  const contactSection = document.getElementById("contacto");
  const viewLinks = document.querySelectorAll("[data-view-link]");
  const homeLink = document.querySelector(".nav-links a[href='#inicio']");
  let currentView = "about";
  const workTabs = document.querySelectorAll("[data-work-tab]");
  const projectSources = document.querySelectorAll("[data-project-source]");
  const workChooser = document.querySelector("[data-work-view='index']");
  const projectButtons = document.querySelectorAll("[data-project]");
  const projectDetails = document.querySelectorAll("[data-project-detail]");
  const closeProjectButtons = document.querySelectorAll("[data-close-project]");
  const videoModal = document.querySelector("[data-video-modal]");
  const videoOpen = document.querySelectorAll("[data-video-open]");
  const videoClose = document.querySelector("[data-video-close]");
  const detailVideo = videoModal ? videoModal.querySelector("video") : null;
  const cameraPlayback = document.querySelector("[data-camera-playback]");
  const cameraImage = document.querySelector("[data-camera-image]");
  const cameraTitle = document.querySelector("[data-camera-title]");
  const cameraSubtitle = document.querySelector("[data-camera-subtitle]");
  const cameraCounter = document.querySelector("[data-camera-counter]");
  const cameraTimecode = document.querySelector("[data-camera-timecode]");
  const cameraThumbs = document.querySelector("[data-camera-thumbs]");
  const cameraOpenButtons = document.querySelectorAll("[data-camera-open], [data-camera-play]");
  const previewOverrides = {
    beefeater: "assets/pub-beefeater-text.jpg",
    ecoembes: "assets/pub-ecoembes-text.jpg",
    bruma: "assets/pub-bruma-text.jpg",
    durex: "assets/pub-durex-text.jpg",
    crocs: "assets/pub-crocs-text.jpeg",
    cultura: "assets/pub-cultura-text.jpeg",
    cinecas: "assets/pub-cinecas-text.jpeg",
    lafede: "assets/lafede-collage.jpg",
    villarreal: "assets/villarreal-collage.jpg",
    kachevnitsa: "assets/film-kachevnitsa-collage.jpg",
    instant36: "assets/film-instant36-collage.jpg",
    mejorno: "assets/film-mejorno-collage.jpg",
    musidora: "assets/film-musidora-collage.jpg",
    fahrenheit: "assets/film-fahrenheit-collage.jpg"
  };
  let activeProjects = [];
  let activeProjectIndex = 0;
  let activeWorkPanel = "publicidad";
  let wheelLocked = false;
  let wheelUnlockTimer = 0;
  let touchStartY = 0;
  let touchCurrentY = 0;

  function showView(view, shouldScroll = true) {
    if (!aboutSection || !workSection) return;
    const sections = { about: aboutSection, work: workSection, think: thinkSection, contact: contactSection };
    if (!sections[view]) return;
    Object.keys(sections).forEach((name) => {
      if (sections[name]) sections[name].classList.toggle("is-hidden", name !== view);
    });
    currentView = view;
    updateNavSpy();
    if (view === "work") {
      closeProject();
      workSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        sectionVideo.play().catch(() => {});
      });
    }
    if (view === "think") {
      closePost();
      thinkSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        sectionVideo.play().catch(() => {});
      });
    }
    if (view === "contact") {
      contactSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        sectionVideo.play().catch(() => {});
      });
    }
    if (shouldScroll) {
      sections[view].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function showWorkPanel(panelName) {
    workTabs.forEach((tab) => {
      const isActive = tab.dataset.workTab === panelName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    const source = Array.from(projectSources).find((panel) => panel.dataset.projectSource === panelName);
    if (!source) return;
    activeWorkPanel = panelName;

    const seen = new Set();
    activeProjects = Array.from(source.querySelectorAll("[data-project]"))
      .filter((button) => {
        if (seen.has(button.dataset.project)) return false;
        seen.add(button.dataset.project);
        return true;
      })
      .map((button) => {
        const title = button.querySelector("span b")?.textContent.trim() || button.dataset.project;
        const subtitle = button.querySelector("span small")?.textContent.trim() || "Proyecto audiovisual";
        const image = previewOverrides[button.dataset.project] || button.querySelector("img")?.getAttribute("src");
        return { id: button.dataset.project, title, subtitle, image };
      });

    activeProjectIndex = 0;
    renderCameraThumbnails();
    renderCameraProject(false);
  }

  function renderCameraThumbnails() {
    if (!cameraThumbs) return;
    cameraThumbs.replaceChildren();
    activeProjects.forEach((project, index) => {
      const button = document.createElement("button");
      const image = document.createElement("img");
      const number = document.createElement("span");
      button.type = "button";
      button.className = "camera-thumb";
      button.setAttribute("aria-label", `Seleccionar ${project.title}`);
      button.dataset.cameraIndex = String(index);
      image.src = project.image;
      image.alt = "";
      number.textContent = String(index + 1).padStart(2, "0");
      button.append(image, number);
      button.addEventListener("click", () => {
        activeProjectIndex = index;
        renderCameraProject();
      });
      cameraThumbs.append(button);
    });
  }

  function renderCameraProject(animate = true) {
    const project = activeProjects[activeProjectIndex];
    if (!project || !cameraImage) return;
    if (animate) {
      cameraPlayback?.classList.remove("is-advancing");
      void cameraPlayback?.offsetWidth;
      cameraPlayback?.classList.add("is-advancing");
    }
    cameraImage.src = project.image;
    cameraImage.alt = project.title;
    cameraTitle.textContent = project.title;
    cameraSubtitle.textContent = project.subtitle;
    cameraCounter.textContent = `${String(activeProjectIndex + 1).padStart(2, "0")} / ${String(activeProjects.length).padStart(2, "0")}`;
    cameraTimecode.textContent = `00:00:${String(activeProjectIndex * 7 + 3).padStart(2, "0")}`;
    cameraThumbs?.querySelectorAll(".camera-thumb").forEach((thumb, index) => {
      const isActive = index === activeProjectIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
      if (isActive) scrollCameraThumbIntoView(thumb, animate);
    });
  }

  function scrollCameraThumbIntoView(thumb, animate) {
    if (!cameraThumbs) return;
    const horizontal = window.getComputedStyle(cameraThumbs).flexDirection === "row";
    const start = horizontal ? thumb.offsetLeft : thumb.offsetTop;
    const size = horizontal ? thumb.offsetWidth : thumb.offsetHeight;
    const viewportSize = horizontal ? cameraThumbs.clientWidth : cameraThumbs.clientHeight;
    const current = horizontal ? cameraThumbs.scrollLeft : cameraThumbs.scrollTop;
    let target = current;
    if (start < current) target = start;
    if (start + size > current + viewportSize) target = start + size - viewportSize;
    cameraThumbs.scrollTo({
      left: horizontal ? target : cameraThumbs.scrollLeft,
      top: horizontal ? cameraThumbs.scrollTop : target,
      behavior: animate ? "smooth" : "auto"
    });
  }

  function stepCamera(direction) {
    const nextIndex = activeProjectIndex + direction;
    if (nextIndex < 0 || nextIndex >= activeProjects.length) return false;
    activeProjectIndex = nextIndex;
    renderCameraProject();
    return true;
  }

  function openCameraProject() {
    const project = activeProjects[activeProjectIndex];
    if (project) openProject(project.id);
  }

  function selectCameraProject(project) {
    const source = Array.from(projectSources).find((panel) => panel.querySelector(`[data-project="${project}"]`));
    if (!source) return false;
    if (source.dataset.projectSource !== activeWorkPanel) showWorkPanel(source.dataset.projectSource);
    const projectIndex = activeProjects.findIndex((item) => item.id === project);
    if (projectIndex < 0) return false;
    activeProjectIndex = projectIndex;
    renderCameraProject(false);
    return true;
  }

  function openProject(project, updateHistory = true) {
    const activeDetail = document.querySelector(`[data-project-detail="${project}"]`);
    if (!workChooser || !activeDetail) return;
    if (updateHistory) {
      history.pushState(
        { portfolioRoute: "project", project, panel: activeWorkPanel, parentHash: "#que-hago" },
        "",
        `#que-hago/${encodeURIComponent(project)}`
      );
    }
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
    // The detail was just revealed; let any reel inside recompute the padding
    // that centers its first/last frame now that its frames have real heights.
    window.dispatchEvent(new Event("resize"));
  }

  function closeProject() {
    if (workChooser) workChooser.classList.remove("is-hidden");
    projectDetails.forEach((detail) => {
      detail.querySelectorAll("video").forEach((projectVideo) => projectVideo.pause());
    });
    projectDetails.forEach((detail) => detail.classList.add("is-hidden"));
    closeVideoModal();
  }

  function returnFromProject() {
    if (history.state?.portfolioRoute === "project" && history.state?.parentHash) {
      history.back();
      return;
    }
    history.replaceState({ portfolioRoute: "view", view: "work" }, "", "#que-hago");
    closeProject();
    workSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
      const view = link.dataset.viewLink;
      if (view === "about" || view === "work" || view === "think" || view === "contact") {
        event.preventDefault();
        history.pushState({ portfolioRoute: "view", view }, "", link.getAttribute("href"));
        showView(view);
      }
    });
  });

  function updateNavSpy() {
    const inHero = hero.getBoundingClientRect().bottom > window.innerHeight * 0.5;
    if (homeLink) homeLink.classList.toggle("is-active", inHero);
    viewLinks.forEach((link) => {
      link.classList.toggle("is-active", !inHero && link.dataset.viewLink === currentView);
    });
  }

  window.addEventListener("scroll", updateNavSpy, { passive: true });

  const reelDesktop = window.matchMedia("(min-width: 761px)");

  document.querySelectorAll("[data-reel]").forEach((reel) => {
    const strip = reel.querySelector(".reel-strip");
    const frames = Array.from(reel.querySelectorAll(".reel-frame"));
    const captions = Array.from(reel.querySelectorAll(".reel-caption"));
    const dots = Array.from(reel.querySelectorAll(".reel-dots span"));
    if (!frames.length) return;

    // Pad the strip so the first and last frames can rest centered against
    // the sticky caption, regardless of each frame's aspect ratio.
    let padCache = "";
    function padStrip() {
      if (!strip) return;
      if (!reelDesktop.matches) {
        if (padCache !== "off") {
          strip.style.paddingTop = "";
          strip.style.paddingBottom = "";
          padCache = "off";
        }
        return;
      }
      const first = frames[0].getBoundingClientRect().height;
      // Skip while hidden/not laid out yet, so we never write bogus padding
      // computed against a zero-height frame.
      if (first < 1) return;
      const vh = window.innerHeight;
      const last = frames[frames.length - 1].getBoundingClientRect().height;
      const top = `${Math.max(16, (vh - first) / 2)}px`;
      const bottom = `${Math.max(16, (vh - last) / 2)}px`;
      const key = top + "|" + bottom;
      if (key === padCache) return;
      strip.style.paddingTop = top;
      strip.style.paddingBottom = bottom;
      padCache = key;
    }

    function updateReel() {
      if (!frames[0].offsetParent) return;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestDist = Infinity;
      frames.forEach((frame, index) => {
        const rect = frame.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      frames.forEach((frame, index) => frame.classList.toggle("is-active", index === best));
      captions.forEach((caption, index) => caption.classList.toggle("is-active", index === best));
      dots.forEach((dot, index) => dot.classList.toggle("is-active", index === best));
    }

    function refreshReel() {
      padStrip();
      updateReel();
    }

    window.addEventListener("scroll", refreshReel, { passive: true });
    window.addEventListener("resize", refreshReel);
    reel.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", refreshReel, { once: true });
    });
    // Recompute when the reel becomes visible (project opened) or a frame
    // resizes, so the padding that centers the first/last frame is correct.
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => refreshReel());
      ro.observe(frames[0]);
      ro.observe(frames[frames.length - 1]);
    }
    refreshReel();
  });

  const postButtons = document.querySelectorAll("[data-post]");
  const postDetails = document.querySelectorAll("[data-post-detail]");
  const thinkChooser = document.querySelector("[data-think-view='index']");
  const closePostButtons = document.querySelectorAll("[data-close-post]");

  function openPost(post, updateHistory = true) {
    const activePost = document.querySelector(`[data-post-detail="${post}"]`);
    if (!thinkChooser || !activePost) return;
    if (updateHistory) {
      history.pushState(
        { portfolioRoute: "post", post, parentHash: "#que-pienso" },
        "",
        `#que-pienso/${encodeURIComponent(post)}`
      );
    }
    thinkChooser.classList.add("is-hidden");
    postDetails.forEach((detail) => {
      detail.classList.toggle("is-hidden", detail.dataset.postDetail !== post);
    });
    thinkSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closePost() {
    if (thinkChooser) thinkChooser.classList.remove("is-hidden");
    postDetails.forEach((detail) => detail.classList.add("is-hidden"));
  }

  function returnFromPost() {
    if (history.state?.portfolioRoute === "post" && history.state?.parentHash) {
      history.back();
      return;
    }
    history.replaceState({ portfolioRoute: "view", view: "think" }, "", "#que-pienso");
    closePost();
    thinkSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  postButtons.forEach((button) => {
    button.addEventListener("click", () => openPost(button.dataset.post));
  });

  closePostButtons.forEach((button) => {
    button.addEventListener("click", returnFromPost);
  });

  workTabs.forEach((tab) => {
    tab.addEventListener("click", () => showWorkPanel(tab.dataset.workTab));
  });

  cameraOpenButtons.forEach((button) => button.addEventListener("click", openCameraProject));

  if (cameraPlayback) {
    cameraPlayback.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) < 12) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const canStep = direction > 0
        ? activeProjectIndex < activeProjects.length - 1
        : activeProjectIndex > 0;

      if (wheelLocked) {
        event.preventDefault();
        event.stopPropagation();
        window.clearTimeout(wheelUnlockTimer);
        wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, 180);
        return;
      }

      if (!canStep) return;
      event.preventDefault();
      event.stopPropagation();
      stepCamera(direction);
      wheelLocked = true;
      window.clearTimeout(wheelUnlockTimer);
      wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, 180);
    }, { passive: false });

    cameraPlayback.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      if (stepCamera(direction)) event.preventDefault();
    });

    cameraPlayback.addEventListener("touchstart", (event) => {
      touchStartY = event.changedTouches[0].clientY;
      touchCurrentY = touchStartY;
    }, { passive: true });

    cameraPlayback.addEventListener("touchmove", (event) => {
      touchCurrentY = event.changedTouches[0].clientY;
      const direction = touchStartY - touchCurrentY > 0 ? 1 : -1;
      const canStep = direction > 0
        ? activeProjectIndex < activeProjects.length - 1
        : activeProjectIndex > 0;
      if (canStep) event.preventDefault();
    }, { passive: false });

    cameraPlayback.addEventListener("touchend", (event) => {
      const distance = touchStartY - event.changedTouches[0].clientY;
      if (Math.abs(distance) > 48) stepCamera(distance > 0 ? 1 : -1);
    }, { passive: true });
  }

  projectButtons.forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.project));
  });

  closeProjectButtons.forEach((button) => {
    button.addEventListener("click", returnFromProject);
  });

  videoOpen.forEach((button) => {
    button.addEventListener("click", openVideoModal);
  });

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

  showWorkPanel("publicidad");

  function applyPortfolioRoute(shouldScroll = true) {
    const hash = decodeURIComponent(window.location.hash || "");
    if (hash.startsWith("#que-hago/")) {
      const project = hash.slice("#que-hago/".length);
      showView("work", false);
      if (selectCameraProject(project)) openProject(project, false);
      return;
    }
    if (hash === "#que-hago") {
      showView("work", shouldScroll);
      return;
    }
    if (hash.startsWith("#que-pienso/")) {
      const post = hash.slice("#que-pienso/".length);
      showView("think", false);
      openPost(post, false);
      return;
    }
    if (hash === "#que-pienso") {
      showView("think", shouldScroll);
      return;
    }
    if (hash === "#contacto") {
      showView("contact", shouldScroll);
      return;
    }
    if (hash === "#quien-soy") {
      showView("about", shouldScroll);
      return;
    }
    showView("about", false);
  }

  window.addEventListener("popstate", () => applyPortfolioRoute(true));
  applyPortfolioRoute(true);
})();
