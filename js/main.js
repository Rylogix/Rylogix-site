// Link data powers the cards.
const links = [
  {
    name: "Discord Server",
    url: "https://discord.com/invite/u3rMwEKu9D",
    logo: "https://cdn.simpleicons.org/discord",
    cta: "Join the community",
  },
  {
    name: "GitHub",
    url: "https://github.com/rylogix",
    logo: "https://cdn.simpleicons.org/github",
    cta: "All my projects are stored here",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@rylogix",
    logo: "https://cdn.simpleicons.org/youtube",
    cta: "Mainly posting minecraft content",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@rylogix",
    logo: "https://cdn.simpleicons.org/tiktok",
    cta: "Here i post variety content",
  },
  {
    name: "Twitch",
    url: "https://www.twitch.tv/rylogix",
    logo: "https://cdn.simpleicons.org/twitch",
    cta: "I stream occasionally",
  },
  {
    name: "Cash App",
    url: "https://cash.app/$RylanGetPaid",
    logo: "https://cdn.simpleicons.org/cashapp",
    cta: "Lowkey send me a dollar tho",
  },
  {
    name: "Steam",
    url: "https://steamcommunity.com/id/rylogix",
    logo: "https://cdn.simpleicons.org/steam",
    cta: "See my games and friends",
  },
  {
    name: "Roblox",
    url: "https://www.roblox.com/users/2718945057/profile",
    logo: "https://cdn.simpleicons.org/roblox",
    cta: "Find me on Roblox",
  },
  {
    name: "Rec Room",
    url: "https://rec.net/user/Rylogix",
    logo: "https://cdn.simpleicons.org/recroom",
    cta: "My rec.net profile",
  },
];

const VISIBLE_LINK_COUNT = 6;
let linksExpanded = false;

const toast = document.getElementById("toast");
const linksGrid = document.getElementById("links-grid");
const contactButton = document.getElementById("contact-button");
const contactModal = document.getElementById("contact-modal");
const contactBackdrop = document.getElementById("contact-backdrop");
const contactClose = document.getElementById("contact-close");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const supportButton = document.getElementById("support-button");
const supportModal = document.getElementById("support-modal");
const supportBackdrop = document.getElementById("support-backdrop");
const supportClose = document.getElementById("support-close");
const projectsLink = document.getElementById("projects-link");
const homeLink = document.getElementById("home-link");
const projectsSection = document.getElementById("projects");
const homeSections = document.querySelectorAll("[data-home-section]");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const VIEW_TRANSITION_MS = 280;
const VIEW_SWAP_DELAY = 400;
const VIEW_HOME = "home";
const VIEW_PROJECTS = "projects";
let currentView = null;
let viewSwapTimeoutId = null;
const discordCard = document.getElementById("discord-card");
const discordAvatar = document.getElementById("discord-avatar");
const discordActivity = document.getElementById("discord-activity");
const discordText = document.querySelector(".discord-text");
const presenceBadge = document.getElementById("presence-badge");
const presenceIcon = document.getElementById("presence-icon");
const presenceDot = document.getElementById("presence-dot");
const heroStoryToggle = document.getElementById("hero-story-toggle");
const heroStory = document.getElementById("hero-story");

let spotifyProgressTimer = null;
let spotifyProgressState = null;
let activityElapsedTimer = null;
let activityElapsedState = null;

const DISCORD_USER_ID = "1068673520495775745";
const DISCORD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const DISCORD_AVATAR_KEY = `discord-avatar-${DISCORD_USER_ID}`;
const DISCORD_ACTIVITY_LABELS = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};
const DEFAULT_DISCORD_STATUS_TEXT = "doing nothing.";

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

