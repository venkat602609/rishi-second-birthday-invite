(function () {
  const config = window.RISHI_INVITE_CONFIG || {};
  const storageKey = config.storageKey || "rsvps";
  const galleryPhotos = [
    { file: "rishi_1.jpeg", tag: "Fresh arrival" },
    { file: "rishi_2.jpeg", tag: "Tiny burrito" },
    { file: "rishi_3.jpeg", tag: "Cozy nap" },
    { file: "rishi_4.jpeg", tag: "Dad cuddles" },
    { file: "rishi_5.jpeg", tag: "Sleepy star" },
    { file: "rishi_6.jpeg", tag: "Curious eyes" },
    { file: "rishi_7.jpeg", tag: "Mom's arms" },
    { file: "rishi_8.jpeg", tag: "First giggles" },
    { file: "rishi_9.jpeg", tag: "Big surprise" },
    { file: "rishi_10.jpeg", tag: "Little grin" },
    { file: "rishi_11.jpeg", tag: "Mommy moment" },
    { file: "rishi_12.jpeg", tag: "Happy baby" },
    { file: "rishi_13.jpeg", tag: "Peekaboo bundle" },
    { file: "rishi_14.jpeg", tag: "Cheeky smile" },
    { file: "rishi_15.jpeg", tag: "Bow-tie charm" },
    { file: "rishi_16.jpeg", tag: "Stretch break" },
    { file: "rishi_17.jpeg", tag: "Cake candles" },
    { file: "rishi_18.jpeg", tag: "Wide-eyed wonder" },
    { file: "rishi_19.jpeg", tag: "Stroller peek" },
    { file: "rishi_20.jpeg", tag: "Tummy time" },
    { file: "rishi_21.jpeg", tag: "Thoughtful gaze" },
    { file: "rishi_22.jpeg", tag: "Suspenders style" },
    { file: "rishi_23.jpeg", tag: "Temple visit" },
    { file: "rishi_24.jpeg", tag: "Autumn walk" },
    { file: "rishi_25.jpeg", tag: "Hair spike" },
    { file: "rishi_26.jpeg", tag: "Sofa explorer" },
    { file: "rishi_27.jpeg", tag: "Blessing day" },
    { file: "rishi_28.jpeg", tag: "Lounging look" },
    { file: "rishi_29.jpeg", tag: "Birthday candles" },
    { file: "rishi_30.jpeg", tag: "Car-seat joy" },
    { file: "rishi_31.jpeg", tag: "Cozy cub" },
    { file: "rishi_32.jpeg", tag: "Festive hugs" },
    { file: "rishi_33.jpeg", tag: "Red kurta" },
    { file: "rishi_34.jpeg", tag: "Blue shirt" },
    { file: "rishi_35.jpeg", tag: "Pool smiles" },
    { file: "rishi_36.jpeg", tag: "Golden hour" },
    { file: "rishi_37.jpeg", tag: "Sunset lift" },
    { file: "rishi_38.jpeg", tag: "Cafe cutie" },
    { file: "rishi_39.jpeg", tag: "High-chair lean" },
    { file: "rishi_40.jpeg", tag: "Skyline play" },
    { file: "rishi_41.jpeg", tag: "Explorer hat" },
    { file: "rishi_42.jpeg", tag: "Creek explorer" },
    { file: "rishi_43.jpeg", tag: "Cabinet adventure" },
    { file: "rishi_44.jpeg", tag: "Petting zoo" },
    { file: "rishi_45.jpeg", tag: "Little gentleman" },
    { file: "rishi_46.jpeg", tag: "Astronaut night" },
    { file: "rishi_47.jpeg", tag: "Mountain view" },
    { file: "rishi_48.jpeg", tag: "Bedtime bounce" },
    { file: "rishi_49.jpeg", tag: "Cave crew" },
    { file: "rishi_50.jpeg", tag: "Castle smiles" },
    { file: "rishi_51.jpeg", tag: "School bag" },
    { file: "rishi_52.jpeg", tag: "Party snack" },
    { file: "rishi_53.jpeg", tag: "Cool shades" },
    { file: "rishi_54.jpeg", tag: "Suit up" },
    { file: "rishi_55.jpeg", tag: "Yosemite stop" },
    { file: "rishi_56.jpeg", tag: "Lamp helper" }
  ];
  function readLocalRsvps() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function writeLocalRsvps(entries) {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }

  function summarize(entries) {
    return entries.reduce(
      (accumulator, entry) => {
        const guests = Number(entry.guests) || 0;
        const status = entry.status || "maybe";
        if (status === "yes") {
          accumulator.yes += 1;
          accumulator.guestCount += guests;
        } else if (status === "no") {
          accumulator.no += 1;
        } else {
          accumulator.maybe += 1;
          accumulator.guestCount += guests;
        }
        return accumulator;
      },
      { yes: 0, no: 0, maybe: 0, guestCount: 0 }
    );
  }

  function updateStats(entries) {
    const stats = summarize(entries);
    document.querySelectorAll("[data-stat]").forEach((node) => {
      const key = node.getAttribute("data-stat");
      if (Object.prototype.hasOwnProperty.call(stats, key)) {
        node.textContent = String(stats[key]);
      }
    });
  }

  function renderTable(entries) {
    const rowsTarget = document.getElementById("rsvp-rows");
    const emptyState = document.getElementById("empty-state");
    if (!rowsTarget) {
      return;
    }

    rowsTarget.innerHTML = entries
      .map(
        (entry) => `
          <tr>
            <td>${escapeHtml(entry.name)}</td>
            <td>${escapeHtml(entry.contact)}</td>
            <td>${escapeHtml(normalizeStatus(entry.status))}</td>
            <td>${escapeHtml(String(entry.guests || 0))}</td>
            <td>${escapeHtml(entry.message || "-")}</td>
            <td>${escapeHtml(formatDate(entry.submittedAt))}</td>
          </tr>
        `
      )
      .join("");

    if (emptyState) {
      emptyState.hidden = entries.length > 0;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString();
  }

  function normalizeStatus(status) {
    if (status === "yes") {
      return "Attending";
    }
    if (status === "no") {
      return "Declined";
    }
    return "Maybe";
  }

  async function loadEntries() {
    if (
      config.submitMode === "remote" &&
      config.remoteProvider === "googleAppsScript" &&
      config.trackerDataUrl
    ) {
      return loadGoogleAppsScriptEntries();
    }

    if (config.submitMode === "remote" && config.trackerDataUrl) {
      try {
        const response = await fetch(config.trackerDataUrl, { cache: "no-store" });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        return readLocalRsvps();
      }
    }
    return readLocalRsvps();
  }

  function loadGoogleAppsScriptEntries() {
    return new Promise((resolve) => {
      const callbackName = `rishiRsvps${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement("script");
      const url = new URL(config.trackerDataUrl);
      url.searchParams.set("callback", callbackName);
      if (config.rsvpToken) {
        url.searchParams.set("token", config.rsvpToken);
      }

      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (payload) => {
        cleanup();
        resolve(Array.isArray(payload) ? payload : payload.entries || []);
      };

      script.onerror = () => {
        cleanup();
        resolve(readLocalRsvps());
      };

      script.src = url.toString();
      document.head.appendChild(script);
      window.setTimeout(() => {
        if (window[callbackName]) {
          cleanup();
          resolve(readLocalRsvps());
        }
      }, 8000);
    });
  }

  async function submitRemote(entry) {
    if (config.remoteProvider === "googleAppsScript") {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(entry));
      if (config.rsvpToken) {
        formData.append("token", config.rsvpToken);
      }

      await fetch(config.rsvpPostUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
      return;
    }

    const response = await fetch(config.rsvpPostUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error("Unable to submit RSVP");
    }
  }

  function wireForm() {
    const form = document.getElementById("rsvp-form");
    const statusNode = document.getElementById("form-status");
    if (!form || !statusNode) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const entry = {
        name: String(formData.get("name") || "").trim(),
        contact: String(formData.get("contact") || "").trim(),
        guests: Number(formData.get("guests") || 1),
        status: String(formData.get("status") || "maybe"),
        message: String(formData.get("message") || "").trim(),
        submittedAt: new Date().toISOString()
      };

      statusNode.textContent = "Submitting RSVP...";

      try {
        if (config.submitMode === "remote" && config.rsvpPostUrl) {
          await submitRemote(entry);
        } else {
          const entries = readLocalRsvps();
          entries.unshift(entry);
          writeLocalRsvps(entries);
        }

        const entries = await loadEntries();
        updateStats(entries);
        renderTable(entries);
        form.reset();
        form.querySelector('input[name="guests"]').value = "1";
        statusNode.textContent =
          config.submitMode === "remote"
            ? "RSVP saved successfully."
            : "RSVP saved in local demo mode. Connect a real endpoint in settings.js for live tracking.";
      } catch (error) {
        statusNode.textContent = "There was a problem sending the RSVP.";
      }
    });
  }

  function wireScrollReveals() {
    const targets = document.querySelectorAll(
      ".hero-copy, .hero-card, .section-heading, .photo-card, .detail-panel, .rsvp-form, .tracker-preview"
    );
    if (!targets.length || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    targets.forEach((target) => target.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function renderGalleryPhotos() {
    const track = document.querySelector("[data-carousel-track]");
    if (!track || !galleryPhotos.length) {
      return;
    }

    track.innerHTML = galleryPhotos
      .map((photo, index) => {
        const src = `assets/gallery/${photo.file}`;
        const eagerAttributes =
          index < 4
            ? `src="${src}" loading="${index === 0 ? "eager" : "lazy"}" fetchpriority="${index === 0 ? "high" : "auto"}"`
            : `data-src="${src}" loading="lazy"`;
        return `
          <figure class="photo-card">
            <img
              ${eagerAttributes}
              decoding="async"
              alt="${escapeHtml(photo.tag)}"
            />
            <figcaption>${escapeHtml(photo.tag)}</figcaption>
          </figure>
        `;
      })
      .join("");
  }

  function wireMomentCarousel() {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }

    const track = carousel.querySelector("[data-carousel-track]");
    const cards = Array.from(carousel.querySelectorAll(".photo-card"));
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dotsTarget = carousel.querySelector("[data-carousel-dots]");
    const countTarget = carousel.querySelector("[data-carousel-count]");
    if (!track || cards.length < 2 || !dotsTarget) {
      return;
    }

    let activeIndex = 0;
    let rotateTimer = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    dotsTarget.innerHTML = cards
      .map(
        (_, index) =>
          `<button class="carousel-dot" type="button" data-carousel-dot="${index}" aria-label="Show photo ${index + 1}"></button>`
      )
      .join("");

    const dots = Array.from(dotsTarget.querySelectorAll("[data-carousel-dot]"));

    function hydrateImage(index) {
      const card = cards[(index + cards.length) % cards.length];
      const image = card?.querySelector("img[data-src]");
      if (!image) {
        return;
      }
      image.src = image.getAttribute("data-src");
      image.removeAttribute("data-src");
    }

    function hydrateNearby(index) {
      for (let offset = -3; offset <= 4; offset += 1) {
        hydrateImage(index + offset);
      }
    }

    function setActive(index, shouldScroll) {
      activeIndex = (index + cards.length) % cards.length;
      hydrateNearby(activeIndex);
      cards.forEach((card, cardIndex) => {
        let offset = cardIndex - activeIndex;
        if (offset > cards.length / 2) {
          offset -= cards.length;
        }
        if (offset < cards.length / -2) {
          offset += cards.length;
        }
        const clampedOffset = Math.max(-3, Math.min(3, offset));
        const depth = Math.min(Math.abs(clampedOffset), 3);
        card.style.setProperty("--moment-x", `${clampedOffset * -8}px`);
        card.style.setProperty("--moment-y", `${depth * 10}px`);
        card.style.setProperty("--moment-rotate-y", `${clampedOffset * -9}deg`);
        card.style.setProperty("--moment-rotate-z", `${clampedOffset * 1.3}deg`);
        card.style.setProperty("--moment-scale", String(1 - depth * 0.055));
        card.style.setProperty("--moment-opacity", String(1 - depth * 0.13));
        card.classList.toggle("is-active-moment", cardIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
      });
      if (countTarget) {
        countTarget.textContent = `${activeIndex + 1} / ${cards.length}`;
      }

      if (shouldScroll) {
        cards[activeIndex].scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }

    function advance(direction) {
      setActive(activeIndex + direction, true);
    }

    function startRotation() {
      if (reduceMotion || rotateTimer) {
        return;
      }
      rotateTimer = window.setInterval(() => advance(1), 3400);
    }

    function stopRotation() {
      window.clearInterval(rotateTimer);
      rotateTimer = null;
    }

    previousButton?.addEventListener("click", () => {
      stopRotation();
      advance(-1);
    });

    nextButton?.addEventListener("click", () => {
      stopRotation();
      advance(1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        stopRotation();
        setActive(Number(dot.getAttribute("data-carousel-dot")), true);
      });
    });

    track.addEventListener("scroll", () => {
      const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
      const closest = cards.reduce(
        (current, card, index) => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
          return distance < current.distance ? { index, distance } : current;
        },
        { index: activeIndex, distance: Number.POSITIVE_INFINITY }
      );
      setActive(closest.index, false);
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startRotation();
            } else {
              stopRotation();
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(carousel);
    } else {
      startRotation();
    }

    setActive(0, false);
  }

  function randomBetween(minimum, maximum) {
    return Math.random() * (maximum - minimum) + minimum;
  }

  function wireHeroRibbonEffects() {
    const ribbons = document.querySelectorAll("[data-ribbon-effect]");
    if (!ribbons.length) {
      return;
    }

    function createRibbonScene(className) {
      const existing = document.querySelector(".ribbon-scene");
      existing?.remove();
      const scene = document.createElement("div");
      scene.className = `ribbon-scene ${className}`;
      scene.setAttribute("aria-hidden", "true");
      document.body.appendChild(scene);
      window.setTimeout(() => scene.remove(), 2400);
      return scene;
    }

    function isTheme3() {
      return document.body.classList.contains("theme3");
    }

    function playCakeScene(ribbon) {
      const rect = ribbon.getBoundingClientRect();
      const scene = createRibbonScene("cake-scene");
      scene.innerHTML = `
        <div class="cake-stage" style="--cake-x:${rect.left + rect.width / 2}px; --cake-y:${rect.top + rect.height / 2}px;">
          <div class="cake-smoke"></div>
          <div class="party-cake">
            <span class="cake-flame"></span>
            <span class="cake-candle"></span>
            <span class="cake-top"></span>
            <span class="cake-bottom"></span>
          </div>
        </div>
      `;

      if (isTheme3()) {
        ["🐘", "🦒", "🐯"].forEach((animal, index) => {
          const buddy = document.createElement("span");
          buddy.className = "mini-animal";
          buddy.textContent = animal;
          buddy.style.setProperty("--x", `${rect.left + rect.width / 2 + (index - 1) * 74}px`);
          buddy.style.setProperty("--y", `${rect.top + rect.height / 2 + 86}px`);
          buddy.style.setProperty("--delay", `${index * 0.08}s`);
          scene.appendChild(buddy);
        });
      }

      const colors = ["#ff7da8", "#ffd166", "#7bd8c6", "#ff6a2a", "#fff7f0"];
      for (let index = 0; index < 38; index += 1) {
        const angle = randomBetween(-Math.PI * 0.95, -Math.PI * 0.05);
        const distance = randomBetween(80, 230);
        const piece = document.createElement("span");
        piece.className = "cake-sprinkle";
        piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        piece.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        piece.style.setProperty("--delay", `${randomBetween(0.38, 0.74)}s`);
        piece.style.setProperty("--rotate", `${randomBetween(120, 700)}deg`);
        piece.style.setProperty("--color", colors[index % colors.length]);
        scene.appendChild(piece);
      }
    }

    function playSneakerScene() {
      const scene = createRibbonScene("sneaker-scene");
      const colors = ["#4b91ff", "#ec4c9a", "#55f5cc", "#ffd21f", "#ff7a35"];
      for (let index = 0; index < 14; index += 1) {
        const rotation = randomBetween(-38, 38);
        const sneaker = document.createElement("span");
        sneaker.className = "falling-sneaker";
        sneaker.style.setProperty("--x", `${randomBetween(6, 92)}vw`);
        sneaker.style.setProperty("--delay", `${index * 0.08}s`);
        sneaker.style.setProperty("--duration", `${randomBetween(1.15, 1.85)}s`);
        sneaker.style.setProperty("--rotate", `${rotation}deg`);
        sneaker.style.setProperty("--rotate-land", `${rotation * -0.35}deg`);
        sneaker.style.setProperty("--rotate-exit", `${rotation * -0.2}deg`);
        sneaker.style.setProperty("--color", colors[index % colors.length]);
        scene.appendChild(sneaker);
      }

      if (isTheme3()) {
        for (let index = 0; index < 22; index += 1) {
          const paw = document.createElement("span");
          paw.className = "falling-paw";
          paw.style.setProperty("--x", `${randomBetween(4, 94)}vw`);
          paw.style.setProperty("--delay", `${randomBetween(0, 1.1)}s`);
          paw.style.setProperty("--size", `${randomBetween(18, 32)}px`);
          scene.appendChild(paw);
        }
      }
    }

    function playSunshineScene(ribbon) {
      const rect = ribbon.getBoundingClientRect();
      const scene = createRibbonScene("sunshine-scene");
      scene.style.setProperty("--sun-x", `${rect.left + rect.width / 2}px`);
      scene.style.setProperty("--sun-y", `${rect.top + rect.height / 2}px`);
      scene.innerHTML = `
        <div class="sun-orb"></div>
        <div class="sunbeam sunbeam-one"></div>
        <div class="sunbeam sunbeam-two"></div>
        <div class="sunbeam sunbeam-three"></div>
      `;

      if (isTheme3()) {
        for (let index = 0; index < 9; index += 1) {
          const bird = document.createElement("span");
          bird.className = "beam-bird";
          bird.style.setProperty("--x", `${randomBetween(-10, 80)}vw`);
          bird.style.setProperty("--y", `${randomBetween(12, 62)}vh`);
          bird.style.setProperty("--delay", `${index * 0.08}s`);
          scene.appendChild(bird);
        }
      }
    }

    function playRibbonEffect(ribbon) {
      const effect = ribbon.getAttribute("data-ribbon-effect");

      ribbon.classList.remove("is-playing");
      void ribbon.offsetWidth;
      ribbon.classList.add("is-playing");

      if (effect === "cake") {
        playCakeScene(ribbon);
      } else if (effect === "sneakers") {
        playSneakerScene();
      } else {
        playSunshineScene(ribbon);
      }
    }

    ribbons.forEach((ribbon) => {
      ribbon.addEventListener("click", () => playRibbonEffect(ribbon));
    });
  }

  function createEffectNode(className, styles) {
    const node = document.createElement("span");
    node.className = className;
    Object.entries(styles).forEach(([key, value]) => {
      node.style.setProperty(key, value);
    });
    return node;
  }

  function clearEffectLayer(layer) {
    layer.querySelectorAll(".effect-piece").forEach((node) => node.remove());
  }

  function getEffectPalette() {
    const styles = window.getComputedStyle(document.body);
    return [
      styles.getPropertyValue("--theme-primary").trim() || "#f2403a",
      styles.getPropertyValue("--theme-secondary").trim() || "#ff6a2a",
      styles.getPropertyValue("--theme-accent").trim() || "#ffb31a",
      styles.getPropertyValue("--theme-aqua").trim() || "#99ead7",
      styles.getPropertyValue("--theme-blue").trim() || "#77a7ff",
      styles.getPropertyValue("--theme-pink").trim() || "#ff9bc7"
    ];
  }

  function cleanupEffectLayer(layer) {
    window.setTimeout(() => clearEffectLayer(layer), 6200);
  }

  function burstBalloons(layer) {
    clearEffectLayer(layer);
    const colors = getEffectPalette();

    for (let index = 0; index < 18; index += 1) {
      const x = randomBetween(4, 92);
      const popY = randomBetween(18, 56);
      const sway = randomBetween(-38, 38);
      const balloon = createEffectNode("effect-piece balloon", {
        "--x": `${x}vw`,
        "--delay": `${index * 0.08}s`,
        "--duration": `${randomBetween(3.6, 5.4)}s`,
        "--color": colors[index % colors.length],
        "--size": `${randomBetween(50, 96)}px`,
        "--sway": `${sway}px`,
        "--sway-pop": `${sway * -0.4}px`
      });
      layer.appendChild(balloon);

      for (let sparkIndex = 0; sparkIndex < 5; sparkIndex += 1) {
        const spark = createEffectNode("effect-piece balloon-spark", {
          "--x": `${x}vw`,
          "--y": `${popY}vh`,
          "--dx": `${randomBetween(-120, 120)}px`,
          "--dy": `${randomBetween(-90, 90)}px`,
          "--delay": `${index * 0.08 + randomBetween(1.95, 2.65)}s`,
          "--color": colors[(index + sparkIndex) % colors.length]
        });
        layer.appendChild(spark);
      }
    }

    cleanupEffectLayer(layer);
  }

  function blastConfetti(layer) {
    clearEffectLayer(layer);
    const colors = getEffectPalette();

    for (let index = 0; index < 150; index += 1) {
      const confetti = createEffectNode("effect-piece confetti-bit", {
        "--x": `${randomBetween(44, 56)}vw`,
        "--y": `${randomBetween(38, 52)}vh`,
        "--dx": `${randomBetween(-54, 54)}vw`,
        "--dy": `${randomBetween(-48, 42)}vh`,
        "--rotate": `${randomBetween(240, 960)}deg`,
        "--delay": `${randomBetween(0, 0.28)}s`,
        "--color": colors[index % colors.length],
        "--width": `${randomBetween(7, 14)}px`,
        "--height": `${randomBetween(10, 20)}px`
      });
      layer.appendChild(confetti);
    }

    for (let index = 0; index < 18; index += 1) {
      const streamer = createEffectNode("effect-piece streamer", {
        "--x": `${randomBetween(10, 88)}vw`,
        "--delay": `${randomBetween(0.1, 0.7)}s`,
        "--color": colors[index % colors.length],
        "--fall": `${randomBetween(58, 94)}vh`
      });
      layer.appendChild(streamer);
    }

    cleanupEffectLayer(layer);
  }

  function popBubbles(layer) {
    clearEffectLayer(layer);

    for (let index = 0; index < 40; index += 1) {
      const float = randomBetween(-42, 42);
      const bubble = createEffectNode("effect-piece bubble", {
        "--x": `${randomBetween(5, 90)}vw`,
        "--y": `${randomBetween(18, 78)}vh`,
        "--delay": `${index * 0.045}s`,
        "--size": `${randomBetween(24, 94)}px`,
        "--float": `${float}px`,
        "--float-mid": `${float * -0.35}px`,
        "--float-end": `${float * -0.6}px`
      });
      layer.appendChild(bubble);
    }

    cleanupEffectLayer(layer);
  }

  function wireScrollEffects() {
    const layer = document.getElementById("scroll-effects");
    const sections = Array.from(document.querySelectorAll("[data-effect]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!layer || !sections.length || reduceMotion) {
      return;
    }

    const effects = {
      balloons: burstBalloons,
      confetti: blastConfetti,
      bubbles: popBubbles
    };

    const firedAt = new WeakMap();

    function triggerEffect(section) {
      const now = Date.now();
      const lastFired = firedAt.get(section) || 0;
      if (now - lastFired < 2200) {
        return;
      }

      const effectName = section.getAttribute("data-effect");
      const effect = effects[effectName];
      if (effect) {
        firedAt.set(section, now);
        effect(layer);
      }
    }

    function checkVisibleSections() {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const activationLine = viewportHeight * 0.64;
        if (rect.top < activationLine && rect.bottom > viewportHeight * 0.2) {
          triggerEffect(section);
        }
      });
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerEffect(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -18% 0px", threshold: 0.01 }
      );

      sections.forEach((section) => observer.observe(section));
    }

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) {
          return;
        }
        ticking = true;
        window.requestAnimationFrame(() => {
          checkVisibleSections();
          ticking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", checkVisibleSections);
    checkVisibleSections();
  }

  loadEntries().then((entries) => {
    updateStats(entries);
    renderTable(entries);
  });

  wireForm();
  renderGalleryPhotos();
  wireScrollReveals();
  wireMomentCarousel();
  wireHeroRibbonEffects();
  wireScrollEffects();
})();
