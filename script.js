/* ==========================================================
   Shreety’s Waiting Room - Main JavaScript
   ========================================================== */

/* ===== EDIT THESE ===== */
const PASSWORD = "fish";
const BIRTHDAY = new Date(2026, 9, 23, 0, 0, 0); // 23 Oct 2026, 12:00 am (visitor’s local time)
const YT_PLAYLIST = "PLRFTrQY8fGBU"; // Paste your YouTube playlist ID here (the part after list=)
const SONGS = [
  "Maand",
  "Dooron Dooron",
  "Jhol",
  "Baarishein",
  "Alfaaz",
  "Barsaat",
  "Paro",
  "Kaise Hua",
  "Tera Ban Jaunga",
  "Bekhayali",
  "Pehla Pyaar",
  "Tujhe Kitna Chahne Lage"
];
/* ====================== */

// Helpers & Storage
const $ = (s) => document.querySelector(s);
const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) { }
  }
};
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

// Global State
let tab = "door";
let ytOn = false;
let opened = false;

/* ==========================================================
   Background Music (Web Audio API Synthesizer)
   ========================================================== */
const _ = null;
const AU = { ctx: null, out: null, tune: null, step: 0, next: 0, muted: false };
const MIDI = (n) => 440 * Math.pow(2, (n - 69) / 12);
const TUNES = {
  sweet: {
    bpm: 100,
    lines: [
      {
        t: "sine",
        v: 0.09,
        d: 2.2,
        n: [
          60, 64, 67, 72, 67, 64, 67, 64,
          57, 60, 64, 69, 64, 60, 64, 60,
          53, 57, 60, 65, 60, 57, 60, 57,
          55, 59, 62, 67, 62, 59, 62, 59
        ]
      },
      {
        t: "triangle",
        v: 0.08,
        d: 1.6,
        n: [
          79, _, 76, _, 79, _, 84, _,
          81, _, 79, _, 76, _, _, _,
          76, _, 79, _, 81, _, 79, _,
          79, _, 74, _, 76, _, _, _
        ]
      }
    ]
  },
  game: {
    bpm: 150,
    lines: [
      {
        t: "square",
        v: 0.035,
        d: 0.9,
        n: [
          72, 76, 79, 76, 72, 76, 79, 84,
          71, 74, 79, 74, 71, 74, 79, 83,
          69, 72, 76, 72, 69, 72, 76, 81,
          65, 69, 72, 69, 65, 69, 72, 77
        ]
      },
      {
        t: "triangle",
        v: 0.1,
        d: 1.6,
        n: [
          48, _, 48, _, 48, _, 48, _,
          43, _, 43, _, 43, _, 43, _,
          45, _, 45, _, 45, _, 45, _,
          41, _, 41, _, 41, _, 41, _
        ]
      }
    ]
  }
};

function tone(f, t, dur, type, vol) {
  const o = AU.ctx.createOscillator();
  const g = AU.ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(AU.out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function sched() {
  if (!AU.tune) return;
  const T = TUNES[AU.tune];
  const sd = 60 / T.bpm / 2;
  if (AU.next < AU.ctx.currentTime) AU.next = AU.ctx.currentTime + 0.05;
  while (AU.next < AU.ctx.currentTime + 0.3) {
    const s = AU.step % 32;
    T.lines.forEach((l) => {
      if (l.n[s]) tone(MIDI(l.n[s]), AU.next, l.d * sd, l.t, l.v);
    });
    AU.next += sd;
    AU.step++;
  }
}

function bg() {
  if (!AU.ctx) return;
  if (AU.ctx.resume) AU.ctx.resume();
  const want = AU.muted || ytOn ? null : tab === "game" ? "game" : "sweet";
  if (want !== AU.tune) {
    AU.tune = want;
    AU.step = 0;
    AU.next = AU.ctx.currentTime + 0.15;
  }
}

function startAudio() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    AU.ctx = new C();
    AU.out = AU.ctx.createGain();
    AU.out.gain.value = 0.9;
    AU.out.connect(AU.ctx.destination);
    setInterval(sched, 80);
    bg();
  } catch (e) { }
}

