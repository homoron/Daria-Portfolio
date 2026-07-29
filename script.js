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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!video || !hero) return;

  // ---- Arranque de los vídeos de fondo ----
  // iOS solo reproduce solo si el vídeo va silenciado y en línea, y aun así
  // rechaza el play() cuando el elemento todavía no tiene datos o el teléfono
  // está en modo de bajo consumo. Antes se llamaba a play() una sola vez y el
  // fallo se descartaba en silencio, así que en iPhone el fondo se quedaba
  // congelado. Ahora cada intento se reintenta cuando llegan los datos y, como
  // último recurso, al primer gesto del visitante.

  const FONDOS = ".hero-video, .about-smoke video, .work-smoke video";
  const reintentando = new WeakSet();
  const pendientesDeGesto = new Set();
  const GESTOS = ["touchstart", "pointerdown", "keydown"];
  let escuchandoGesto = false;

  function alPrimerGesto(reintento) {
    pendientesDeGesto.add(reintento);
    if (escuchandoGesto) return;
    escuchandoGesto = true;
    const lanzar = () => {
      pendientesDeGesto.forEach((fn) => fn());
      pendientesDeGesto.clear();
      escuchandoGesto = false;
      GESTOS.forEach((ev) => document.removeEventListener(ev, lanzar));
    };
    GESTOS.forEach((ev) => document.addEventListener(ev, lanzar, { passive: true }));
  }

  function reproducirEnSilencio(medio) {
    if (!medio) return;
    medio.muted = true;
    const intento = medio.play();
    if (!intento || typeof intento.catch !== "function") return;
    intento.catch(() => {
      if (reintentando.has(medio)) return;
      reintentando.add(medio);
      const reintento = () => {
        medio.muted = true;
        const otro = medio.play();
        if (otro && typeof otro.then === "function") {
          otro.then(() => reintentando.delete(medio), () => {});
        }
      };
      medio.addEventListener("loadedmetadata", reintento);
      medio.addEventListener("canplay", reintento);
      medio.addEventListener("playing", () => reintentando.delete(medio), { once: true });
      alPrimerGesto(reintento);
    });
  }

  function reanudarFondosVisibles() {
    document.querySelectorAll(FONDOS).forEach((medio) => {
      if (medio.paused && medio.offsetParent !== null) reproducirEnSilencio(medio);
    });
  }

  // iOS pausa el vídeo al cambiar de app o de pestaña y no siempre lo reanuda.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) reanudarFondosVisibles();
  });

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
    if (reducedMotion.matches) {
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
    reproducirEnSilencio(video);
  }

  // El HTML trae el 720p: ligero y de sobra para el movil, y es lo que se
  // queda si no hay JS. En pantalla grande subimos al master en 4K, salvo
  // que el navegador pida ahorro de datos o vaya por una red muy lenta.
  const heroMaster = video.dataset.heroMaster;
  const conexion = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const ahorrandoDatos = !!conexion && (conexion.saveData === true || /(^|-)2g$/.test(conexion.effectiveType || ""));

  if (heroMaster && !compact.matches && !ahorrandoDatos) {
    video.src = heroMaster;
  }

  video.addEventListener("loadeddata", playHeroVideo);
  video.addEventListener("canplay", playHeroVideo);
  video.load();
  playHeroVideo();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  compact.addEventListener("change", requestTick);
  reducedMotion.addEventListener("change", requestTick);
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

  document.querySelectorAll(".detail-back").forEach((button) => {
    button.title = button.textContent.trim();
  });

  const previewOverrides = {
    beefeater: "assets/pub-beefeater-text.jpg",
    ecoembes: "assets/pub-ecoembes-text.jpg",
    bruma: "assets/pub-bruma-text.jpg",
    durex: "assets/pub-durex-text.jpg",
    crocs: "assets/pub-crocs-text.jpeg",
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
  let touchStartX = 0;
  let touchStartY = 0;
  let touchAxis = null;

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
        reproducirEnSilencio(sectionVideo);
      });
    }
    if (view === "think") {
      closePost();
      thinkSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        reproducirEnSilencio(sectionVideo);
      });
    }
    if (view === "contact") {
      contactSection.querySelectorAll(".work-smoke video").forEach((sectionVideo) => {
        reproducirEnSilencio(sectionVideo);
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
    workSection.classList.add("has-open-project");
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
    workSection.classList.remove("has-open-project");
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

  document.querySelectorAll("[data-cinema-reel-disabled]").forEach((reel) => {
    const strip = reel.querySelector(".reel-strip");
    const frames = Array.from(reel.querySelectorAll(".reel-frame"));
    const captions = Array.from(reel.querySelectorAll(".reel-caption"));
    const dotShell = reel.querySelector(".reel-dots");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!strip || !frames.length || frames.length !== captions.length) return;

    reel.classList.add("cinema-reel");
    reel.tabIndex = 0;
    reel.setAttribute("role", "region");
    reel.setAttribute("aria-roledescription", "carrusel");
    reel.setAttribute(
      "aria-label",
      `Fotogramas de ${reel.closest("[data-project-detail]")?.getAttribute("aria-label") || "este proyecto"}`
    );

    let current = Math.max(0, frames.findIndex((frame) => frame.classList.contains("is-active")));
    let transitioning = false;
    let transitionTimer = 0;
    let wheelTotal = 0;
    let wheelResetTimer = 0;
    let touchStartY = null;
    let touchShouldNavigate = false;
    let touchCaption = null;

    const dots = Array.from(dotShell?.querySelectorAll("span") || []).map((span, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = span.className;
      dot.setAttribute("aria-label", `Ir al fotograma ${index + 1} de ${frames.length}`);
      span.replaceWith(dot);
      dot.addEventListener("click", () => showFrame(index, index > current ? 1 : -1));
      return dot;
    });

    if (dotShell) {
      dotShell.removeAttribute("aria-hidden");
      dotShell.setAttribute("aria-label", "Elegir fotograma");
    }

    const controls = document.createElement("div");
    controls.className = "reel-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "reel-nav reel-nav-prev";
    previous.setAttribute("aria-label", "Fotograma anterior");
    previous.innerHTML = '<span aria-hidden="true">←</span>';
    const next = document.createElement("button");
    next.type = "button";
    next.className = "reel-nav reel-nav-next";
    next.setAttribute("aria-label", "Fotograma siguiente");
    next.innerHTML = '<span aria-hidden="true">→</span>';
    controls.append(previous, next);
    reel.appendChild(controls);

    function updateState() {
      frames.forEach((frame, index) => {
        const active = index === current;
        frame.classList.toggle("is-active", active);
        frame.setAttribute("aria-hidden", active ? "false" : "true");
        frame.inert = !active;
      });
      captions.forEach((caption, index) => {
        const active = index === current;
        caption.classList.toggle("is-active", active);
        caption.setAttribute("aria-hidden", active ? "false" : "true");
        caption.inert = !active;
        if (!active) caption.scrollTop = 0;
      });
      dots.forEach((dot, index) => {
        const active = index === current;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
      previous.disabled = current === 0;
      next.disabled = current === frames.length - 1;
      reel.dataset.current = String(current + 1).padStart(2, "0");
      reel.style.setProperty("--reel-progress", `${((current + 1) / frames.length) * 100}%`);
    }

    function pauseFrame(frame) {
      frame.querySelectorAll("video").forEach((video) => video.pause());
      frame.querySelectorAll('iframe[src*="vimeo"]').forEach((iframe) => {
        iframe.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), "*");
      });
    }

    function finishTransition(oldFrame, oldCaption, newFrame, newCaption) {
      window.clearTimeout(transitionTimer);
      [oldFrame, oldCaption, newFrame, newCaption].forEach((element) => {
        element?.classList.remove(
          "is-entering-next",
          "is-entering-prev",
          "is-leaving-next",
          "is-leaving-prev"
        );
      });
      reel.classList.remove("is-transitioning");
      transitioning = false;
      updateState();
    }

    function showFrame(index, direction = index > current ? 1 : -1) {
      if (transitioning || index === current || index < 0 || index >= frames.length) return false;
      const oldIndex = current;
      const oldFrame = frames[oldIndex];
      const oldCaption = captions[oldIndex];
      const newFrame = frames[index];
      const newCaption = captions[index];
      const suffix = direction > 0 ? "next" : "prev";

      transitioning = true;
      current = index;
      pauseFrame(oldFrame);
      newFrame.classList.add("is-active", `is-entering-${suffix}`);
      newCaption.classList.add("is-active", `is-entering-${suffix}`);
      oldFrame.classList.add(`is-leaving-${suffix}`);
      oldCaption.classList.add(`is-leaving-${suffix}`);
      reel.classList.add("is-transitioning");
      updateState();

      if (reducedMotion.matches) {
        finishTransition(oldFrame, oldCaption, newFrame, newCaption);
      } else {
        transitionTimer = window.setTimeout(
          () => finishTransition(oldFrame, oldCaption, newFrame, newCaption),
          820
        );
      }
      return true;
    }

    previous.addEventListener("click", () => showFrame(current - 1, -1));
    next.addEventListener("click", () => showFrame(current + 1, 1));

    reel.addEventListener("keydown", (event) => {
      const goingBack = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const goingForward = event.key === "ArrowRight" || event.key === "ArrowDown";
      if (!goingBack && !goingForward) return;
      event.preventDefault();
      showFrame(current + (goingForward ? 1 : -1), goingForward ? 1 : -1);
    });

    reel.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const activeCaption = event.target.closest?.(".reel-caption.is-active");
      if (activeCaption && activeCaption.scrollHeight > activeCaption.clientHeight + 1) {
        const atTop = activeCaption.scrollTop <= 1;
        const atBottom = activeCaption.scrollTop + activeCaption.clientHeight >= activeCaption.scrollHeight - 1;
        if (!((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom))) return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      if ((direction < 0 && current === 0) || (direction > 0 && current === frames.length - 1)) return;
      event.preventDefault();
      if (transitioning) return;

      wheelTotal += event.deltaY;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => { wheelTotal = 0; }, 140);
      if (Math.abs(wheelTotal) < 24) return;
      const wheelDirection = wheelTotal > 0 ? 1 : -1;
      wheelTotal = 0;
      showFrame(current + wheelDirection, wheelDirection);
    }, { passive: false });

    reel.addEventListener("touchstart", (event) => {
      if (event.target.closest("a, button, iframe, video")) return;
      touchStartY = event.touches[0]?.clientY ?? null;
      touchShouldNavigate = false;
      touchCaption = event.target.closest(".reel-caption.is-active");
    }, { passive: true });

    reel.addEventListener("touchmove", (event) => {
      if (touchStartY === null) return;
      const delta = touchStartY - (event.touches[0]?.clientY ?? touchStartY);
      const direction = delta > 0 ? 1 : -1;
      if (touchCaption && touchCaption.scrollHeight > touchCaption.clientHeight + 1) {
        const atTop = touchCaption.scrollTop <= 1;
        const atBottom = touchCaption.scrollTop + touchCaption.clientHeight >= touchCaption.scrollHeight - 1;
        if (!((direction < 0 && atTop) || (direction > 0 && atBottom))) return;
      }
      const canNavigate = Math.abs(delta) > 12
        && !((direction < 0 && current === 0) || (direction > 0 && current === frames.length - 1));
      if (!canNavigate) return;
      touchShouldNavigate = true;
      event.preventDefault();
    }, { passive: false });

    reel.addEventListener("touchend", (event) => {
      if (touchStartY === null) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - endY;
      if (touchShouldNavigate && Math.abs(delta) > 48) {
        const direction = delta > 0 ? 1 : -1;
        showFrame(current + direction, direction);
      }
      touchStartY = null;
      touchShouldNavigate = false;
      touchCaption = null;
    }, { passive: true });

    updateState();
  });

  const reelDesktop = window.matchMedia("(min-width: 761px)");

  document.querySelectorAll("[data-reel]").forEach((reel) => {
    const strip = reel.querySelector(".reel-strip");
    const frames = Array.from(reel.querySelectorAll(".reel-frame"));
    const captions = Array.from(reel.querySelectorAll(".reel-caption"));
    const dots = Array.from(reel.querySelectorAll(".reel-dots span"));
    const mobileDots = [];
    let activeIndex = -1;
    let transitionTimer = 0;
    let reelAnimationFrame = 0;
    if (!frames.length) return;

    reel.classList.add("smooth-reel");
    reel.style.setProperty(
      "--reel-scroll-height",
      `${100 + Math.max(0, frames.length - 1) * 42}vh`
    );

    if (strip) {
      strip.tabIndex = 0;
      strip.setAttribute("aria-label", "Fotogramas del proyecto");

      const mobileDotsNav = document.createElement("div");
      mobileDotsNav.className = "reel-mobile-dots";
      mobileDotsNav.setAttribute("aria-label", "Navegación de imágenes");

      frames.forEach((frame, index) => {
        const mobileDot = document.createElement("button");
        mobileDot.type = "button";
        mobileDot.setAttribute("aria-label", `Ir a la imagen ${index + 1} de ${frames.length}`);
        mobileDot.addEventListener("click", () => scrollToFrame(index));
        mobileDotsNav.appendChild(mobileDot);
        mobileDots.push(mobileDot);
      });

      reel.insertBefore(mobileDotsNav, strip);
    }

    function scrollToFrame(index, behavior = "smooth") {
      if (!strip || !frames[index]) return;
      const stripRect = strip.getBoundingClientRect();
      const frameRect = frames[index].getBoundingClientRect();
      const left = strip.scrollLeft + frameRect.left - stripRect.left - (strip.clientWidth - frameRect.width) / 2;
      strip.scrollTo({ left, behavior });
    }

    function activateFrame(index) {
      if (index === activeIndex || !frames[index]) return;
      const previousIndex = activeIndex >= 0
        ? activeIndex
        : Math.max(0, frames.findIndex((frame) => frame.classList.contains("is-active")));
      const previousFrame = frames[previousIndex];
      const nextFrame = frames[index];
      const suffix = index > previousIndex ? "next" : "prev";

      window.clearTimeout(transitionTimer);
      frames.forEach((frame) => {
        frame.classList.remove(
          "is-entering-next",
          "is-entering-prev",
          "is-leaving-next",
          "is-leaving-prev"
        );
      });

      frames.forEach((frame, frameIndex) => {
        frame.classList.toggle("is-active", frameIndex === index);
        frame.classList.toggle("is-prev", frameIndex === index - 1);
        frame.classList.toggle("is-next", frameIndex === index + 1);
      });

      if (activeIndex >= 0 && previousIndex !== index) {
        previousFrame.classList.add(`is-leaving-${suffix}`);
        nextFrame.classList.add(`is-entering-${suffix}`);
        transitionTimer = window.setTimeout(() => {
          previousFrame.classList.remove(`is-leaving-${suffix}`);
          nextFrame.classList.remove(`is-entering-${suffix}`);
        }, 720);
      }

      activeIndex = index;
      captions.forEach((caption, captionIndex) => {
        caption.classList.toggle("is-active", captionIndex === index);
      });
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      mobileDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function updateReel() {
      if (!frames[0].offsetParent) return;
      let best = 0;
      if (!reelDesktop.matches && strip) {
        let bestDist = Infinity;
        const stripRect = strip.getBoundingClientRect();
        const mid = stripRect.left + stripRect.width / 2;
        frames.forEach((frame, index) => {
          const rect = frame.getBoundingClientRect();
          const dist = Math.abs(rect.left + rect.width / 2 - mid);
          if (dist < bestDist) {
            bestDist = dist;
            best = index;
          }
        });
      } else {
        const reelRect = reel.getBoundingClientRect();
        const scrollDistance = Math.max(1, reelRect.height - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -reelRect.top / scrollDistance));
        best = Math.round(progress * (frames.length - 1));
      }
      activateFrame(best);
    }

    function refreshReel() {
      updateReel();
    }

    function scheduleReelUpdate() {
      if (!frames[0].offsetParent || reelAnimationFrame) return;
      reelAnimationFrame = window.requestAnimationFrame(() => {
        reelAnimationFrame = 0;
        updateReel();
      });
    }

    window.addEventListener("scroll", scheduleReelUpdate, { passive: true });
    window.addEventListener("resize", refreshReel);
    strip?.addEventListener("scroll", scheduleReelUpdate, { passive: true });
    strip?.addEventListener("keydown", (event) => {
      if (reelDesktop.matches || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      const active = activeIndex >= 0
        ? activeIndex
        : frames.findIndex((frame) => frame.classList.contains("is-active"));
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = Math.max(0, Math.min(frames.length - 1, active + direction));
      scrollToFrame(next);
    });
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

  const mediaTitles = [
    "Birdman o (La inesperada virtud de la ignorancia) (Birdman or [The Unexpected Virtue of Ignorance]",
    "Mujeres y Hombres y Viceversa",
    "El Turismo Es Un Gran Invento",
    "Las Brujas de Zugarramurdi",
    "El Nacimiento De Una Nación",
    "Callejeros Viajeros",
    "The Amazing Spider-Man",
    "El Crepúsculo de los Dioses",
    "Los Cuatrocientos Golpes",
    "Tirad Sobre el Pianista",
    "Jules et Jim",
    "Viajando con Chester",
    "Los Gipsy Kings",
    "Breaking Bad",
    "Cuarto Milenio",
    "Besos Robados",
    "Les Vampires",
    "First Dates",
    "Birdman 3",
    "Black Swan",
    "Cisne Negro",
    "Irma Vep",
    "Callejeros",
    "Ola, Ola",
    "Ola Ola",
    "La Abuela",
    "La Bruja",
    "Múltiple",
    "Furtivos",
    "Batman",
    "Birdman",
    "Split",
    "X"
  ].sort((a, b) => b.length - a.length);

  const escapedMediaTitles = mediaTitles.map((title) =>
    title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const mediaTitlePattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(${escapedMediaTitles.join("|")})(?![\\p{L}\\p{N}])`,
    "gu"
  );
  const italicOnlyMediaTitles = new Set(["Birdman", "Irma Vep"]);

  document.querySelectorAll(".post-body").forEach((body) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement.closest(".media-title")) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      const isItalicized = Boolean(textNode.parentElement.closest("em"));
      mediaTitlePattern.lastIndex = 0;
      if (!mediaTitlePattern.test(text)) return;

      const fragment = document.createDocumentFragment();
      let cursor = 0;
      mediaTitlePattern.lastIndex = 0;

      text.replace(mediaTitlePattern, (match, title, offset) => {
        fragment.append(text.slice(cursor, offset));
        if (italicOnlyMediaTitles.has(title) && !isItalicized) {
          fragment.append(match);
        } else {
          const markedTitle = document.createElement("span");
          markedTitle.className = "media-title";
          markedTitle.textContent = title;
          fragment.append(markedTitle);
        }
        cursor = offset + match.length;
        return match;
      });

      fragment.append(text.slice(cursor));
      textNode.replaceWith(fragment);
    });
  });

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

    // Touch: a horizontal swipe on the camera steps between projects, while
    // vertical swipes keep scrolling the page normally (no scroll trap).
    // Swipes that start on the thumbnail rail are left to its own scroll.
    cameraPlayback.addEventListener("touchstart", (event) => {
      if (event.target.closest("[data-camera-thumbs]")) {
        touchAxis = "skip";
        return;
      }
      touchAxis = null;
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    cameraPlayback.addEventListener("touchmove", (event) => {
      if (touchAxis === "skip") return;
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (!touchAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        touchAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (touchAxis === "x") event.preventDefault();
    }, { passive: false });

    cameraPlayback.addEventListener("touchend", (event) => {
      if (touchAxis !== "x") return;
      const dx = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) stepCamera(dx < 0 ? 1 : -1);
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