const platformIconSvgs = {
  desktop: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6v2h3v2H7v-2h3v-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v9h16V7H4z"
      />
    </svg>
  `,
  mobile: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h10V4H7zm4 13h2v2h-2v-2z"
      />
    </svg>
  `,
  web: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm7.7 9h-3.2a15.6 15.6 0 0 0-1.4-6A8.02 8.02 0 0 1 19.7 11zm-5.3 0h-4.8A13.8 13.8 0 0 1 12 4c.9 1.2 1.6 3.6 2.4 7zm-4.8 2h4.8c-.8 3.4-1.5 5.8-2.4 7a13.8 13.8 0 0 1-2.4-7zm6.2 0h3.2a8.02 8.02 0 0 1-4.6 6 15.6 15.6 0 0 0 1.4-6zM4.3 13h3.2a15.6 15.6 0 0 0 1.4 6 8.02 8.02 0 0 1-4.6-6zm5.9-8a15.6 15.6 0 0 0-1.4 6H4.3a8.02 8.02 0 0 1 4.6-6z"
      />
    </svg>
  `,
};

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

const LOW_END_NOTICE_MESSAGE = "Low end device detected optimizations active";
let reducedMotionNoticeActive = false;

const maybeShowReducedMotionNotice = (matches) => {
  if (!matches) {
    reducedMotionNoticeActive = false;
    return;
  }
  if (reducedMotionNoticeActive) {
    return;
  }
  reducedMotionNoticeActive = true;
  showToast(LOW_END_NOTICE_MESSAGE);
};

const handleReducedMotionChange = (event) => {
  maybeShowReducedMotionNotice(event.matches);
};

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let lastFocusedElement = null;

const getFocusableElements = (modal) => {
  if (!modal) {
    return [];
  }

  return Array.from(modal.querySelectorAll(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled")
  );
};

const setScrollbarCompensation = () => {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty(
    "--scrollbar-comp",
    `${Math.max(scrollBarWidth, 0)}px`
  );
};

const resetScrollbarCompensation = () => {
  document.body.style.removeProperty("--scrollbar-comp");
};

// Hero story expand/collapse toggle.
const setHeroStoryExpanded = (isExpanded) => {
  if (!heroStory || !heroStoryToggle) {
    return;
  }

  heroStoryToggle.setAttribute("aria-expanded", String(isExpanded));
  heroStory.setAttribute("aria-hidden", String(!isExpanded));
  heroStory.classList.toggle("is-expanded", isExpanded);

  if (prefersReducedMotion.matches) {
    heroStory.style.height = isExpanded ? "auto" : "0px";
    return;
  }

  if (isExpanded) {
    heroStory.style.height = `${heroStory.scrollHeight}px`;
  } else {
    heroStory.style.height = `${heroStory.scrollHeight}px`;
    window.requestAnimationFrame(() => {
      heroStory.style.height = "0px";
    });
  }
};

const syncHeroStoryHeight = () => {
  if (!heroStory || !heroStory.classList.contains("is-expanded")) {
    return;
  }

  if (prefersReducedMotion.matches) {
    heroStory.style.height = "auto";
    return;
  }

  heroStory.style.height = "auto";
  heroStory.style.height = `${heroStory.scrollHeight}px`;
};

const handleHeroStoryToggle = () => {
  if (!heroStoryToggle) {
    return;
  }

  const isExpanded = heroStoryToggle.getAttribute("aria-expanded") === "true";
  setHeroStoryExpanded(!isExpanded);
};

const uiToggleKeys = new Set();
let uiToggleArmed = false;

const isEditableTarget = (target) => {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
};

const toggleUiVisibility = () => {
  document.body.classList.toggle("ui-hidden");
};

const handleUiToggleKeydown = (event) => {
  if (isEditableTarget(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();
  if (key !== "d" && key !== "f") {
    return;
  }

  uiToggleKeys.add(key);

  if (!uiToggleArmed && uiToggleKeys.has("d") && uiToggleKeys.has("f")) {
    toggleUiVisibility();
    uiToggleArmed = true;
  }
};

const handleUiToggleKeyup = (event) => {
  const key = event.key.toLowerCase();
  if (key !== "d" && key !== "f") {
    return;
  }

  uiToggleKeys.delete(key);
  if (!uiToggleKeys.has("d") || !uiToggleKeys.has("f")) {
    uiToggleArmed = false;
  }
};


const setContactModalOrigin = () => {
  if (!contactModal) {
    return;
  }

  const modalInner = contactModal.querySelector(".contact-modal-inner");
  if (!modalInner || !contactButton) {
    contactModal.style.setProperty("--contact-origin-x", "0px");
    contactModal.style.setProperty("--contact-origin-y", "0px");
    return;
  }

  const buttonRect = contactButton.getBoundingClientRect();
  const modalRect = modalInner.getBoundingClientRect();

  if (buttonRect.width === 0 && buttonRect.height === 0) {
    contactModal.style.setProperty("--contact-origin-x", "0px");
    contactModal.style.setProperty("--contact-origin-y", "0px");
    return;
  }

  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  const modalCenterX = modalRect.left + modalRect.width / 2;
  const modalCenterY = modalRect.top + modalRect.height / 2;

  const deltaX = Math.round(buttonCenterX - modalCenterX);
  const deltaY = Math.round(buttonCenterY - modalCenterY);

  contactModal.style.setProperty("--contact-origin-x", `${deltaX}px`);
  contactModal.style.setProperty("--contact-origin-y", `${deltaY}px`);
};

const setSupportModalOrigin = () => {
  if (!supportModal) {
    return;
  }

  const modalInner = supportModal.querySelector(".contact-modal-inner");
  if (!modalInner || !supportButton) {
    supportModal.style.setProperty("--contact-origin-x", "0px");
    supportModal.style.setProperty("--contact-origin-y", "0px");
    return;
  }

  const buttonRect = supportButton.getBoundingClientRect();
  const modalRect = modalInner.getBoundingClientRect();

  if (buttonRect.width === 0 && buttonRect.height === 0) {
    supportModal.style.setProperty("--contact-origin-x", "0px");
    supportModal.style.setProperty("--contact-origin-y", "0px");
    return;
  }

  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  const modalCenterX = modalRect.left + modalRect.width / 2;
  const modalCenterY = modalRect.top + modalRect.height / 2;

  const deltaX = Math.round(buttonCenterX - modalCenterX);
  const deltaY = Math.round(buttonCenterY - modalCenterY);

  supportModal.style.setProperty("--contact-origin-x", `${deltaX}px`);
  supportModal.style.setProperty("--contact-origin-y", `${deltaY}px`);
};

const showSection = (section) => {
  if (
    !section ||
    (!section.hasAttribute("hidden") && !section.classList.contains("is-hidden"))
  ) {
    return;
  }

  section.classList.add("view-section");
  section.removeAttribute("hidden");
  section.setAttribute("aria-hidden", "false");
  section.classList.add("is-hidden");

  if (prefersReducedMotion.matches) {
    section.classList.remove("is-hidden");
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      section.classList.remove("is-hidden");
    });
  });
};

const hideSection = (section) => {
  if (!section || section.hasAttribute("hidden")) {
    return;
  }

  section.classList.add("view-section");
  section.classList.add("is-hidden");
  section.setAttribute("aria-hidden", "true");

  if (prefersReducedMotion.matches) {
    section.setAttribute("hidden", "");
    return;
  }

  const finalize = (event) => {
    if (event && event.target !== section) {
      return;
    }
    section.setAttribute("hidden", "");
    section.removeEventListener("transitionend", finalize);
  };

  section.addEventListener("transitionend", finalize);
  window.setTimeout(() => {
    if (!section.hasAttribute("hidden")) {
      finalize();
    }
  }, VIEW_TRANSITION_MS + 60);
};

const setView = (view) => {
  if (view === currentView) {
    return;
  }

  currentView = view;
  document.body.classList.toggle("show-projects", view === VIEW_PROJECTS);

  if (viewSwapTimeoutId) {
    window.clearTimeout(viewSwapTimeoutId);
    viewSwapTimeoutId = null;
  }

  const schedule = (callback) => {
    if (prefersReducedMotion.matches) {
      callback();
      return;
    }
    viewSwapTimeoutId = window.setTimeout(callback, VIEW_SWAP_DELAY);
  };

  if (view === VIEW_HOME) {
    if (projectsSection) {
      hideSection(projectsSection);
    }
    schedule(() => {
      homeSections.forEach((section) => showSection(section));
    });
    return;
  }

  homeSections.forEach((section) => hideSection(section));

  if (view === VIEW_PROJECTS) {
    schedule(() => {
      if (projectsSection) {
        showSection(projectsSection);
      }
    });
    return;
  }
};

const shouldHandleNavClick = (event) => {
  if (event.defaultPrevented) {
    return false;
  }
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return false;
  }
  return true;
};

const handleProjectsNavClick = (event) => {
  if (!shouldHandleNavClick(event)) {
    return;
  }
  if (!projectsSection) {
    return;
  }
  event.preventDefault();
  setView(VIEW_PROJECTS);
  projectsSection.scrollIntoView({
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    block: "start",
  });
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname);
  }
};

const handleHomeNavClick = (event) => {
  if (!shouldHandleNavClick(event)) {
    return;
  }
  if (!projectsSection) {
    return;
  }
  event.preventDefault();
  setView(VIEW_HOME);
  if (window.location.hash) {
    window.history.pushState(null, "", window.location.pathname);
  }
};

const openContactModal = () => {
  if (!contactModal || !contactBackdrop) {
    return;
  }

  lastFocusedElement = document.activeElement;
  setContactModalOrigin();
  setScrollbarCompensation();
  contactModal.classList.add("open");
  contactBackdrop.classList.add("open");
  document.body.classList.add("modal-open");
  contactModal.setAttribute("aria-hidden", "false");

  if (contactStatus) {
    contactStatus.textContent = "";
    contactStatus.classList.remove("success", "error");
  }

  const focusable = getFocusableElements(contactModal);
  if (focusable.length > 0) {
    focusable[0].focus();
  }
};

const closeContactModal = () => {
  if (!contactModal || !contactBackdrop) {
    return;
  }

  contactModal.classList.remove("open");
  contactBackdrop.classList.remove("open");
  document.body.classList.remove("modal-open");
  resetScrollbarCompensation();
  contactModal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
};

const handleContactKeydown = (event) => {
  if (!contactModal || !contactModal.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeContactModal();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(contactModal);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const openSupportModal = () => {
  if (!supportModal || !supportBackdrop) {
    return;
  }

  lastFocusedElement = document.activeElement;
  setSupportModalOrigin();
  setScrollbarCompensation();
  supportModal.classList.add("open");
  supportBackdrop.classList.add("open");
  document.body.classList.add("modal-open");
  supportModal.setAttribute("aria-hidden", "false");

  const focusable = getFocusableElements(supportModal);
  if (focusable.length > 0) {
    focusable[0].focus();
  }
};

const closeSupportModal = () => {
  if (!supportModal || !supportBackdrop) {
    return;
  }

  supportModal.classList.remove("open");
  supportBackdrop.classList.remove("open");
  document.body.classList.remove("modal-open");
  resetScrollbarCompensation();
  supportModal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
};

const handleSupportKeydown = (event) => {
  if (!supportModal || !supportModal.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeSupportModal();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(supportModal);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const handleContactSubmit = async (event) => {
  event.preventDefault();
  if (!contactForm) {
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
  }

  if (contactStatus) {
    contactStatus.textContent = "Sending...";
    contactStatus.classList.remove("success", "error");
  }

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Formspree error");
    }

    if (contactStatus) {
      contactStatus.textContent = "Message sent.";
      contactStatus.classList.add("success");
      contactStatus.classList.remove("error");
    }

    contactForm.reset();
  } catch (error) {
    if (contactStatus) {
      contactStatus.textContent = "Something went wrong. Please try again.";
      contactStatus.classList.add("error");
      contactStatus.classList.remove("success");
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  }
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

const getStatusColor = (status) => {
  switch (status) {
    case "online":
      return "#3ba55d";
    case "idle":
      return "#f0b232";
    case "dnd":
      return "#ed4245";
    default:
      return "#76808f";
  }
};

const getActivePlatform = (presence) => {
  if (!presence) {
    return null;
  }
  if (presence.active_on_discord_desktop) {
    return "desktop";
  }
  if (presence.active_on_discord_mobile) {
    return "mobile";
  }
  if (presence.active_on_discord_web) {
    return "web";
  }
  return null;
};

const getPrimaryNonSpotifyActivity = (activities) => {
  if (!Array.isArray(activities)) {
    return null;
  }

  const candidates = activities.filter(
    (activity) =>
      activity &&
      activity.name &&
      activity.name !== "Spotify" &&
      activity.type !== 2 &&
      activity.type !== 4 &&
      activity.name !== "Custom Status"
  );

  const withStart = candidates.find(
    (activity) => activity.timestamps && activity.timestamps.start
  );

  return withStart || candidates[0] || null;
};

const getSpotifyProgress = (start, end) => {
  if (!start || !end || end <= start) {
    return null;
  }

  const totalMs = end - start;
  const elapsedMs = Math.min(Math.max(Date.now() - start, 0), totalMs);
  const percent = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;

  return {
    percent,
    elapsedMs,
    totalMs,
  };
};

const formatElapsed = (ms) => {
  if (typeof ms !== "number" || Number.isNaN(ms) || ms < 0) {
    return "";
  }

  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const pickPrimaryActivity = (activities, listeningToSpotify = false) => {
  if (!Array.isArray(activities)) {
    return null;
  }

  if (listeningToSpotify) {
    const spotifyActivity = activities.find(
      (activity) => activity && activity.name === "Spotify"
    );
    if (spotifyActivity) {
      return spotifyActivity;
    }
  }

  return (
    activities.find(
      (activity) =>
        activity &&
        activity.name &&
        activity.name !== "Spotify" &&
        activity.type !== 4 &&
        activity.name !== "Custom Status"
    ) || null
  );
};

const hasActivityData = (activity) => {
  if (!activity) {
    return false;
  }

  const hasText = Boolean(activity.name || activity.details || activity.state);
  const hasAsset = Boolean(
    activity.assets &&
      (activity.assets.large_image || activity.assets.small_image)
  );

  return hasText || hasAsset;
};

const formatTime = (ms) => {
  if (typeof ms !== "number" || Number.isNaN(ms)) {
    return "";
  }
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getActivityAssetUrl = (activity) => {
  if (!activity || !activity.assets) {
    return null;
  }

  const asset =
    activity.assets.large_image || activity.assets.small_image || null;

  if (!asset || typeof asset !== "string") {
    return null;
  }

  if (asset.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${asset.replace("spotify:", "")}`;
  }

  if (asset.startsWith("mp:")) {
    return `https://media.discordapp.net/${asset.replace("mp:", "")}`;
  }

  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
  }

  return null;
};

