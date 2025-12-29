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
    cta: "All my coding projects are stored here",
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
const discordCard = document.getElementById("discord-card");
const discordAvatar = document.getElementById("discord-avatar");
const discordStatus = document.getElementById("discord-status");
const discordActivity = document.getElementById("discord-activity");

const DISCORD_USER_ID = "1068673520495775745";
const DISCORD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const DISCORD_AVATAR_KEY = `discord-avatar-${DISCORD_USER_ID}`;
const DISCORD_STATUS_LABELS = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};
const DISCORD_ACTIVITY_LABELS = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

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

const getCachedDiscordAvatar = () => {
  try {
    return window.localStorage.getItem(DISCORD_AVATAR_KEY);
  } catch (error) {
    return null;
  }
};

const setCachedDiscordAvatar = (url) => {
  if (!url) {
    return;
  }
  try {
    window.localStorage.setItem(DISCORD_AVATAR_KEY, url);
  } catch (error) {
    // Ignore storage errors to avoid breaking the UI.
  }
};

const getDiscordAvatarUrl = (user) => {
  if (!user) {
    return null;
  }

  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
  }

  if (user.discriminator) {
    const index = Number(user.discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }

  return "https://cdn.discordapp.com/embed/avatars/0.png";
};

const getPrimaryDiscordActivity = (activities) => {
  if (!Array.isArray(activities)) {
    return null;
  }

  return (
    activities.find(
      (activity) =>
        activity &&
        activity.name &&
        activity.type !== 4 &&
        activity.name !== "Custom Status"
    ) || null
  );
};

const formatDiscordActivity = (activity) => {
  if (!activity || !activity.name) {
    return "Doing nothing.";
  }

  const label =
    DISCORD_ACTIVITY_LABELS[activity.type] ||
    DISCORD_ACTIVITY_LABELS[0];

  return `${label} ${activity.name}`;
};

const setDiscordStatus = (status) => {
  if (discordCard) {
    discordCard.dataset.status = status;
  }

  if (discordStatus) {
    const label = DISCORD_STATUS_LABELS[status] || "Offline";
    discordStatus.textContent = `Status: ${label}`;
  }
};

const setDiscordActivity = (text) => {
  if (discordActivity) {
    discordActivity.textContent = text;
  }
};

const setDiscordAvatar = (url) => {
  if (!discordAvatar || !url) {
    return;
  }

  if (discordAvatar.src !== url) {
    discordAvatar.src = url;
  }
  setCachedDiscordAvatar(url);
};

const setDiscordErrorState = () => {
  if (discordCard) {
    discordCard.dataset.status = "unknown";
  }
  if (discordActivity) {
    discordActivity.textContent = "Discord status unavailable";
  }
};

const updateDiscordPresence = async () => {
  if (!discordCard) {
    return;
  }

  try {
    const response = await fetch(DISCORD_API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Bad response");
    }

    const payload = await response.json();
    if (!payload || !payload.data) {
      throw new Error("Missing data");
    }

    const data = payload.data;
    const status = data.discord_status || "offline";
    const activity = getPrimaryDiscordActivity(data.activities);

    setDiscordStatus(status);
    setDiscordActivity(formatDiscordActivity(activity));

    const avatarUrl = getDiscordAvatarUrl(data.discord_user);
    if (avatarUrl) {
      setDiscordAvatar(avatarUrl);
    }
  } catch (error) {
    setDiscordErrorState();
  }
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

if (discordCard) {
  const cachedAvatar = getCachedDiscordAvatar();
  if (cachedAvatar) {
    setDiscordAvatar(cachedAvatar);
  }

  updateDiscordPresence();
  window.setInterval(updateDiscordPresence, 30000);
}