$("#mute").addEventListener("click", (e) => {
  AU.muted = !AU.muted;
  e.currentTarget.textContent = AU.muted ? "🔇" : "🔊";
  e.currentTarget.setAttribute("aria-label", AU.muted ? "Unmute music" : "Mute music");
  bg();
});

document.addEventListener("visibilitychange", () => {
  if (AU.ctx) {
    document.hidden ? AU.ctx.suspend() : AU.ctx.resume();
  }
});

/* ==========================================================
   Gate & Password Protection
   ========================================================== */
$("#gf").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("#pw").value.trim().toLowerCase() === PASSWORD) {
    $("#gate").hidden = true;
    $("#app").hidden = false;
    startAudio();
  } else {
    $("#err").textContent = "Hmm, that’s not it. Hint: it swims.";
    const g = $("#gf");
    g.classList.remove("shake");
    void g.offsetWidth;
    g.classList.add("shake");
  }
});

/* ==========================================================
   Navigation Tabs
   ========================================================== */
document.querySelectorAll("#nav button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("#nav button").forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "true");
    document.querySelectorAll("section.wrap").forEach((s) => (s.hidden = s.id !== "t-" + b.dataset.t));
    tab = b.dataset.t;
    if (tab !== "game") stopGame();
    bg();
  })
);

/* ==========================================================
   Confetti Particles
   ========================================================== */
const cv = $("#fx");
const cx = cv.getContext("2d");
let parts = [];
let raf = 0;

function fit() {
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
}
fit();
window.addEventListener("resize", fit);

function burst(n) {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const cols = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#8A9A3B", "#4A2A6B"];
  for (let i = 0; i < n; i++) {
    parts.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12,
      c: cols[i % 5],
      l: 140,
      r: 3 + Math.random() * 4
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter((p) => p.l > 0);
  parts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35;
    p.l--;
    cx.fillStyle = p.c;
    cx.fillRect(p.x, p.y, p.r * 2, p.r);
  });
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

/* ==========================================================
   Countdown & Door Reveal
   (Add #open to the URL to preview the reveal immediately)
   ========================================================== */
const target = location.hash === "#open" ? new Date(Date.now() - 1) : BIRTHDAY;
const UNITS = ["days", "hrs", "min", "sec"];

$("#cd").innerHTML = UNITS.map(
  (u) => `<div data-u="${u}"><b>00</b><span>${u}</span></div>`
).join("");

function setUnit(u, n) {
  const b = $(`#cd [data-u="${u}"] b`);
  const v = String(n).padStart(2, "0");
  if (b.textContent !== v) {
    b.textContent = v;
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
  }
}

const DECO = ["🎈", "🎀", "🎉", "✨", "💖", "🎊", "🌸", "🍰", "🎁"];