const getCustomStatusText = (activities) => {
  if (!Array.isArray(activities)) {
    return "";
  }

  const customStatus = activities.find(
    (activity) =>
      activity && (activity.type === 4 || activity.name === "Custom Status")
  );

  if (!customStatus) {
    return "";
  }

  const emoji = customStatus.emoji && customStatus.emoji.name;
  const text = customStatus.state || customStatus.details || "";
  return [emoji, text].filter(Boolean).join(" ").trim();
};

const formatDiscordActivity = (activity, customStatusText) => {
  if (!activity || !activity.name) {
    return customStatusText || DEFAULT_DISCORD_STATUS_TEXT;
  }

  const label =
    DISCORD_ACTIVITY_LABELS[activity.type] ||
    DISCORD_ACTIVITY_LABELS[0];

  return `${label} ${activity.name}`;
};

const setDiscordStatus = (status) => {
  if (discordCard) {
    discordCard.dataset.status = status;
    discordCard.style.setProperty("--status-color", getStatusColor(status));
  }

};

const setDiscordActivity = (text) => {
  if (discordActivity) {
    discordActivity.textContent = text;
  }
};

const setPresenceIndicator = (status, platform) => {
  if (!presenceBadge) {
    return;
  }

  const hasPlatform = Boolean(platform);
  presenceBadge.classList.toggle("is-fallback", !hasPlatform);

  if (presenceIcon) {
    if (hasPlatform && platformIconSvgs[platform]) {
      presenceIcon.innerHTML = platformIconSvgs[platform];
      presenceIcon.hidden = false;
    } else {
      presenceIcon.innerHTML = "";
      presenceIcon.hidden = true;
    }
  }

  if (presenceDot) {
    presenceDot.hidden = hasPlatform;
  }

  if (discordCard) {
    discordCard.style.setProperty("--status-color", getStatusColor(status));
  }
};

