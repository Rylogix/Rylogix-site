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
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: rand(0.6, 1.6),
        opacity: rand(0.35, 0.8),
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
        140
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
          const alpha = (1 - dist / linkDistance) * 0.35;
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

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
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
