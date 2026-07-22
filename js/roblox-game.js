const ROBLOX_GAME_REFRESH_MS = 60000;

const formatRobloxStat = new Intl.NumberFormat("en-US");

const updateRobloxGameCard = async () => {
  const cards = document.querySelectorAll("[data-roblox-game]");
  if (cards.length === 0) {
    return;
  }

  try {
    const response = await fetch("api/roblox-game", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Roblox game data is unavailable");
    }

    const game = await response.json();

    cards.forEach((card) => {
      const name = card.querySelector("[data-roblox-name]");
      const icon = card.querySelector("[data-roblox-icon]");
      const playing = card.querySelector("[data-roblox-playing]");
      const visits = card.querySelector("[data-roblox-visits]");

      name.textContent = game.name;
      playing.textContent = formatRobloxStat.format(game.playing);
      visits.textContent = formatRobloxStat.format(game.visits);
      card.href = game.gameUrl;
      card.setAttribute("aria-label", `Open ${game.name} on Roblox`);

      if (icon.src !== game.imageUrl) {
        icon.src = game.imageUrl;
      }
      icon.alt = `${game.name} game icon`;
    });
  } catch (error) {
    cards.forEach((card) => {
      card.querySelector("[data-roblox-playing]").textContent = "Unavailable";
      card.querySelector("[data-roblox-visits]").textContent = "Unavailable";
    });
  }
};

updateRobloxGameCard();
window.setInterval(updateRobloxGameCard, ROBLOX_GAME_REFRESH_MS);