const resetSpotifyTimer = () => {
  if (spotifyProgressTimer) {
    window.clearInterval(spotifyProgressTimer);
    spotifyProgressTimer = null;
  }
  spotifyProgressState = null;
};

const resetActivityTimer = () => {
  if (activityElapsedTimer) {
    window.clearInterval(activityElapsedTimer);
    activityElapsedTimer = null;
  }
  activityElapsedState = null;
};

const updateSpotifyProgress = () => {
  if (!spotifyProgressState) {
    return;
  }

  const { barEl, timeEl, start, end } = spotifyProgressState;
  const progress = getSpotifyProgress(start, end);

  if (!progress) {
    barEl.style.width = "0%";
    if (timeEl) {
      timeEl.textContent = "";
      timeEl.hidden = true;
    }
    return;
  }

  barEl.style.width = `${Math.min(progress.percent, 100)}%`;

  if (timeEl) {
    timeEl.hidden = false;
    timeEl.textContent = `${formatTime(progress.elapsedMs)} / ${formatTime(
      progress.totalMs
    )}`;
  }
};

const updateActivityElapsed = () => {
  if (!activityElapsedState) {
    return;
  }

  const { lineEl, start } = activityElapsedState;
  if (!start || !lineEl) {
    return;
  }

  const elapsedText = formatElapsed(Date.now() - start);
  lineEl.textContent = elapsedText ? `Open for: ${elapsedText}` : "";
};

