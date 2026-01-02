(() => {
  // Blog dataset: update this list for new or edited posts.
  const BLOG_ENTRIES = [
    {
      id: "end-of-stranger-things",
      title: "The end of Stranger Things.",
      date: "2026-01-01",
      body: [
        "I watched the season 5 Finale today in theatres, and oh my god did it put me through shock.",
        "I'm not saying I was sitting there shaking, but this movie had me going through so many different strong emotions that for the next 4 hours after the movie I was like emotionless lmao.",
        "This show I grew up on and have been watching it since i was 11 years old, im now 17 and its all over, the best show I have EVER watched in my life no joke.",
        "It upsets me that some of my friends don't even want to bother watching it even though I'm not the only one saying this is one of the greatest shows of all time.",
        "The suspense is insane, and the plot twists are even crazier.",
        "If you've never watched Stranger Things, I wish I were you so I could be able to watch it again for the first time.",
      ],
    },
  ];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const blogTabs = document.getElementById("blog-tabs");
  const blogSelect = document.getElementById("blog-select");
  const blogTabsLeft = document.getElementById("blog-tabs-left");
  const blogTabsRight = document.getElementById("blog-tabs-right");
  const blogTitle = document.getElementById("blog-title");
  const blogDate = document.getElementById("blog-date");
  const blogBody = document.getElementById("blog-body");
  const blogContent = document.getElementById("blog-content");

  if (!blogTabs || !blogSelect || !blogTitle || !blogDate || !blogBody) {
    return;
  }

  const parseEntryDate = (value) => {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  const entries = [...BLOG_ENTRIES].sort(
    (a, b) => parseEntryDate(b.date) - parseEntryDate(a.date)
  );
  const entryIndex = new Map(
    entries.map((entry, index) => [entry.id, index])
  );
  const tabButtons = [];
  let currentId = null;

  const formatDate = (value) => {
    const parsed = parseEntryDate(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearChildren = (node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  const updateTabScrollButtons = () => {
    if (!blogTabsLeft || !blogTabsRight) {
      return;
    }
    const maxScrollLeft = blogTabs.scrollWidth - blogTabs.clientWidth;
    if (maxScrollLeft <= 0) {
      blogTabsLeft.disabled = true;
      blogTabsRight.disabled = true;
      return;
    }
    blogTabsLeft.disabled = blogTabs.scrollLeft <= 0;
    blogTabsRight.disabled = blogTabs.scrollLeft >= maxScrollLeft - 1;
  };

  const scrollTabsBy = (direction) => {
    const amount = Math.max(160, Math.round(blogTabs.clientWidth * 0.6));
    blogTabs.scrollBy({
      left: direction * amount,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  };

  const renderBody = (entry) => {
    clearChildren(blogBody);
    const paragraphs = Array.isArray(entry.body) ? entry.body : [entry.body];
    paragraphs
      .filter((text) => typeof text === "string" && text.trim().length > 0)
      .forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        blogBody.appendChild(paragraph);
      });
  };

  const updateNavigator = (entry) => {
    const activeIndex = entryIndex.get(entry.id) ?? 0;
    tabButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.tabIndex = isActive ? 0 : -1;
      if (isActive) {
        button.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
    blogSelect.value = entry.id;
    if (blogContent) {
      blogContent.setAttribute("aria-labelledby", `blog-tab-${entry.id}`);
    }
  };

  // URL state: keep the selected blog in the query so links are shareable.
  const updateUrlState = (id, { replace } = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.set("blog", id);
    url.hash = "";
    if (replace) {
      window.history.replaceState({ blog: id }, "", url);
      return;
    }
    window.history.pushState({ blog: id }, "", url);
  };

  const getBlogIdFromUrl = () => {
    const url = new URL(window.location.href);
    const queryId = url.searchParams.get("blog");
    if (queryId) {
      return queryId;
    }
    if (window.location.hash) {
      return decodeURIComponent(window.location.hash.slice(1));
    }
    return null;
  };

  const swapContent = (update) => {
    if (prefersReducedMotion.matches || !blogContent) {
      update();
      return;
    }

    blogContent.classList.add("is-switching");
    window.setTimeout(() => {
      update();
      window.requestAnimationFrame(() => {
        blogContent.classList.remove("is-switching");
      });
    }, 160);
  };

  const setActiveBlog = (
    id,
    { pushState = true, animate = true } = {}
  ) => {
    const resolvedId = entryIndex.has(id) ? id : entries[0]?.id;
    if (!resolvedId) {
      return;
    }
    if (resolvedId === currentId && currentId !== null) {
      return;
    }

    const entry = entries[entryIndex.get(resolvedId)];
    const apply = () => {
      currentId = entry.id;
      blogTitle.textContent = entry.title;
      blogDate.textContent = formatDate(entry.date);
      renderBody(entry);
      updateNavigator(entry);
      if (pushState) {
        updateUrlState(entry.id);
      }
    };

    if (animate) {
      swapContent(apply);
      return;
    }

    apply();
  };

  const renderNavigator = () => {
    clearChildren(blogTabs);
    clearChildren(blogSelect);
    tabButtons.length = 0;

    entries.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "blog-tab";
      button.id = `blog-tab-${entry.id}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("aria-controls", "blog-content");
      button.dataset.blogId = entry.id;
      button.textContent = entry.title;
      button.addEventListener("click", () => {
        setActiveBlog(entry.id);
      });
      blogTabs.appendChild(button);
      tabButtons.push(button);

      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.title;
      blogSelect.appendChild(option);
    });
    updateTabScrollButtons();
  };

  const handleTabKeydown = (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (!tabButtons.length) {
      return;
    }
    const currentIndex =
      currentId && entryIndex.has(currentId) ? entryIndex.get(currentId) : 0;
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + entries.length) % entries.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % entries.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = entries.length - 1;
    }

    const nextEntry = entries[nextIndex];
    if (!nextEntry) {
      return;
    }
    setActiveBlog(nextEntry.id);
    tabButtons[nextIndex].focus();
  };

  const init = () => {
    if (!entries.length) {
      return;
    }

    renderNavigator();

    const initialId = getBlogIdFromUrl() || entries[0].id;
    const hadUrlState = Boolean(getBlogIdFromUrl());
    setActiveBlog(initialId, { pushState: false, animate: false });
    if (!hadUrlState) {
      updateUrlState(initialId, { replace: true });
    }

    blogSelect.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) {
        return;
      }
      setActiveBlog(target.value);
    });

    blogTabs.addEventListener("keydown", handleTabKeydown);
    blogTabs.addEventListener("scroll", updateTabScrollButtons, {
      passive: true,
    });
    window.addEventListener("resize", updateTabScrollButtons);

    if (blogTabsLeft) {
      blogTabsLeft.addEventListener("click", () => scrollTabsBy(-1));
    }
    if (blogTabsRight) {
      blogTabsRight.addEventListener("click", () => scrollTabsBy(1));
    }

    window.addEventListener("popstate", () => {
      const id = getBlogIdFromUrl() || entries[0].id;
      setActiveBlog(id, { pushState: false });
    });

    document.addEventListener("blogs:shown", () => {
      window.requestAnimationFrame(updateTabScrollButtons);
    });

    updateTabScrollButtons();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