function spawnDeco() {
  if (tab !== "door" || document.hidden || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const e = document.createElement("span");
  const side = Math.random() < 0.5 ? -1 : 1;
  const mx = Math.max(130, Math.min(260, window.innerWidth / 2 - 30));
  e.className = "d";
  e.textContent = DECO[Math.floor(Math.random() * DECO.length)];
  e.style.setProperty("--dx", side * (100 + Math.random() * (mx - 100)) + "px");
  e.style.setProperty("--dy", -200 + Math.random() * 230 + "px");
  e.style.setProperty("--rot", Math.random() * 90 - 45 + "deg");
  e.addEventListener("animationend", () => e.remove());
  $("#deco").appendChild(e);
}
setInterval(spawnDeco, 600);

function updateCd() {
  const d = target - Date.now();
  if (d <= 0) {
    $("#cd").hidden = true;
    $("#cdmsg").textContent = "The door is open. Happy Birthday, Shreety!";
    if (!opened) {
      opened = true;
      $("#door").classList.add("open");
      setTimeout(() => burst(200), 900);
      for (let i = 0; i < 24; i++) {
        setTimeout(spawnDeco, 400 + i * 90);
      }
    }
    return;
  }
  const t = Math.floor(d / 1000);
  setUnit("days", Math.floor(t / 86400));
  setUnit("hrs", Math.floor((t % 86400) / 3600));
  setUnit("min", Math.floor((t % 3600) / 60));
  setUnit("sec", t % 60);
  $("#cd").classList.toggle("final", d <= 10000);
}
updateCd();
setInterval(updateCd, 1000);

/* ==========================================================
   Trip & Home Itinerary Planners
   ========================================================== */
function planner(root, key, ph) {
  let days = [];
  try {
    days = JSON.parse(store.get(key) || "[]");
  } catch (e) { }

  const save = () => store.set(key, JSON.stringify(days));

  root.innerHTML = `
    <div class="add">
      <input class="dn" placeholder="${ph}" aria-label="New day">
      <button class="btn sm" data-a="day">Add day</button>
    </div>
    <div class="days"></div>
    <button class="btn alt" data-a="copy">Copy itinerary</button>
  `;

  const box = root.querySelector(".days");
  const draw = () => {
    box.innerHTML =
      days
        .map(
          (d, i) => `
      <div class="day">
        <h3>${esc(d.t)}<button class="x" data-a="rmd" data-i="${i}" aria-label="Remove day">×</button></h3>
        <ul>${d.items
              .map(
                (it, j) =>
                  `<li>${esc(it)}<button class="x" data-a="rmi" data-i="${i}" data-j="${j}" aria-label="Remove item">×</button></li>`
              )
              .join("")}</ul>
        <div class="add">
          <input data-in="${i}" placeholder="Add a plan or place" aria-label="Add plan">
          <button class="btn sm" data-a="item" data-i="${i}">Add</button>
        </div>
      </div>`
        )
        .join("") || `<p class="hint">Nothing yet. Add your first day!</p>`;
  };

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    const i = +b.dataset.i;

    if (a === "day") {
      const inp = root.querySelector(".dn");
      const v = inp.value.trim();
      if (!v) return;
      days.push({ t: v, items: [] });
      inp.value = "";
    } else if (a === "item") {
      const inp = root.querySelector(`[data-in="${i}"]`);
      const v = inp.value.trim();
      if (!v) return;
      days[i].items.push(v);
    } else if (a === "rmd") {
      days.splice(i, 1);
    } else if (a === "rmi") {
      days[i].items.splice(+b.dataset.j, 1);
    } else if (a === "copy") {
      const txt =
        days.map((d) => d.t + "\n" + d.items.map((x) => " - " + x).join("\n")).join("\n\n") || "(empty)";
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
        () => (b.textContent = "Copied!"),
        () => prompt("Copy this:", txt)
      );
      return;
    }
    save();
    draw();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.target.nextElementSibling.click();
    }
  });

  draw();
}

planner($("#p-sikkim"), "plan_sikkim", "Day 1: Gangtok");
planner($("#p-home"), "plan_home", "Day 1: Cafe date");

/* ==========================================================
   Cake Catch Mini-Game
   ========================================================== */
const gc = $("#gc");
const g = gc.getContext("2d");
let G = null;
let best = +(store.get("best") || 0);
$("#bs").textContent = "🏆 High score: " + best;

const GOOD = ["🍟", "🍰", "🍉", "🍦", "🎀", "🧡"];
const BAD = ["🐛"];

function startGame() {
  G = { x: 160, s: 0, t: 30, it: [], sp: 0, last: performance.now() };
  $("#play").textContent = "Playing…";
  requestAnimationFrame(loop);
}

function stopGame() {
  G = null;
  $("#play").textContent = "Play (30 seconds)";
}

function move(cx_) {
  if (!G) return;
  const r = gc.getBoundingClientRect();
  G.x = Math.max(30, Math.min(290, ((cx_ - r.left) * 320) / r.width));
}

gc.addEventListener("pointermove", (e) => move(e.clientX));
gc.addEventListener("pointerdown", (e) => move(e.clientX));

