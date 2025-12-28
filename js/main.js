// Link data powers the cards.
const links = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/@rylogix",
    logo: "https://cdn.simpleicons.org/youtube",
    cta: "Watch the latest uploads",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@rylogix",
    logo: "https://cdn.simpleicons.org/tiktok",
    cta: "Quick clips and updates",
  },
  {
    name: "GitHub",
    url: "https://github.com/rylogix",
    logo: "https://cdn.simpleicons.org/github",
    cta: "Open-source builds",
  },
  {
    name: "Steam",
    url: "https://steamcommunity.com/id/rylogix",
    logo: "https://cdn.simpleicons.org/steam",
    cta: "Games and achievements",
  },
  {
    name: "Discord Server",
    url: "https://discord.com/invite/u3rMwEKu9D",
    logo: "https://cdn.simpleicons.org/discord",
    cta: "Join the community",
  },
  {
    name: "Cash App",
    url: "https://cash.app/$RylanGetPaid",
    logo: "https://cdn.simpleicons.org/cashapp",
    cta: "Support the grind",
  },
];

const toast = document.getElementById("toast");
const linksGrid = document.getElementById("links-grid");
const shareButton = document.getElementById("share-page");

const fallbackSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2.5l2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8L12 2.5z"
    />
  </svg>
`;

const externalIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M14 5h5v5h-2V8.4l-6.3 6.3-1.4-1.4L15.6 7H14V5z"
    />
    <path
      fill="currentColor"
      d="M6 6h5v2H8v8h8v-3h2v5H6V6z"
    />
  </svg>
`;

// Tiny toast helper for copy/share actions.
const showToast = (message) => {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
};

const copyText = async (text) => {
  if (!text) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      return document.execCommand("copy");
    } catch (fallbackError) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

// Build a logo block with Clearbit + SVG fallback.
const createLogo = (logoUrl, label) => {
  const wrap = document.createElement("div");
  wrap.className = "logo-wrap";

  const skeleton = document.createElement("span");
  skeleton.className = "logo-skeleton";

  const img = document.createElement("img");
  img.alt = `${label} logo`;
  img.loading = "lazy";
  img.decoding = "async";
  img.src = logoUrl;

  const fallback = document.createElement("span");
  fallback.className = "logo-fallback";
  fallback.innerHTML = fallbackSvg;

  img.addEventListener("load", () => {
    if (img.naturalWidth === 0) {
      wrap.classList.add("failed");
      img.style.display = "none";
      return;
    }
    wrap.classList.add("loaded");
  });

  img.addEventListener("error", () => {
    wrap.classList.add("failed");
    img.style.display = "none";
  });

  wrap.appendChild(skeleton);
  wrap.appendChild(img);
  wrap.appendChild(fallback);

  return wrap;
};

// Render link cards from the data array.
const renderLinks = () => {
  if (!linksGrid) {
    return;
  }

  linksGrid.innerHTML = "";

  links.forEach((link) => {
    const card = document.createElement("a");
    card.className = "link-card";
    card.href = link.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const logo = createLogo(link.logo, link.name);

    const textWrap = document.createElement("div");
    textWrap.className = "link-text";

    const title = document.createElement("h3");
    title.textContent = link.name;

    const cta = document.createElement("p");
    cta.textContent = link.cta;

    const external = document.createElement("span");
    external.className = "external-icon";
    external.innerHTML = externalIconSvg;

    textWrap.appendChild(title);
    textWrap.appendChild(cta);

    card.appendChild(logo);
    card.appendChild(textWrap);
    card.appendChild(external);

    linksGrid.appendChild(card);
  });
};

const handleShare = async () => {
  const pageUrl = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "rylogix",
        text: "Check out rylogix links and projects.",
        url: pageUrl,
      });
      showToast("Shared!");
      return;
    } catch (error) {
      showToast("Share canceled");
      return;
    }
  }

  const copied = await copyText(pageUrl);
  showToast(copied ? "Page link copied" : "Unable to copy");
};

renderLinks();

if (shareButton) {
  shareButton.addEventListener("click", handleShare);
}
