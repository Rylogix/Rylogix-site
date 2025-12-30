(() => {
  const init = () => {
    const canvasId = "bg-canvas";
    let canvas = document.getElementById(canvasId);

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;

    // INFLUENCE_RADIUS: how far the cursor attracts particles (in px).
    const INFLUENCE_RADIUS = 170;
    // ATTRACTION_STRENGTH: pull intensity toward the cursor (smaller = floatier).
    const ATTRACTION_STRENGTH = 0.06;
    // RETURN_DAMPING: how quickly particles drift back to base motion and the
    // cursor influence fades when the pointer leaves.
    const RETURN_DAMPING = 0.035;
    // MAX_LINE_DISTANCE: maximum distance for connecting lines.
    const MAX_LINE_DISTANCE = 140;
    // LINE_OPACITY_BOOST_NEAR_MOUSE: extra line opacity near the cursor.
    const LINE_OPACITY_BOOST_NEAR_MOUSE = 0.6;

    const pointer = {
      x: 0,
      y: 0,
      active: false,
      strength: 0,
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const rand = (min, max) => Math.random() * (max - min) + min;

    const targetCount = () => {
      const area = width * height;
      const estimate = Math.floor(area / 15000);
      return clamp(estimate, 80, 140);
    };

    const createParticle = () => {
      const speed = rand(0.15, 0.45);
      const angle = rand(0, Math.PI * 2);
      const baseVx = Math.cos(angle) * speed;
      const baseVy = Math.sin(angle) * speed;
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        radius: rand(0.6, 1.6),
        opacity: rand(0.35, 0.8),
        mouseFactor: 0,
      };
    };

    const syncParticles = () => {
      const desired = targetCount();
      while (particles.length < desired) {
        particles.push(createParticle());
      }
      while (particles.length > desired) {
        particles.pop();
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncParticles();
      drawFrame();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const linkDistance = clamp(
        Math.min(width, height) * 0.2,
        90,
        MAX_LINE_DISTANCE
      );
      const maxDistSq = linkDistance * linkDistance;

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(235, 235, 245, ${particle.opacity})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > maxDistSq) {
            continue;
          }

          const dist = Math.sqrt(distSq);
          const baseAlpha = (1 - dist / linkDistance) * 0.35;
          const boost =
            Math.max(particle.mouseFactor, other.mouseFactor) *
            LINE_OPACITY_BOOST_NEAR_MOUSE;
          const alpha = clamp(baseAlpha * (1 + boost), 0, 0.85);
          ctx.strokeStyle = `rgba(200, 200, 215, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    };

    const step = () => {
      const margin = 20;
      const targetStrength = pointer.active ? 1 : 0;
      pointer.strength += (targetStrength - pointer.strength) * RETURN_DAMPING;
      if (pointer.strength < 0.001) {
        pointer.strength = 0;
      }
      const influenceRadiusSq = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        particle.mouseFactor = 0;

        if (pointer.strength > 0) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < influenceRadiusSq) {
            const dist = Math.sqrt(distSq) || 1;
            const falloff = 1 - dist / INFLUENCE_RADIUS;
            const force = falloff * ATTRACTION_STRENGTH * pointer.strength;
            particle.vx += (dx / dist) * force;
            particle.vy += (dy / dist) * force;
            particle.mouseFactor = falloff * pointer.strength;
          }
        }

        particle.vx += (particle.baseVx - particle.vx) * RETURN_DAMPING;
        particle.vy += (particle.baseVy - particle.vy) * RETURN_DAMPING;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -margin) {
          particle.x = width + margin;
        } else if (particle.x > width + margin) {
          particle.x = -margin;
        }

        if (particle.y < -margin) {
          particle.y = height + margin;
        } else if (particle.y > height + margin) {
          particle.y = -margin;
        }
      }

      drawFrame();
      animationId = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (animationId) {
        window.cancelAnimationFrame(animationId);
        animationId = null;
      }

      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }

      step();
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );
    window.addEventListener(
      "pointerdown",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );
    window.addEventListener("pointerup", () => {
      pointer.active = false;
    });
    window.addEventListener("pointercancel", () => {
      pointer.active = false;
    });
    window.addEventListener("mouseleave", () => {
      pointer.active = false;
    });
    window.addEventListener("blur", () => {
      pointer.active = false;
    });

    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener("change", start);
    } else if (prefersReducedMotion.addListener) {
      prefersReducedMotion.addListener(start);
    }

    start();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