window.addEventListener("keydown", (e) => {
  if (G && e.key === "ArrowLeft") G.x = Math.max(30, G.x - 25);
  if (G && e.key === "ArrowRight") G.x = Math.min(290, G.x + 25);
});

function loop(now) {
  if (!G) return;
  const dt = Math.min(0.05, (now - G.last) / 1000);
  G.last = now;
  G.t -= dt;
  G.sp -= dt;

  if (G.sp <= 0) {
    G.sp = 0.55;
    const bad = Math.random() < 0.2;
    G.it.push({
      x: 25 + Math.random() * 270,
      y: -20,
      v: 110 + Math.random() * 110,
      e: bad ? BAD[0] : GOOD[Math.floor(Math.random() * GOOD.length)],
      bad
    });
  }

  g.clearRect(0, 0, 320, 420);
  g.textAlign = "center";
  g.font = "30px serif";

  G.it = G.it.filter((o) => {
    o.y += o.v * dt;
    g.fillText(o.e, o.x, o.y);
    if (o.y > 355 && o.y < 400 && Math.abs(o.x - G.x) < 38) {
      G.s = Math.max(0, G.s + (o.bad ? -3 : 1));
      return false;
    }
    return o.y < 440;
  });

  g.font = "44px serif";
  g.fillText("🧺", G.x, 405);

  g.font = "bold 16px sans-serif";
  g.fillStyle = "#4A2A6B";
  g.textAlign = "left";
  g.fillText("Time: " + Math.ceil(Math.max(0, G.t)), 10, 22);

  $("#sc").textContent = "Score: " + G.s;

  if (G.t <= 0) {
    const s = G.s;
    const rec = s > best;
    if (rec) {
      best = s;
      store.set("best", s);
      burst(80);
    }
    $("#bs").textContent = "🏆 High score: " + best;
    stopGame();
    $("#play").textContent = "Play again";
    $("#sc").textContent = rec ? "New high score: " + s + "!" : "Final score: " + s;
    return;
  }

  requestAnimationFrame(loop);
}

$("#play").addEventListener("click", () => {
  if (!G) startGame();
});

/* ==========================================================
   Music Corner & YouTube API
   ========================================================== */
$("#songs").innerHTML = SONGS.map(
  (s) =>
    `<li>${esc(s)} · <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
      s
    )}" target="_blank" rel="noopener">find on YouTube</a></li>`
).join("");

let yp = null;
let playing = false;

if (!YT_PLAYLIST) {
  $("#nopl").hidden = false;
} else {
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

window.onYouTubeIframeAPIReady = () => {
  yp = new YT.Player("ytp", {
    height: "200",
    width: "200",
    playerVars: { listType: "playlist", list: YT_PLAYLIST, playsinline: 1, controls: 0 },
    events: {
      onReady: () => yp.setVolume(70),
      onStateChange: (e) => {
        playing = e.data === 1;
        ytOn = playing;
        bg();
        $("#vinyl").classList.toggle("on", playing);
        $("#pp").textContent = playing ? "⏸" : "▶";
        if (e.data === 1) {
          const d = yp.getVideoData();
          $("#np").textContent = d && d.title ? d.title : "Playing…";
        }
      }
    }
  });
};

$("#pp").addEventListener("click", () => {
  if (!yp || !yp.playVideo) return;
  playing ? yp.pauseVideo() : yp.playVideo();
});

$("#next").addEventListener("click", () => yp && yp.nextVideo && yp.nextVideo());
$("#prev").addEventListener("click", () => yp && yp.previousVideo && yp.previousVideo());
$("#vol").addEventListener("input", (e) => yp && yp.setVolume && yp.setVolume(+e.target.value));
$("#seek").addEventListener("input", (e) => {
  if (yp && yp.getDuration) yp.seekTo((yp.getDuration() * e.target.value) / 100, true);
});

setInterval(() => {
  if (yp && playing && yp.getDuration) {
    const d = yp.getDuration();
    if (d) $("#seek").value = (yp.getCurrentTime() / d) * 100;
  }
}, 500);
