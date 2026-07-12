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
  const thinkSection = document.getElementById("que-pienso");
  const contactSection = document.getElementById("contacto");
  const viewLinks = document.querySelectorAll("[data-view-link]");
  const workTabs = document.querySelectorAll("[data-work-tab]");
  const projectSources = document.querySelectorAll("[data-project-source]");
  const workChooser = document.querySelector("[data-work-view='index']");
  const projectButtons = document.querySelectorAll("[data-project]");
  const projectDetails = document.querySelectorAll("[data-project-detail]");
  const closeProjectButtons = document.querySelectorAll("[data-close-project]");
  const videoModal = document.querySelector("[data-video-modal]");
  const videoOpen = document.querySelector("[data-video-open]");
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
    bruma: "assets/bruma-hero.jpg",
    durex: "assets/durex-hero.jpg",
    crocs: "assets/crocs-hero.png",
    cultura: "assets/cultura-hero.png",
    cinecas: "assets/cinecas-seats.jpg",
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
  let wheelLocked = false;
  let touchStartY = 0;

  function showView(view, shouldScroll = true) {
    if (!aboutSection || !workSection) return;
    const sections = { about: aboutSection, work: workSection, think: thinkSection, contact: contactSection };
    if (!sections[view]) return;
    Object.keys(sections).forEach((name) => {
      if (sections[name]) sections[name].classList.toggle("is-hidden", name !== view);
    });
    viewLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.viewLink === view));
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
    workTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.workTab === panelName));
    const source = Array.from(projectSources).find((panel) => panel.dataset.projectSource === panelName);
    if (!source) return;

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
      if (isActive) thumb.scrollIntoView({ block: "nearest", behavior: animate ? "smooth" : "auto" });
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
      const view = link.dataset.viewLink;
      if (view === "about" || view === "work" || view === "think" || view === "contact") {
        event.preventDefault();
        history.replaceState(null, "", link.getAttribute("href"));
        showView(view);
      }
    });
  });

  const postButtons = document.querySelectorAll("[data-post]");
  const postDetails = document.querySelectorAll("[data-post-detail]");
  const thinkChooser = document.querySelector("[data-think-view='index']");
  const closePostButtons = document.querySelectorAll("[data-close-post]");

  function openPost(post) {
    const activePost = document.querySelector(`[data-post-detail="${post}"]`);
    if (!thinkChooser || !activePost) return;
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

  postButtons.forEach((button) => {
    button.addEventListener("click", () => openPost(button.dataset.post));
  });

  closePostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closePost();
      thinkSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  workTabs.forEach((tab) => {
    tab.addEventListener("click", () => showWorkPanel(tab.dataset.workTab));
  });

  cameraOpenButtons.forEach((button) => button.addEventListener("click", openCameraProject));

  if (cameraPlayback) {
    cameraPlayback.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) < 12 || wheelLocked) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      if (!stepCamera(direction)) return;
      event.preventDefault();
      wheelLocked = true;
      window.setTimeout(() => { wheelLocked = false; }, 360);
    }, { passive: false });

    cameraPlayback.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      if (stepCamera(direction)) event.preventDefault();
    });

    cameraPlayback.addEventListener("touchstart", (event) => {
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    cameraPlayback.addEventListener("touchend", (event) => {
      const distance = touchStartY - event.changedTouches[0].clientY;
      if (Math.abs(distance) > 48) stepCamera(distance > 0 ? 1 : -1);
    }, { passive: true });
  }

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
  } else if (window.location.hash === "#que-pienso") {
    showView("think", true);
  } else if (window.location.hash === "#contacto") {
    showView("contact", true);
  } else {
    showView("about", false);
  }

  showWorkPanel("publicidad");
})();