const createSpotifyWidget = ({
  songTitle,
  songArtist,
  albumArt,
  start,
  end,
}) => {
  const wrap = document.createElement("div");
  wrap.className = "discord-spotify";

  if (!albumArt) {
    wrap.classList.add("no-art");
  }

  if (albumArt) {
    const art = document.createElement("img");
    art.className = "spotify-art";
    art.alt = "";
    art.loading = "lazy";
    art.decoding = "async";
    art.src = albumArt;
    wrap.appendChild(art);
  }

  const meta = document.createElement("div");
  meta.className = "spotify-meta";

  const titleEl = document.createElement("p");
  titleEl.className = "spotify-title";
  titleEl.textContent = songTitle || "";

  const artistEl = document.createElement("p");
  artistEl.className = "spotify-artist";
  artistEl.textContent = songArtist || "";

  const progressWrap = document.createElement("div");
  progressWrap.className = "spotify-progress";

  const progressBar = document.createElement("span");
  progressBar.className = "spotify-progress-bar";
  progressWrap.appendChild(progressBar);

  const timeEl = document.createElement("p");
  timeEl.className = "spotify-time";
  timeEl.setAttribute("aria-hidden", "true");

  meta.appendChild(titleEl);
  meta.appendChild(artistEl);
  meta.appendChild(progressWrap);
  meta.appendChild(timeEl);
  wrap.appendChild(meta);

  spotifyProgressState = {
    barEl: progressBar,
    timeEl,
    start,
    end,
  };

  return wrap;
};

