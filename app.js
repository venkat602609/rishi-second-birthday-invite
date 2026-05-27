(function () {
  const config = window.RISHI_INVITE_CONFIG || {};
  const storageKey = config.storageKey || "rsvps";

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

  async function submitRemote(entry) {
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

    function setActive(index, shouldScroll) {
      activeIndex = (index + cards.length) % cards.length;
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
  wireScrollReveals();
  wireMomentCarousel();
  wireScrollEffects();
})();
