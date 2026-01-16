(() => {
  // Tilt targets in priority order.
  const TILT_SELECTORS = [
    ".discord-card",
    ".hero-card",
    ".card",
    ".panel",
    ".section-card",
    ".project-card",
  ];
  const TILT_FALLBACK_SELECTORS = [
    ".hero-card",
    ".link-card",
    ".visitor-card",
    ".contact-modal-inner",
  ];

  // Core tuning knobs.
  const TILT_SETTINGS = {
    maxTilt: 6,
    maxLift: 4,
    maxScale: 1.01,
    smoothing: 0.3,
  };

  const REVEAL_SETTINGS = {
    staggerStep: 80,
    staggerMax: 240,
  };

  const SCROLL_SETTINGS = {
    minDuration: 350,
    maxDuration: 900,
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const readNumber = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  // Resolve tilt targets with a fallback if none are found.
  const resolveTiltTargets = () => {
    const targets = new Set();
    TILT_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => targets.add(el));
    });

    if (targets.size > 0) {
      return Array.from(targets);
    }

    TILT_FALLBACK_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => targets.add(el));
    });

    return Array.from(targets);
  };

  // Cursor-aware tilt with rAF smoothing and a moving highlight.
  const initTilt = (element) => {
    if (element.dataset.tilt === "false") {
      return;
    }

    if (prefersReducedMotion.matches || coarsePointer.matches) {
      return;
    }

    element.classList.add("tilt-card");

    const maxTilt = readNumber(element.dataset.tiltMax) ?? TILT_SETTINGS.maxTilt;
    const maxLift = readNumber(element.dataset.tiltLift) ?? TILT_SETTINGS.maxLift;
    const maxScale =
      readNumber(element.dataset.tiltScale) ?? TILT_SETTINGS.maxScale;
    const maxGlow = readNumber(element.dataset.tiltGlow) ?? 0.35;
    const hoverLift = readNumber(element.dataset.tiltHoverLift);
    const hoverScale = readNumber(element.dataset.tiltHoverScale);
    const hoverGlow = readNumber(element.dataset.tiltHoverGlow);

    const state = {
      rect: null,
      targetX: 0,
      targetY: 0,
      targetLift: 0,
      targetScale: 1,
      targetGlow: 0,
      targetGlowX: 50,
      targetGlowY: 50,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      currentScale: 1,
      currentGlow: 0,
      rafId: null,
      willChangeTimeout: null,
    };

    // Animate toward targets with a gentle lerp.
    const update = () => {
      state.rafId = null;

      state.currentX +=
        (state.targetX - state.currentX) * TILT_SETTINGS.smoothing;
      state.currentY +=
        (state.targetY - state.currentY) * TILT_SETTINGS.smoothing;
      state.currentLift +=
        (state.targetLift - state.currentLift) * TILT_SETTINGS.smoothing;
      state.currentScale +=
        (state.targetScale - state.currentScale) * TILT_SETTINGS.smoothing;
      state.currentGlow +=
        (state.targetGlow - state.currentGlow) * TILT_SETTINGS.smoothing;

      element.style.setProperty("--tilt-rotate-x", `${state.currentX}deg`);
      element.style.setProperty("--tilt-rotate-y", `${state.currentY}deg`);
      element.style.setProperty("--tilt-lift", `${state.currentLift}px`);
      element.style.setProperty("--tilt-scale", state.currentScale.toFixed(3));
      element.style.setProperty(
        "--tilt-glow-x",
        `${state.targetGlowX.toFixed(1)}%`
      );
      element.style.setProperty(
        "--tilt-glow-y",
        `${state.targetGlowY.toFixed(1)}%`
      );
      element.style.setProperty(
        "--tilt-glow-opacity",
        state.currentGlow.toFixed(3)
      );

      const idle =
        Math.abs(state.targetX - state.currentX) < 0.01 &&
        Math.abs(state.targetY - state.currentY) < 0.01 &&
        Math.abs(state.targetLift - state.currentLift) < 0.01 &&
        Math.abs(state.targetScale - state.currentScale) < 0.001 &&
        Math.abs(state.targetGlow - state.currentGlow) < 0.01;

      if (!idle) {
        state.rafId = window.requestAnimationFrame(update);
      }
    };

    const scheduleUpdate = () => {
      if (!state.rafId) {
        state.rafId = window.requestAnimationFrame(update);
      }
    };

    // Only hint will-change while interacting.
    const setWillChange = () => {
      element.style.willChange = "transform";
      if (state.willChangeTimeout) {
        window.clearTimeout(state.willChangeTimeout);
      }
    };

    const clearWillChange = () => {
      if (state.willChangeTimeout) {
        window.clearTimeout(state.willChangeTimeout);
      }
      state.willChangeTimeout = window.setTimeout(() => {
        element.style.willChange = "";
      }, 220);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      if (!state.rect) {
        state.rect = element.getBoundingClientRect();
      }

      const relativeX = (event.clientX - state.rect.left) / state.rect.width;
      const relativeY = (event.clientY - state.rect.top) / state.rect.height;
      const normalizedX = clamp(relativeX, 0, 1);
      const normalizedY = clamp(relativeY, 0, 1);

      state.targetY = (normalizedX - 0.5) * 2 * maxTilt;
      state.targetX = (0.5 - normalizedY) * 2 * maxTilt;
      state.targetLift = -maxLift;
      state.targetScale = maxScale;
      state.targetGlow = maxGlow;
      state.targetGlowX = normalizedX * 100;
      state.targetGlowY = normalizedY * 100;

      scheduleUpdate();
    };

    const handlePointerEnter = () => {
      state.rect = element.getBoundingClientRect();
      setWillChange();

      let needsUpdate = false;
      if (hoverLift !== null) {
        state.targetLift = -hoverLift;
        needsUpdate = true;
      }
      if (hoverScale !== null) {
        state.targetScale = hoverScale;
        needsUpdate = true;
      }
      if (hoverGlow !== null) {
        state.targetGlow = hoverGlow;
        state.targetGlowX = 50;
        state.targetGlowY = 50;
        needsUpdate = true;
      }
      if (needsUpdate) {
        scheduleUpdate();
      }
    };

    const handlePointerLeave = () => {
      state.targetX = 0;
      state.targetY = 0;
      state.targetLift = 0;
      state.targetScale = 1;
      state.targetGlow = 0;
      state.rect = null;
      scheduleUpdate();
      clearWillChange();
    };

    element.addEventListener("pointerenter", handlePointerEnter);
    element.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    element.addEventListener("pointerleave", handlePointerLeave);
  };

  // Scroll-linked reveal with stagger and optional replay.
  const initScrollReveal = () => {
    const revealElements = Array.from(
      document.querySelectorAll("[data-reveal]")
    ).filter((element) => element.dataset.animate !== "false");

    if (revealElements.length === 0) {
      return;
    }

    document.body.classList.add("reveal-ready");

    if (prefersReducedMotion.matches) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const groupMap = new Map();
    revealElements.forEach((element) => {
      const group = element.closest("section") || element.parentElement;
      if (!group) {
        return;
      }
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group).push(element);
    });

    groupMap.forEach((elements) => {
      elements.forEach((element, index) => {
        const delay = clamp(
          index * REVEAL_SETTINGS.staggerStep,
          0,
          REVEAL_SETTINGS.staggerMax
        );
        element.style.setProperty("--reveal-delay", `${delay}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const replay = element.dataset.replay === "true";

          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            if (!replay) {
              observer.unobserve(element);
            }
            return;
          }

          if (replay) {
            element.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  };

  // Resolve same-page anchor targets.
  const getAnchorTarget = (hash) => {
    if (!hash || hash === "#") {
      return null;
    }

    const id = decodeURIComponent(hash.replace("#", ""));
    if (!id) {
      return null;
    }

    const direct = document.getElementById(id);
    if (direct) {
      return direct;
    }

    try {
      return document.querySelector(`[name="${CSS.escape(id)}"]`);
    } catch (error) {
      return null;
    }
  };

  // Soft inertia scroll for in-page anchors.
  const initSmoothScroll = () => {
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const link = event.target.closest('a[href^="#"]');
      if (!link || link.dataset.scroll === "false") {
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      if (url.pathname !== window.location.pathname) {
        return;
      }

      const target = getAnchorTarget(url.hash);
      if (!target) {
        return;
      }

      event.preventDefault();

      const targetY = target.getBoundingClientRect().top + window.scrollY;

      if (prefersReducedMotion.matches) {
        window.scrollTo({ top: targetY, behavior: "auto" });
        if (url.hash !== window.location.hash) {
          window.history.pushState(null, "", url.hash);
        }
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = clamp(
        Math.abs(distance) * 0.6,
        SCROLL_SETTINGS.minDuration,
        SCROLL_SETTINGS.maxDuration
      );
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const eased = easeOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);

      if (url.hash !== window.location.hash) {
        window.history.pushState(null, "", url.hash);
      }
    });
  };

  // Animated constellation background using evenly spaced points.
  const initConstellation = () => {
    const canvas = document.querySelector(".constellation-canvas");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    if (prefersReducedMotion.matches) {
      canvas.style.display = "none";
      return;
    }

    const state = {
      width: 0,
      height: 0,
      ratio: 1,
      points: [],
      linkDistance: 0,
      lastTime: performance.now(),
      rafId: null,
      paused: false,
    };

    const halton = (index, base) => {
      let result = 0;
      let f = 1 / base;
      let i = index;
      while (i > 0) {
        result += f * (i % base);
        i = Math.floor(i / base);
        f /= base;
      }
      return result;
    };

    const buildPoints = () => {
      const area = state.width * state.height;
      const count = clamp(Math.round(area / 16000), 35, 120);
      const minDim = Math.min(state.width, state.height);
      const speedBase = minDim * 0.00035;

      state.linkDistance = minDim * 0.18;
      state.points = [];

      for (let i = 1; i <= count; i += 1) {
        const x = halton(i, 2) * state.width;
        const y = halton(i, 3) * state.height;
        const angle = (i * 137.5 * Math.PI) / 180;
        const speed = speedBase * (0.7 + (i % 7) * 0.08);
        state.points.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 0.8 + (i % 3) * 0.45,
        });
      }
    };

    const resize = () => {
      state.width = Math.max(1, window.innerWidth);
      state.height = Math.max(1, window.innerHeight);
      state.ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(state.width * state.ratio);
      canvas.height = Math.round(state.height * state.ratio);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);

      buildPoints();
    };

    const update = (delta) => {
      const margin = 14;
      state.points.forEach((point) => {
        point.x += point.vx * delta;
        point.y += point.vy * delta;

        if (point.x < margin || point.x > state.width - margin) {
          point.vx *= -1;
        }
        if (point.y < margin || point.y > state.height - margin) {
          point.vy *= -1;
        }
      });
    };

    const draw = () => {
      context.clearRect(0, 0, state.width, state.height);

      const points = state.points;
      const linkDistance = state.linkDistance;
      const linkDistanceSq = linkDistance * linkDistance;

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < linkDistanceSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / linkDistance) * 0.35;
            context.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(points[i].x, points[i].y);
            context.lineTo(points[j].x, points[j].y);
            context.stroke();
          }
        }
      }

      points.forEach((point) => {
        const alpha = 0.5 + (point.radius - 0.8) * 0.25;
        context.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const step = (now) => {
      if (state.paused) {
        state.lastTime = now;
        state.rafId = window.requestAnimationFrame(step);
        return;
      }

      const delta = Math.min((now - state.lastTime) / 16.67, 2);
      state.lastTime = now;
      update(delta);
      draw();
      state.rafId = window.requestAnimationFrame(step);
    };

    const handleVisibilityChange = () => {
      state.paused = document.hidden;
    };

    resize();
    window.addEventListener("resize", () => {
      window.requestAnimationFrame(resize);
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    state.rafId = window.requestAnimationFrame(step);
  };

  // Pause breathing effects when the page is hidden.
  const handleVisibility = () => {
    document.body.classList.toggle("effects-paused", document.hidden);
  };

  const init = () => {
    resolveTiltTargets().forEach(initTilt);
    initScrollReveal();
    initSmoothScroll();
    initConstellation();
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