const createActivityWidget = ({ activity, imageUrl, start }) => {
  const wrap = document.createElement("div");
  wrap.className = "discord-activity-block";

  if (!imageUrl) {
    wrap.classList.add("no-image");
  }

  if (imageUrl) {
    const img = document.createElement("img");
    img.className = "activity-image";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = imageUrl;
    wrap.appendChild(img);
  }

  const meta = document.createElement("div");
  meta.className = "activity-meta";

  const nameEl = document.createElement("p");
  nameEl.className = "activity-name";
  nameEl.textContent = activity.name || "";

  let elapsedEl = null;
  if (start) {
    elapsedEl = document.createElement("p");
    elapsedEl.className = "activity-elapsed";
  }

  const detailsEl = document.createElement("p");
  detailsEl.className = "activity-details";
  detailsEl.textContent = activity.details || "";

  const stateEl = document.createElement("p");
  stateEl.className = "activity-state";
  stateEl.textContent = activity.state || "";

  meta.appendChild(nameEl);
  if (elapsedEl) {
    meta.appendChild(elapsedEl);
    activityElapsedState = { lineEl: elapsedEl, start };
  }
  meta.appendChild(detailsEl);
  meta.appendChild(stateEl);
  wrap.appendChild(meta);

  return wrap;
};

