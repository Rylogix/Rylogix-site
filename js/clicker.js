(() => {
  const clicker = document.getElementById("clicker");
  const countEl = document.getElementById("count");
  let count = 67;

  const updateCount = () => {
    count += 1;
    countEl.textContent = String(count);

    countEl.classList.remove("pulse");
    void countEl.offsetWidth;
    countEl.classList.add("pulse");
  };

  clicker.addEventListener("pointerdown", updateCount);
  countEl.addEventListener("animationend", () => {
    countEl.classList.remove("pulse");
  });
})();
