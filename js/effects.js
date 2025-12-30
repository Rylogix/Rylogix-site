(() => {
  // Tilt targets in priority order.
  const TILT_SELECTORS = [
    ".discord-card",
    ".card",
    ".panel",
    ".section-card",
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

  // Apply the breathing glow class to card-like elements.
  const applyBreathingGlow = () => {
    const glowTargets = document.querySelectorAll(
      ".discord-card, .hero-card, .link-card, .visitor-card, .contact-modal-inner"
    );

    glowTargets.forEach((element) => {
      if (element.dataset.animate === "false") {
        return;
      }
      element.classList.add("breathing-glow");
    });
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

      state.targetY = (normalizedX - 0.5) * 2 * TILT_SETTINGS.maxTilt;
      state.targetX = (0.5 - normalizedY) * 2 * TILT_SETTINGS.maxTilt;
      state.targetLift = -TILT_SETTINGS.maxLift;
      state.targetScale = TILT_SETTINGS.maxScale;
      state.targetGlow = 0.35;
      state.targetGlowX = normalizedX * 100;
      state.targetGlowY = normalizedY * 100;

      scheduleUpdate();
    };

    const handlePointerEnter = () => {
      state.rect = element.getBoundingClientRect();
      setWillChange();
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

  // Pause breathing effects when the page is hidden.
  const handleVisibility = () => {
    document.body.classList.toggle("effects-paused", document.hidden);
  };

  const init = () => {
    resolveTiltTargets().forEach(initTilt);
    applyBreathingGlow();
    initScrollReveal();
    initSmoothScroll();
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
