const UNIVERSE_ID = 10492023323;
const PLACE_ID = 98311703008851;
const CACHE_TTL_SECONDS = 60;

const jsonResponse = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control":
        status === 200
          ? `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}`
          : "no-store",
    },
  });

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, { method: "GET" });
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const [gameResponse, iconResponse] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`),
      fetch(
        `https://thumbnails.roblox.com/v1/games/icons?universeIds=${UNIVERSE_ID}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
      ),
    ]);

    if (!gameResponse.ok || !iconResponse.ok) {
      throw new Error("Roblox returned an unsuccessful response");
    }

    const [gamePayload, iconPayload] = await Promise.all([
      gameResponse.json(),
      iconResponse.json(),
    ]);
    const game = gamePayload.data?.[0];
    const icon = iconPayload.data?.[0];

    if (!game || !icon?.imageUrl) {
      throw new Error("Roblox returned incomplete game data");
    }

    const response = jsonResponse({
      name: game.name,
      playing: game.playing,
      visits: game.visits,
      imageUrl: icon.imageUrl,
      gameUrl: `https://www.roblox.com/games/${PLACE_ID}`,
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    console.error("Roblox game data request failed", error);
    return jsonResponse({ error: "Roblox game data is unavailable" }, 502);
  }
}