const clearDiscordWidgets = () => {
  if (!discordText) {
    return;
  }

  discordText
    .querySelectorAll(".discord-spotify, .discord-activity-block")
    .forEach((element) => element.remove());
  resetSpotifyTimer();
  resetActivityTimer();
};

const renderDiscordWidgets = ({
  spotify,
  spotifyActivity,
  listeningToSpotify,
  activity,
}) => {
  if (!discordText) {
    return;
  }

  clearDiscordWidgets();

  const hasSpotify =
    Boolean(listeningToSpotify || spotifyActivity) &&
    Boolean(
      spotify?.song ||
        spotify?.artist ||
        spotify?.album_art_url ||
        spotifyActivity?.details ||
        spotifyActivity?.state ||
        getActivityAssetUrl(spotifyActivity)
    );

  if (hasSpotify) {
    const albumArt =
      spotify?.album_art_url || getActivityAssetUrl(spotifyActivity);

    const spotifyWidget = createSpotifyWidget({
      songTitle: spotify?.song || spotifyActivity?.details || "",
      songArtist: spotify?.artist || spotifyActivity?.state || "",
      albumArt,
      start:
        spotify?.timestamps?.start ||
        spotifyActivity?.timestamps?.start ||
        null,
      end:
        spotify?.timestamps?.end || spotifyActivity?.timestamps?.end || null,
    });

    discordText.appendChild(spotifyWidget);
  }

  const hasActivity = hasActivityData(activity);
  if (hasActivity) {
    const activityWidget = createActivityWidget({
      activity,
      imageUrl: getActivityAssetUrl(activity),
      start: activity?.timestamps?.start || null,
    });
    discordText.appendChild(activityWidget);
  }

  if (spotifyProgressState?.start && spotifyProgressState?.end) {
    updateSpotifyProgress();
    spotifyProgressTimer = window.setInterval(updateSpotifyProgress, 1000);
  } else if (spotifyProgressState) {
    updateSpotifyProgress();
  }

  if (activityElapsedState?.start) {
    updateActivityElapsed();
    activityElapsedTimer = window.setInterval(updateActivityElapsed, 10000);
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
    discordCard.style.setProperty("--status-color", getStatusColor("unknown"));
  }
  if (discordActivity) {
    discordActivity.textContent = "Discord status unavailable";
  }
  setPresenceIndicator("unknown", null);
  clearDiscordWidgets();
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
    const activities = Array.isArray(data.activities) ? data.activities : [];
    const listeningToSpotify = Boolean(data.listening_to_spotify);
    const spotifyActivity = activities.find(
      (activity) => activity && activity.name === "Spotify"
    );
    const primaryActivity = pickPrimaryActivity(
      activities,
      listeningToSpotify
    );
    const gameActivity = getPrimaryNonSpotifyActivity(activities);
    const activePlatform = getActivePlatform(data);
    const customStatusText = getCustomStatusText(activities);

    setDiscordStatus(status);
    setDiscordActivity(
      formatDiscordActivity(primaryActivity, customStatusText)
    );
    setPresenceIndicator(status, activePlatform);
    renderDiscordWidgets({
      spotify: data.spotify,
      spotifyActivity,
      listeningToSpotify,
      activity: gameActivity,
    });

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

  const shouldCollapse =
    !linksExpanded && links.length > VISIBLE_LINK_COUNT;

  const createSeeMore = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "links-toggle";
    button.textContent = "See more";
    button.setAttribute("data-reveal", "");

    button.addEventListener("click", () => {
      if (button.classList.contains("is-exiting")) {
        return;
      }
      linksExpanded = true;
      const revealCards = Array.from(
        linksGrid.querySelectorAll(".link-card.is-collapsed")
      );
      revealCards.forEach((card) => {
        card.style.setProperty("--reveal-delay", "0ms");
        card.classList.remove("is-collapsed");
        if (prefersReducedMotion.matches) {
          card.classList.add("is-visible");
        } else {
          card.classList.remove("is-visible");
        }
      });
      if (!prefersReducedMotion.matches) {
        window.requestAnimationFrame(() => {
          revealCards.forEach((card) => card.classList.add("is-visible"));
        });
      }
      button.disabled = true;
      button.classList.add("is-exiting");

      const removeButton = () => {
        button.remove();
      };

      button.addEventListener("transitionend", removeButton, { once: true });
      window.setTimeout(removeButton, 320);
    });

    return button;
  };

  links.forEach((link, index) => {
    const card = document.createElement("a");
    card.className = "link-card";
    card.setAttribute("data-reveal", "");
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

    if (shouldCollapse && index === VISIBLE_LINK_COUNT - 1) {
      linksGrid.appendChild(createSeeMore());
    }

    if (shouldCollapse && index >= VISIBLE_LINK_COUNT) {
      card.classList.add("is-collapsed");
    }
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

const setupScrollReveal = () => {
  const revealElements = Array.from(
    document.querySelectorAll("[data-reveal]")
  );

  if (revealElements.length === 0) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  document.body.classList.add("reveal-ready");

  const revealOrder = new Map(
    revealElements.map((element, index) => [element, index])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) {
        return;
      }

      visibleEntries.sort(
        (a, b) => revealOrder.get(a.target) - revealOrder.get(b.target)
      );

      visibleEntries.forEach((entry, index) => {
        entry.target.style.transitionDelay = `${Math.min(index * 80, 240)}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
};

renderLinks();
// Scroll reveal handled in js/effects.js.

maybeShowReducedMotionNotice(prefersReducedMotion.matches);
if (prefersReducedMotion.addEventListener) {
  prefersReducedMotion.addEventListener("change", handleReducedMotionChange);
} else if (prefersReducedMotion.addListener) {
  prefersReducedMotion.addListener(handleReducedMotionChange);
}

if (homeLink && projectsSection) {
  setView(VIEW_HOME);
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname);
  }
  if (projectsLink && projectsSection) {
    projectsLink.addEventListener("click", handleProjectsNavClick);
  }
  homeLink.addEventListener("click", handleHomeNavClick);
}

if (contactButton) {
  contactButton.addEventListener("click", openContactModal);
}

if (contactClose) {
  contactClose.addEventListener("click", closeContactModal);
}

if (contactBackdrop) {
  contactBackdrop.addEventListener("click", closeContactModal);
}

if (contactForm) {
  contactForm.addEventListener("submit", handleContactSubmit);
}

if (supportButton) {
  supportButton.addEventListener("click", openSupportModal);
}

if (supportClose) {
  supportClose.addEventListener("click", closeSupportModal);
}

if (supportBackdrop) {
  supportBackdrop.addEventListener("click", closeSupportModal);
}

if (heroStoryToggle && heroStory) {
  heroStory.style.height = "0px";
  heroStoryToggle.addEventListener("click", handleHeroStoryToggle);
  heroStory.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "height") {
      return;
    }
    if (heroStory.classList.contains("is-expanded")) {
      heroStory.style.height = "auto";
    }
  });
  window.addEventListener("resize", syncHeroStoryHeight);
}

document.addEventListener("keydown", handleContactKeydown);
document.addEventListener("keydown", handleSupportKeydown);
document.addEventListener("keydown", handleUiToggleKeydown);
document.addEventListener("keyup", handleUiToggleKeyup);
window.addEventListener("blur", () => {
  uiToggleKeys.clear();
  uiToggleArmed = false;
});

if (discordCard) {
  const cachedAvatar = getCachedDiscordAvatar();
  if (cachedAvatar) {
    setDiscordAvatar(cachedAvatar);
  }

  updateDiscordPresence();
  window.setInterval(updateDiscordPresence, 30000);
}
