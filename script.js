/* ===== EDIT THESE ===== */
const PASSWORD = "fish";
const BIRTHDAY = new Date(2026, 9, 23, 0, 0, 0);   // 23 Oct 2026, 12:00 am (visitor’s local time)
const YT_PLAYLIST = "PLRFTrQY8fGBU";   // paste your YouTube playlist ID here (the part after list=)
const PHOTO_LINK = "https://drive.google.com/drive/folders/1es07QWsyDwTA37LYfl8iNq5EPzdbfXXs?usp=sharing";   // Google Drive folder for photo uploads
const PLAYLIST_LINK = "https://www.youtube.com/playlist?list=PLRFTrQY8fGBU&jct=2PlIBhoDxqfxvzpZUXcqTQ";   // paste the collaborative playlist invite link here (leave empty to hide the button)
const COUPON_HOURS = 2.75;   // 2 hours 45 minutes between coupons
const MEGA_AFTER = 3;     // coupons needed to unlock the MEGA coupon
const WISH_MAX = 6, WISH_GAP_H = 1.75;   // 6 wishes, 1 hour 45 minutes apart
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzqr5g21fNa6fUiE0OXnQABAZ4uwrkRMgxb5PeeZybyeZEKOdftCnj94mmIpWQO3_1AKA/exec";   // paste your Google Apps Script web app URL here (see setup steps)
/* ====================== */
const $ = s => document.querySelector(s);
const store = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Gate */
$("#gf").addEventListener("submit", e => {
  e.preventDefault();
  if ($("#pw").value.trim().toLowerCase() === PASSWORD) { $("#gate").hidden = true; $("#app").hidden = false; startAudio(); startTracking(); }
  else { $("#err").textContent = "Hmm, that’s not it. Hint: it swims."; const g = $("#gf"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake"); }
});

/* Tabs */
document.querySelectorAll("#nav button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#nav button").forEach(x => x.removeAttribute("aria-current"));
  b.setAttribute("aria-current", "true");
  document.querySelectorAll("section.wrap").forEach(s => s.hidden = s.id !== "t-" + b.dataset.t);
  tab = b.dataset.t; if (tab !== "game") stopGame(); bg(); track("tab", tab);
}));

/* Confetti */
const cv = $("#fx"), cx = cv.getContext("2d"); let parts = [], raf = 0;
function fit() { cv.width = innerWidth; cv.height = innerHeight; } fit(); addEventListener("resize", fit);
function burst(n) {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const cols = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#8A9A3B", "#4A2A6B"];
  for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -12, c: cols[i % 5], l: 140, r: 3 + Math.random() * 4 });
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(p => p.l > 0);
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.l--; cx.fillStyle = p.c; cx.fillRect(p.x, p.y, p.r * 2, p.r); });
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

/* Countdown (add #open to the link to preview the reveal) */
const PREVIEW = location.hash === "#open";
const target = PREVIEW ? new Date(Date.now() - 1) : BIRTHDAY;
let opened = false, ready = false;
const UNITS = ["days", "hrs", "min", "sec"];
$("#cd").innerHTML = UNITS.map(u => `<div data-u="${u}"><b>00</b><span>${u}</span></div>`).join("");
function setUnit(u, n) { const b = $(`#cd [data-u="${u}"] b`), v = String(n).padStart(2, "0"); if (b.textContent !== v) { b.textContent = v; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); } }
const DECO = ["🎈", "🎀", "🎉", "✨", "💖", "🎊", "🌸", "🍰", "🎁"];
function spawnDeco() {
  if (tab !== "door" || document.hidden || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const e = document.createElement("span"), side = Math.random() < .5 ? -1 : 1, mx = Math.max(130, Math.min(260, innerWidth / 2 - 30));
  e.className = "d"; e.textContent = DECO[Math.floor(Math.random() * DECO.length)];
  e.style.setProperty("--dx", side * (100 + Math.random() * (mx - 100)) + "px");
  e.style.setProperty("--dy", (-200 + Math.random() * 230) + "px");
  e.style.setProperty("--rot", (Math.random() * 90 - 45) + "deg");
  e.addEventListener("animationend", () => e.remove());
  $("#deco").appendChild(e);
}
setInterval(spawnDeco, 600);
function updateCd() {
  const d = target - Date.now();
  if (d <= 0) {
    $("#cd").hidden = true; $("#cdmsg").textContent = "The door is open. Tap it to go in! 🚪";
    if (!ready) { ready = true; const dr = $("#door"); dr.classList.add("ready"); dr.setAttribute("role", "button"); dr.tabIndex = 0; dr.setAttribute("aria-label", "Open the door"); dr.querySelector(".sign").innerHTML = "Tap to come in!<small>Happy Birthday 🎂</small>"; burst(80); }
    return;
  }
  const t = Math.floor(d / 1000);
  setUnit("days", Math.floor(t / 86400)); setUnit("hrs", Math.floor(t % 86400 / 3600)); setUnit("min", Math.floor(t % 3600 / 60)); setUnit("sec", t % 60);
  $("#cd").classList.toggle("final", d <= 10000);
}
updateCd(); setInterval(updateCd, 1000);

/* Planner */
function planner(root, key, ph) {
  let days = []; try { days = JSON.parse(store.get(key) || "[]"); } catch (e) { }
  const save = () => store.set(key, JSON.stringify(days));
  const planText = () => days.map(d => d.t + "\n" + d.items.map(x => " - " + x).join("\n")).join("\n\n") || "(empty)";
  root.innerHTML = `<div class="add"><input class="dn" placeholder="${ph}" aria-label="New day"><button class="btn sm" data-a="day">Add day</button></div><div class="days"></div><button class="btn alt" data-a="copy">Copy itinerary</button>`;
  const box = root.querySelector(".days");
  const draw = () => { box.innerHTML = days.map((d, i) => `<div class="day"><h3>${esc(d.t)}<button class="x" data-a="rmd" data-i="${i}" aria-label="Remove day">×</button></h3><ul>${d.items.map((it, j) => `<li>${esc(it)}<button class="x" data-a="rmi" data-i="${i}" data-j="${j}" aria-label="Remove item">×</button></li>`).join("")}</ul><div class="add"><input data-in="${i}" placeholder="Add a plan or place" aria-label="Add plan"><button class="btn sm" data-a="item" data-i="${i}">Add</button></div></div>`).join("") || `<p class="hint">Nothing yet. Add your first day!</p>`; };
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, i = +b.dataset.i;
    if (a === "day") { const inp = root.querySelector(".dn"), v = inp.value.trim(); if (!v) return; days.push({ t: v, items: [] }); inp.value = ""; }
    else if (a === "item") { const inp = root.querySelector(`[data-in="${i}"]`), v = inp.value.trim(); if (!v) return; days[i].items.push(v); }
    else if (a === "rmd") days.splice(i, 1);
    else if (a === "rmi") days[i].items.splice(+b.dataset.j, 1);
    else if (a === "copy") {
      const txt = days.map(d => d.t + "\n" + d.items.map(x => " - " + x).join("\n")).join("\n\n") || "(empty)";
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => b.textContent = "Copied!", () => prompt("Copy this:", txt)); return;
    }
    save(); draw();
    track("plan: " + key.replace("plan_", ""), planText());   // logs her whole itinerary to your sheet
  });
  root.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.target.nextElementSibling.click(); });
  draw();
}
planner($("#p-sikkim"), "plan_sikkim", "Day 1: Gangtok");
planner($("#p-home"), "plan_home", "Day 1: Cafe date");

/* Cake game */
const gc = $("#gc"), g = gc.getContext("2d"); let G = null, best = +(store.get("best") || 0); $("#bs").textContent = "🏆 High score: " + best;
const GOOD = ["🍟", "🍰", "🍉", "🍦", "🎀", "🧡"], BAD = ["🐛"];
function startGame() { G = { x: 160, s: 0, t: 30, it: [], sp: 0, last: performance.now() }; $("#play").textContent = "Playing…"; requestAnimationFrame(loop); }
function stopGame() { G = null; $("#play").textContent = "Play (30 seconds)"; }
function move(cx_) { if (!G) return; const r = gc.getBoundingClientRect(); G.x = Math.max(30, Math.min(290, (cx_ - r.left) * 320 / r.width)); }
gc.addEventListener("pointermove", e => move(e.clientX)); gc.addEventListener("pointerdown", e => move(e.clientX));
addEventListener("keydown", e => { if (G && e.key === "ArrowLeft") G.x = Math.max(30, G.x - 25); if (G && e.key === "ArrowRight") G.x = Math.min(290, G.x + 25); });
function loop(now) {
  if (!G) return; const dt = Math.min(.05, (now - G.last) / 1000); G.last = now; G.t -= dt; G.sp -= dt;
  if (G.sp <= 0) { G.sp = .55; const bad = Math.random() < .2; G.it.push({ x: 25 + Math.random() * 270, y: -20, v: 110 + Math.random() * 110, e: bad ? BAD[0] : GOOD[Math.floor(Math.random() * GOOD.length)], bad }); }
  g.clearRect(0, 0, 320, 420); g.textAlign = "center"; g.font = "30px serif";
  G.it = G.it.filter(o => {
    o.y += o.v * dt; g.fillText(o.e, o.x, o.y);
    if (o.y > 355 && o.y < 400 && Math.abs(o.x - G.x) < 38) { G.s = Math.max(0, G.s + (o.bad ? -3 : 1)); return false; }
    return o.y < 440;
  });
  g.font = "44px serif"; g.fillText("🧺", G.x, 405);
  g.font = "bold 16px sans-serif"; g.fillStyle = "#4A2A6B"; g.textAlign = "left"; g.fillText("Time: " + Math.ceil(Math.max(0, G.t)), 10, 22);
  $("#sc").textContent = "Score: " + G.s;
  if (G.t <= 0) { const s = G.s; const rec = s > best; if (rec) { best = s; store.set("best", s); burst(80); } $("#bs").textContent = "🏆 High score: " + best; stopGame(); $("#play").textContent = "Play again"; $("#sc").textContent = rec ? "New high score: " + s + "!" : "Final score: " + s; return; }
  requestAnimationFrame(loop);
}
$("#play").addEventListener("click", () => { if (!G) startGame(); });

/* Music corner (YouTube player runs hidden; playback starts only on tap) */
let yp = null, playing = false, ids = [], titles = {}, tried = {}, resumeT = 0;
$("#photoLink").href = PHOTO_LINK;
if (PLAYLIST_LINK) { $("#plink").href = PLAYLIST_LINK; $("#addsong").hidden = false; }
if (!YT_PLAYLIST) $("#nopl").hidden = false;
else { const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); }
function renderQueue() {
  if (!ids.length) return;
  const cur = yp.getPlaylistIndex ? yp.getPlaylistIndex() : -1;
  $("#queue").hidden = false;
  $("#q").innerHTML = ids.map((id, i) => {
    const tag = i === cur ? '<span class="tag">Now playing</span>' : (i === cur + 1 ? '<span class="tag">Next</span>' : "");
    return `<li class="${i === cur ? "now" : ""}"><button data-i="${i}"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy"><span class="t">${tag}${esc(titles[id] || "Song " + (i + 1))}</span></button></li>`;
  }).join("");
  const c = $("#q .now"); if (c) $("#queue").scrollTop = Math.max(0, c.offsetTop - 70);
}
function loadQueue() {
  if (!yp || !yp.getPlaylist) return;
  const l = yp.getPlaylist();
  if (l && l.length && l.join() !== ids.join()) {
    ids = l; try { yp.setLoop(true); } catch (e) { }
    ids.forEach(id => {
      if (!titles[id] && !tried[id]) {
        tried[id] = 1;
        fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id)).then(r => r.json()).then(j => { titles[id] = j.title; renderQueue(); }).catch(() => { });
      }
    });
  }
  renderQueue();
}
window.onYouTubeIframeAPIReady = () => {
  yp = new YT.Player("ytp", {
    height: "200", width: "200", playerVars: { listType: "playlist", list: YT_PLAYLIST, playsinline: 1, controls: 0 }, events: {
      onReady: () => { yp.setVolume(70); loadQueue(); setTimeout(loadQueue, 1500); },
      onStateChange: e => {
        playing = e.data === 1; $("#vinyl").classList.toggle("on", playing); $("#pp").textContent = playing ? "⏸" : "▶";
        clearTimeout(resumeT);
        if (playing) {
          ytOn = true; bg();
          const d = yp.getVideoData(), idx = yp.getPlaylistIndex ? yp.getPlaylistIndex() : -1;
          if (d && d.title) { $("#np").textContent = d.title; if (ids[idx]) titles[ids[idx]] = d.title; }
        } else {
          resumeT = setTimeout(() => { ytOn = false; bg(); }, 5000);   // lullaby waits 5 seconds after the music stops
        }
        loadQueue();
      }
    }
  });
};
$("#pp").addEventListener("click", () => { if (!yp || !yp.playVideo) return; playing ? yp.pauseVideo() : yp.playVideo(); });
$("#next").addEventListener("click", () => yp && yp.nextVideo && yp.nextVideo());
$("#prev").addEventListener("click", () => yp && yp.previousVideo && yp.previousVideo());
const jump = d => { if (yp && yp.getCurrentTime) yp.seekTo(Math.max(0, yp.getCurrentTime() + d), true); };
$("#back10").addEventListener("click", () => jump(-10));
$("#fwd10").addEventListener("click", () => jump(10));
$("#q").addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (b && yp && yp.playVideoAt) yp.playVideoAt(+b.dataset.i); });
$("#vol").addEventListener("input", e => yp && yp.setVolume && yp.setVolume(+e.target.value));
$("#seek").addEventListener("input", e => { if (yp && yp.getDuration) yp.seekTo(yp.getDuration() * e.target.value / 100, true); });
setInterval(() => { if (yp && playing && yp.getDuration) { const d = yp.getDuration(); if (d) $("#seek").value = yp.getCurrentTime() / d * 100; } }, 500);

/* Background music: synthesized in the browser, starts after the password tap */
let tab = "door", ytOn = false, partyOn = false; const _ = null;
const AU = { ctx: null, out: null, tune: null, step: 0, next: 0, muted: false };
const MIDI = n => 440 * Math.pow(2, (n - 69) / 12);
const TUNES = {
  party: {
    bpm: 118, lines: [
      { t: "triangle", v: .09, d: 1.6, n: [72, _, 76, 79, _, 84, 79, _, 77, _, 81, 84, _, 81, 77, _, 74, _, 79, 83, _, 79, 74, _, 72, _, 76, 79, 84, _, _, _] },
      { t: "triangle", v: .10, d: 1.4, n: [48, _, _, _, 52, _, _, _, 53, _, _, _, 57, _, _, _, 55, _, _, _, 59, _, _, _, 48, _, _, _, 52, _, 55, _] },
      { t: "sine", v: .05, d: .7, n: [84, _, _, _, _, _, 88, _, 89, _, _, _, _, _, 93, _, 86, _, _, _, _, _, 91, _, 84, _, _, _, 88, _, _, _] }
    ]
  },
  sweet: {
    bpm: 100, lines: [
      { t: "sine", v: .09, d: 2.2, n: [60, 64, 67, 72, 67, 64, 67, 64, 57, 60, 64, 69, 64, 60, 64, 60, 53, 57, 60, 65, 60, 57, 60, 57, 55, 59, 62, 67, 62, 59, 62, 59] },
      { t: "triangle", v: .08, d: 1.6, n: [79, _, 76, _, 79, _, 84, _, 81, _, 79, _, 76, _, _, _, 76, _, 79, _, 81, _, 79, _, 79, _, 74, _, 76, _, _, _] }
    ]
  },
  game: {
    bpm: 150, lines: [
      { t: "square", v: .035, d: .9, n: [72, 76, 79, 76, 72, 76, 79, 84, 71, 74, 79, 74, 71, 74, 79, 83, 69, 72, 76, 72, 69, 72, 76, 81, 65, 69, 72, 69, 65, 69, 72, 77] },
      { t: "triangle", v: .10, d: 1.6, n: [48, _, 48, _, 48, _, 48, _, 43, _, 43, _, 43, _, 43, _, 45, _, 45, _, 45, _, 45, _, 41, _, 41, _, 41, _, 41, _] }
    ]
  }
};
function tone(f, t, dur, type, vol) {
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + dur + .05);
}
function sched() {
  if (!AU.tune) return;
  const T = TUNES[AU.tune], sd = 60 / T.bpm / 2;
  if (AU.next < AU.ctx.currentTime) AU.next = AU.ctx.currentTime + .05;
  while (AU.next < AU.ctx.currentTime + .3) {
    const s = AU.step % 32;
    T.lines.forEach(l => { if (l.n[s]) tone(MIDI(l.n[s]), AU.next, l.d * sd, l.t, l.v); });
    AU.next += sd; AU.step++;
  }
}
function bg() {
  if (!AU.ctx) return;
  if (AU.ctx.resume) AU.ctx.resume();
  const want = (AU.muted || ytOn) ? null : (tab === "game" ? "game" : partyOn ? null : "sweet"); hb();
  if (want !== AU.tune) { AU.tune = want; AU.step = 0; AU.next = AU.ctx.currentTime + .15; }
}
function startAudio() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    AU.ctx = new C(); AU.out = AU.ctx.createGain(); AU.out.gain.value = .9; AU.out.connect(AU.ctx.destination);
    setInterval(sched, 80); bg();
  } catch (e) { }
}
$("#mute").addEventListener("click", e => { AU.muted = !AU.muted; e.currentTarget.textContent = AU.muted ? "🔇" : "🔊"; e.currentTarget.setAttribute("aria-label", AU.muted ? "Unmute music" : "Mute music"); bg(); });
document.addEventListener("visibilitychange", () => { if (AU.ctx) { document.hidden ? AU.ctx.suspend() : AU.ctx.resume(); } });

/* Game Zone sub-tabs */
document.querySelectorAll("#gsub button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#gsub button").forEach(x => x.removeAttribute("aria-current")); b.setAttribute("aria-current", "true");
  document.querySelectorAll(".gp").forEach(pn => pn.hidden = pn.id !== "g-" + b.dataset.g);
  if (b.dataset.g !== "cake") stopGame();
}));

/* Memory match */
const POOL = ["🍉", "🐱", "🍦", "🍟", "🎀", "🌸", "💄", "💅", "🪞", "👛", "🧸", "🍓", "🦋", "🧁", "🎧", "🌷"];
let mm = null, mn = +(store.get("mn") || 6);
const showBest = () => { const b = +(store.get("mbest" + mn) || 0); $("#mbest").textContent = b ? "Best: " + b + " moves" : ""; };
function newMatch() {
  const f = [...POOL].sort(() => Math.random() - .5).slice(0, mn), a = [...f, ...f].sort(() => Math.random() - .5);
  const cols = mn <= 8 ? 4 : mn === 10 ? 5 : 6, g = $("#mgrid");
  g.style.setProperty("--c", cols); g.style.setProperty("--r", Math.ceil(a.length / cols));
  mm = { a, open: [], done: 0, moves: 0, lock: false };
  g.innerHTML = a.map((x, i) => `<button class="mc" data-i="${i}" aria-label="Card ${i + 1}">✦</button>`).join("");
  $("#mmoves").textContent = "Moves: 0"; showBest();
  document.querySelectorAll("#mpairs button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.n === mn));
}
$("#mgrid").addEventListener("click", e => {
  const b = e.target.closest(".mc"); if (!b || !mm || mm.lock || b.classList.contains("up") || b.classList.contains("done")) return;
  b.classList.add("up"); b.textContent = mm.a[+b.dataset.i]; mm.open.push(b);
  if (mm.open.length < 2) return;
  mm.moves++; $("#mmoves").textContent = "Moves: " + mm.moves; const [x, y] = mm.open;
  if (x.textContent === y.textContent) {
    [x, y].forEach(c => { c.classList.remove("up"); c.classList.add("done"); }); mm.open = []; mm.done++;
    if (mm.done === mn) { const old = +(store.get("mbest" + mn) || 0), nb = !old || mm.moves < old; if (nb) store.set("mbest" + mn, mm.moves); showBest(); $("#mmoves").textContent = (nb ? "New best! " : "Done! ") + mm.moves + " moves"; burst(120); }
  } else { mm.lock = true; setTimeout(() => { [x, y].forEach(c => { c.classList.remove("up"); c.textContent = "✦"; }); mm.open = []; mm.lock = false; }, 800); }
});
document.querySelectorAll("#mpairs button").forEach(b => b.addEventListener("click", () => { mn = +b.dataset.n; store.set("mn", mn); newMatch(); }));
$("#mnew").addEventListener("click", newMatch); newMatch();

/* Coupons */
const PRIZES = [
  { e: "🍟", t: "Peri peri fries", s: "One serving of your favourite fries, on me." },
  { e: "💬", t: "Vent session", s: "A full session. I’ll just listen, no judging." },
  { e: "🎬", t: "Movie night", s: "You pick the movie, I bring the snacks." }];
const MEGA = { e: "👑", t: "MEGA WISH", s: "Any wish you want. I’ll grant it (if it’s feasible)!", mega: true };
let cp = { list: [], last: 0, mega: false }; try { cp = Object.assign(cp, JSON.parse(store.get("cpn") || "{}")); } catch (e) { }
const hm = h => { const m = Math.round(h * 60), a = Math.floor(m / 60), b = m % 60; return (a ? a + " h " : "") + (b ? b + " min" : ""); };
$("#chint").textContent = `A new coupon every ${hm(COUPON_HOURS)}. Collect ${MEGA_AFTER} to unlock the MEGA coupon!`;
const fmt = ms => { const t = Math.ceil(ms / 1000); return [Math.floor(t / 3600), Math.floor(t % 3600 / 60), t % 60].map(v => String(v).padStart(2, "0")).join(":"); };
const when = ts => new Date(ts).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function drawList() {
  $("#clist").innerHTML = cp.list.slice().reverse().map(c => `<div class="cc${c.mega ? " mega" : ""}"><span>${c.e} ${esc(c.t)}<small>${when(c.ts)}</small></span><button class="btn sm" data-d="${c.id}">Download</button></div>`).join("");
}
function tickCp() {
  const n = cp.list.filter(c => !c.mega).length, left = cp.last + COUPON_HOURS * 36e5 - Date.now(), ready = left <= 0;
  $("#cstat").textContent = ready ? "A coupon is ready to open!" : "Next coupon in " + fmt(left);
  $("#copen").disabled = !ready || !!cp.pending; $("#cmega").hidden = !(n >= MEGA_AFTER && !cp.mega); $("#cmega").disabled = !!cp.pending; if (cp.pending) $("#cstat").textContent = "Scratch your coupon to reveal it!";
  $("#cprog").textContent = "🎟️".repeat(Math.min(n, MEGA_AFTER)) + "⚪".repeat(Math.max(0, MEGA_AFTER - n)) + " → 👑" + (cp.mega ? " ✅" : "");
}
function addCoupon(pz) {
  const ts = Date.now(), c = { id: "SHR-" + ts.toString(36).toUpperCase().slice(-5), e: pz.e, t: pz.t, s: pz.s, ts, mega: !!pz.mega };
  cp.list.push(c); if (pz.mega) cp.mega = true;
  store.set("cpn", JSON.stringify(cp)); drawList(); tickCp(); burst(140); track("coupon", c.e + " " + c.t);
  $("#creveal").textContent = "You got: " + c.e + " " + c.t + "!";
}
function showScratch(pz) {
  const box = $("#scratch"); box.hidden = false; $("#creveal").textContent = "";
  box.innerHTML = `<div class="sc-card${pz.mega ? " mega" : ""}"><span class="sce">${pz.e}</span><b>${esc(pz.t)}</b><small>${esc(pz.s)}</small></div><canvas id="scv" width="300" height="150" aria-label="Scratch to reveal your coupon"></canvas>`;
  const cv = $("#scv"), x = cv.getContext("2d"), gr = x.createLinearGradient(0, 0, 300, 150);
  gr.addColorStop(0, "#FF9EC4"); gr.addColorStop(.5, "#F5B94A"); gr.addColorStop(1, "#BFE3F5");
  x.fillStyle = gr; x.fillRect(0, 0, 300, 150); x.fillStyle = "#4A2A6B"; x.textAlign = "center"; x.font = "700 24px Fredoka, sans-serif"; x.fillText("Scratch here ✨", 150, 84);
  let down = false, done = false;
  const sc = e => { if (!down || done) return; const r = cv.getBoundingClientRect(); x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc((e.clientX - r.left) * 300 / r.width, (e.clientY - r.top) * 150 / r.height, 17, 0, 7); x.fill(); };
  const check = () => {
    if (done) return; const d = x.getImageData(0, 0, 300, 150).data; let c = 0; for (let i = 3; i < d.length; i += 16) if (d[i] === 0) c++;
    if (c / (d.length / 16) > .5) { done = true; cv.style.transition = "opacity .5s"; cv.style.opacity = 0; setTimeout(() => cv.remove(), 500); const q = cp.pending; cp.pending = null; if (q) addCoupon(q); }
  };
  cv.addEventListener("pointerdown", e => { down = true; cv.setPointerCapture(e.pointerId); sc(e); });
  cv.addEventListener("pointermove", sc);
  cv.addEventListener("pointerup", () => { down = false; check(); });
  cv.addEventListener("pointercancel", () => { down = false; });
}
function getCoupon(pz, normal) {
  cp.pending = pz; if (normal) cp.last = Date.now(); store.set("cpn", JSON.stringify(cp)); showScratch(pz); tickCp();
}
$("#copen").addEventListener("click", () => {
  const prev = cp.list.filter(c => !c.mega).slice(-1)[0], pool = PRIZES.filter(z => !prev || z.t !== prev.t);
  getCoupon(pool[Math.floor(Math.random() * pool.length)], true);
});
$("#cmega").addEventListener("click", () => getCoupon(MEGA, false));
function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function download(c) {
  const w = 900, h = 420, k = document.createElement("canvas"); k.width = w; k.height = h; const x = k.getContext("2d");
  x.fillStyle = "#BFE3F5"; x.fillRect(0, 0, w, h);
  x.fillStyle = c.mega ? "#F5B94A" : "#FFFFFF"; rr(x, 20, 20, w - 40, h - 40, 28); x.fill(); x.lineWidth = 6; x.strokeStyle = "#4A2A6B"; x.stroke();
  x.setLineDash([10, 10]); x.beginPath(); x.moveTo(w - 230, 34); x.lineTo(w - 230, h - 34); x.stroke(); x.setLineDash([]);
  x.fillStyle = "#4A2A6B"; x.textAlign = "left";
  x.font = "700 26px Fredoka, sans-serif"; x.fillText("SHREETY’S BIRTHDAY COUPON", 60, 85);
  x.font = "700 56px Fredoka, sans-serif"; x.fillText(c.t, 60, 180);
  x.font = "500 24px Quicksand, sans-serif"; x.fillText(c.s, 60, 232);
  x.font = "700 22px Quicksand, sans-serif"; x.fillText("Code: " + c.id + "   |   Won: " + when(c.ts), 60, 320);
  x.font = "500 20px Quicksand, sans-serif"; x.fillText("Valid for one redemption. Show this to redeem it.", 60, 355);
  x.textAlign = "center"; x.font = "110px serif"; x.fillText(c.e, w - 125, 235);
  k.toBlob(blob => { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = "shreety-coupon-" + c.id + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); });
}
$("#clist").addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (!b) return; const c = cp.list.find(z => z.id === b.dataset.d); if (c) download(c); });
if (cp.pending) showScratch(cp.pending);
drawList(); tickCp(); setInterval(tickCp, 1000);


/* Tracking: visits, time on site, events -> Google Sheet */
const SID = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
let visitNo = 0, secs = 0;
if (location.hash === "#me") store.set("noTrack", "1");   // open the site once with #me on the end to stop counting your own visits
if (location.hash === "#track") store.set("noTrack", "");
function post(o) { if (!SHEET_URL || store.get("noTrack") || location.hostname !== "gt-ashish.github.io") return; try { fetch(SHEET_URL, { method: "POST", mode: "no-cors", keepalive: true, body: JSON.stringify(o) }).catch(() => { }); } catch (e) { } }
function track(type, detail) { post({ type, detail: typeof detail === "string" ? detail : JSON.stringify(detail || "") }); }
const sendSess = () => post({ type: "session", sid: SID, visit: visitNo, sec: secs });
function startTracking() {
  visitNo = (+store.get("visits") || 0) + 1; store.set("visits", visitNo); track("visit", "Visit #" + visitNo);
  setInterval(() => { if (!document.hidden) secs++; }, 1000);   // counts only while the page is visible
  setInterval(sendSess, 30000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) sendSess(); });
  addEventListener("pagehide", sendSess); sendSess();
}

/* Make a wish */
let ws = { list: [], last: 0 }; try { ws = Object.assign(ws, JSON.parse(store.get("wishes") || "{}")); } catch (e) { }
let lit = false, curWish = "";
function wtick() {
  const n = ws.list.length, left = ws.last + WISH_GAP_H * 36e5 - Date.now(), btn = $("#wbtn"), inp = $("#wtext"), st = $("#wstat");
  $("#wdots").textContent = "🕯️".repeat(n) + "⚪".repeat(Math.max(0, WISH_MAX - n));
  $("#candle").classList.toggle("lit", lit);
  if (lit) { st.textContent = "The candle is lit. Tap the flame or the button to blow it out!"; btn.textContent = "Blow it out 🌬️"; btn.disabled = false; inp.disabled = true; }
  else if (n >= WISH_MAX) { st.textContent = "All " + WISH_MAX + " wishes made. Fingers crossed! 💖"; btn.disabled = true; inp.disabled = true; }
  else if (n > 0 && left > 0) { st.textContent = "Next wish in " + fmt(left); btn.textContent = "Light the candle"; btn.disabled = true; inp.disabled = true; }
  else { st.textContent = "Wish " + (n + 1) + " of " + WISH_MAX; btn.textContent = "Light the candle"; btn.disabled = false; inp.disabled = false; }
}
function wishAction() {
  if (!lit) {
    curWish = $("#wtext").value.trim(); if (!curWish) { $("#wstat").textContent = "Type your wish first 💭"; return; }
    lit = true; $("#wf").classList.remove("off");
  } else {
    lit = false; $("#wf").classList.add("off"); const ts = Date.now();
    ws.list.push({ w: curWish, ts }); ws.last = ts; store.set("wishes", JSON.stringify(ws));
    track("wish", "Wish " + ws.list.length + ": " + curWish); $("#wtext").value = ""; burst(150);
  }
  wtick();
}
$("#wbtn").addEventListener("click", wishAction);
$("#candle").addEventListener("click", () => { if (lit) wishAction(); });
wtick(); setInterval(wtick, 1000);

/* ==========================================================
   Inside the birthday room: lamp cord -> lights -> curtain bow -> party
   (open the site with #open on the end to preview it)
   ========================================================== */
const ins = $("#inside");
let stage = null;
const HINTS = {
  dark: "The door swung open. It’s dark in there… pull the lamp cord! 💡",
  lit: "Lights on! Now untie the big red bow 🎀 (drag it or tap it)",
  open: "Surprise! Tap the candles to blow them out (and pop those poppers 🎉) 🎂"
};
function sfx(a) { if (!AU.ctx || AU.muted) return; a.forEach((x, i) => tone(x[0], AU.ctx.currentTime + i * 0.09, x[1], "triangle", 0.12)); }
function setStage(s, quiet) {
  stage = s; ins.dataset.stage = s;
  $("#inshint").textContent = HINTS[s];
  if (s === "open") { partyOn = true; bg(); if (!quiet) { burst(200); track("room", "curtain untied"); } }
}
function enterRoom() {
  if (!ins.hidden) return;
  $("#outside").hidden = true; ins.hidden = false; if (!stage) $("#nav").hidden = true; $("#t-door").classList.add("inroom");
  const saved = stage;
  setStage(saved || "dark", true);
}
function lightsOn() { if (stage !== "dark") return; setStage("lit"); sfx([[880, .08], [1320, .12]]); track("room", "lights on"); }
function untie() { if (stage !== "lit") return; $("#bowbtn").classList.add("undone"); sfx([[523, .1], [659, .1], [784, .1], [1047, .2]]); setTimeout(() => setStage("open"), 400); }

function pull(el, move, done) {
  let sx = 0, sy = 0, on = false, mv = 0;
  el.addEventListener("pointerdown", (e) => { on = true; sx = e.clientX; sy = e.clientY; mv = 0; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", (e) => { if (!on) return; const dx = e.clientX - sx, dy = e.clientY - sy; mv = Math.max(mv, Math.hypot(dx, dy)); move(dx, dy); });
  const end = () => { if (!on) return; on = false; done(mv < 6); };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  el.addEventListener("click", (e) => { if (e.detail === 0) done(true); });   // keyboard
}
const cord = $("#cord"), bow = $("#bowbtn");
let pp = 0;
pull($("#cordb"), (dx, dy) => { pp = Math.max(0, Math.min(60, dy)); cord.style.setProperty("--p", pp + "px"); },
  (tap) => { if (tap || pp > 35) { cord.style.setProperty("--p", "50px"); setTimeout(() => { lightsOn(); cord.style.setProperty("--p", "0px"); }, 160); } else { pp = 0; cord.style.setProperty("--p", "0px"); } });
let bd = 0;
pull(bow, (dx, dy) => { bd = Math.hypot(dx, dy); bow.style.setProperty("--bx", Math.max(-60, Math.min(60, dx)) + "px"); bow.style.setProperty("--by", Math.max(-30, Math.min(60, dy)) + "px"); bow.style.setProperty("--br", dx / 6 + "deg"); },
  (tap) => { if (tap || bd > 40) untie(); else { bd = 0;["--bx", "--by", "--br"].forEach((p) => bow.style.removeProperty(p)); } });

/* Decorations (built once) */
(() => {
  const cols = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#8A9A3B", "#BFE3F5"]; let i = 0;
  $("#bunt").innerHTML = ["HAPPY 23RD", "SHREETY"].map((r) => `<div class="brow">${[...r].map((ch) => ch === " " ? '<span class="sp"></span>' : `<span style="--i:${i};background:${cols[i++ % 5]}">${ch}</span>`).join("")}</div>`).join("");
  const L = [2, 11, 19, 73, 82, 91], T = [34, 10, 40, 40, 12, 32], C = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#BFE3F5", "#FF9EC4"];
  $("#balloons").innerHTML = L.map((l, k) => `<span class="bl" style="--l:${l}%;--t:${T[k]}%;--c:${C[k]};--dl:${k * 0.25}s"></span>`).join("");
  let w = "M0 2", b = "";
  for (let k = 0; k < 8; k++) { w += `Q${6.25 + 12.5 * k} 9 ${12.5 * (k + 1)} 2`; b += `<i style="left:calc(${6.25 + 12.5 * k}% - 4px);top:6px;--c:${cols[k % 5]};--d:${k * 0.17}s"></i>`; }
  $("#fairy").innerHTML = `<svg viewBox="0 0 100 10" preserveAspectRatio="none"><path d="${w}" fill="none" stroke="#4A2A6B" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>${b}`;
})();

/* Cake candles */
let blown = 0;
document.querySelectorAll(".cdl").forEach((cd) => cd.addEventListener("click", () => {
  if (stage !== "open") return;
  const f = cd.querySelector(".fl"); if (f.classList.contains("off")) return;
  f.classList.add("off"); blown++;
  if (blown === 2) { burst(160); $("#inshint").textContent = "Happy Birthday, Shreety! 🎂 Close your eyes and make a wish ✨"; $("#relight").hidden = false; track("cake", "candles blown out"); }
}));
$("#relight").addEventListener("click", () => { document.querySelectorAll(".fl").forEach((f) => f.classList.remove("off")); blown = 0; $("#relight").hidden = true; $("#inshint").textContent = HINTS.open; });

/* Party song: hbd.mp3 (plays after the bow is untied; pauses for mute, YouTube, game tab, hidden page) */
const hbd = new Audio("hbd.mp3"); hbd.loop = true; hbd.preload = "auto";
function hb() {
  const on = partyOn && !AU.muted && !ytOn && tab !== "game" && !document.hidden;
  if (on) { if (hbd.paused) hbd.play().catch(() => { }); } else if (!hbd.paused) hbd.pause();
}
document.addEventListener("visibilitychange", hb);
document.addEventListener("pointerdown", hb, { passive: true });   // retries if the browser blocked autoplay after a refresh


/* Party decor: photo balloons, long curly ribbons, gifts, sparkles */
(() => {
  const room = document.querySelector(".roomv");
  const B = [["bnA", 14, 16, 30], ["hk2", 2, 8, 28], ["b3", 1, 38, 26], ["b7", 24, 40, 24], ["hk3", 9, 48, 22], ["b1", 25, 8, 20],
  ["kf", 75, 12, 38], ["k1", 89, 40, 26], ["b5", 67, 42, 22], ["hk4", 60, 6, 20], ["hk5", 90, 8, 22], ["b2", 82, 50, 20]];
  $("#balloons").innerHTML = B.map((b, i) => `<img class="bi" src="balloons/${b[0]}.png" alt="" style="--l:${b[1]}%;--t:${b[2]}%;--s:${b[3]};--dl:${(i * .18).toFixed(2)}s">`).join("");
  $("#balloons").addEventListener("click", (e) => { const b = e.target.closest(".bi"); if (!b || b.classList.contains("pop")) return; b.classList.add("pop"); sfx([[1500, .04], [900, .06]]); burst(25); setTimeout(() => b.remove(), 320); });
  const RC = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#D7263D", "#BFE3F5", "#FF9EC4", "#F5B94A"];
  const curl = (amp, w) => { let d = ""; for (let i = 0; i <= 90; i++) { const t = i / 90, p = t * w; d += (i ? "L" : "M") + (20 + amp * Math.sqrt(t) * Math.sin(p)).toFixed(1) + " " + (190 * t + amp * .7 * Math.cos(p) - amp * .7).toFixed(1); } return d; };
  const X = [2, 8, 14, 20, 78, 84, 90, 97], S = [55, 42, 60, 38, 40, 58, 44, 52];
  room.insertAdjacentHTML("beforeend", X.map((x, i) => `<svg class="rib" viewBox="0 0 40 200" style="left:${x}%;--s:${S[i]};--d:${(i * .13).toFixed(2)}s"><path d="${curl(11 + i % 3 * 2, 34 + i % 4 * 4)}" stroke="${RC[i]}"/></svg>`).join(""));
  const G = [["🎁", 3, "13%"], ["🎀", 9, "12%"], ["🎁", 84, "13%"], ["🎁", 91, "12%"]];
  room.insertAdjacentHTML("beforeend", G.map((g) => `<span class="gift" style="--l:${g[1]}%;--b:${g[2]}">${g[0]}</span>`).join(""));
  let sp = ""; for (let i = 0; i < 12; i++) sp += `<span class="spk" style="--l:${6 + i * 8 + (i % 3) * 2}%;--t:${8 + (i * 37) % 55}%;--d:${(i * .23).toFixed(2)}s">✨</span>`;
  room.insertAdjacentHTML("beforeend", sp);
})();


/* Party v4: HAPPY BIRTHDAY banner, poppers, cake cutting, nav returns at the end */
(() => {
  const room = document.querySelector(".roomv"), T = "HAPPY BIRTHDAY", W = [...T].map((ch) => ch === " " ? .5 : 1), tot = W.reduce((a, b) => a + b, 0);
  const cols = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#8A9A3B", "#6EC6F0"]; let cum = 0, li = 0;
  $("#bunt").innerHTML = `<div class="bn"><svg viewBox="0 0 100 110" preserveAspectRatio="none"><path d="M0 2Q50 80 100 2"/></svg><div class="bnf">${[...T].map((ch, i) => {
    const u = 2 * (cum + W[i] / 2) / tot - 1; cum += W[i]; const y = ((1 - u * u) * 38 + 2).toFixed(1);
    return ch === " " ? '<span class="fl2 sp"></span>' : `<span class="fl2" style="--i:${i};--y:${y}px;--c:${cols[li++ % 6]}">${ch}</span>`;
  }).join("")}</div></div>`;

  const cvs = $("#fx");
  function popSfx() { if (!AU.ctx || AU.muted) return; const c = AU.ctx, b = c.createBuffer(1, c.sampleRate * .15, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); const s = c.createBufferSource(), g = c.createGain(); g.gain.value = .5; s.buffer = b; s.connect(g); g.connect(AU.out); s.start(); }
  function popper(el, dir) {
    popSfx(); el.classList.remove("fired"); void el.offsetWidth; el.classList.add("fired");
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .25, pc = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#D7263D", "#BFE3F5"];
    for (let i = 0; i < 70; i++) { const a = (-90 + dir * Math.random() * 55) * Math.PI / 180, sp = 9 + Math.random() * 10; parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: pc[i % 6], l: 120 + Math.random() * 50, r: 3 + Math.random() * 4 }); }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  room.insertAdjacentHTML("beforeend", [[3, 1], [11, 1], [89, -1], [81, -1]].map((p) => `<button class="pp" style="--l:${p[0]}%;--f:${p[1]}" data-d="${p[1]}" aria-label="Pop the party popper">🎉</button>`).join(""));
  room.addEventListener("click", (e) => { const b = e.target.closest(".pp"); if (b) popper(b, +b.dataset.d); });

  /* Buttons row: cut cake, light again, continue */
  const acts = document.createElement("div"); acts.id = "acts";
  acts.innerHTML = '<button class="btn alt sm" id="cutbtn" hidden>Cut the cake 🍰</button><button class="btn sm" id="goon" hidden>Continue 💖</button>';
  ins.appendChild(acts); acts.insertBefore($("#relight"), $("#goon"));
  document.querySelectorAll(".cdl").forEach((cd) => cd.addEventListener("click", () => { if (blown >= 2 && stage === "open") $("#cutbtn").hidden = false; }));

  let cuts = 0; const MAXC = 6, SLOT = [3, 12, 21, 74, 83, 92];
  const SL = '<svg class="slc" viewBox="0 0 100 90"><ellipse cx="50" cy="80" rx="46" ry="9" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="54" width="60" height="22" rx="4" fill="#FF9EC4" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="34" width="60" height="22" rx="4" fill="#F5B94A" stroke="#4A2A6B" stroke-width="3"/><path d="M20 38q7 10 14 0t13 0t13 0t14 0v-8H20z" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><circle cx="50" cy="24" r="7" fill="#D7263D" stroke="#4A2A6B" stroke-width="3"/></svg>';
  function cutCake() {
    if (cuts >= MAXC) return;
    const cake = document.querySelector(".cakev"), cr = cake.getBoundingClientRect(), rr = room.getBoundingClientRect();
    const k = document.createElement("span"); k.className = "knife"; k.textContent = "🔪"; k.style.left = cr.left - rr.left + cr.width / 2 + "px"; k.style.top = cr.top - rr.top + "px"; room.appendChild(k);
    k.animate([{ transform: "translate(-50%,-90%) rotate(-15deg)", opacity: 0 }, { opacity: 1, offset: .25 }, { transform: "translate(-50%,70%) rotate(-15deg)", opacity: 1 }], { duration: 650, easing: "ease-in" }).onfinish = () => k.remove();
    setTimeout(() => {
      const x = 172 - cuts * 22, ln = document.createElementNS("http://www.w3.org/2000/svg", "path");
      ln.setAttribute("d", `M${x} 112V174` + (x < 154 && x > 46 ? `M${x} 64V112` : "")); ln.setAttribute("stroke", "#4A2A6B"); ln.setAttribute("stroke-width", "4"); ln.setAttribute("fill", "none"); cake.appendChild(ln);
      room.insertAdjacentHTML("beforeend", SL.replace('class="slc"', `class="slc" style="--l:${SLOT[cuts]}%"`)); const el = room.lastElementChild;
      const er = el.getBoundingClientRect(), ex = er.left + er.width / 2, ey = er.top + er.height / 2, dx = cr.left + cr.width / 2 - ex, dy = cr.top + cr.height * .6 - ey, mx = rr.left + rr.width / 2 - ex, my = rr.top + rr.height * .5 - ey;
      el.animate([{ transform: `translate(${dx}px,${dy}px) scale(.2) rotate(-20deg)`, opacity: 0 }, { transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .5 }, { transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .65 }, { transform: "none", opacity: 1 }], { duration: 1700, easing: "ease-in-out" });
      sfx([[660, .08], [880, .1]]); setTimeout(() => burst(40), 800);
    }, 450);
    cuts++; $("#goon").hidden = false;
    $("#inshint").textContent = cuts >= MAXC ? "The whole cake is gone! 😋" : "Yum! Cut as many slices as you like 🍰";
    if (cuts >= MAXC) $("#cutbtn").hidden = true;
  }
  $("#cutbtn").addEventListener("click", cutCake);
  $("#goon").addEventListener("click", () => { $("#nav").hidden = false; if (!PREVIEW) store.set("navok", "1"); $("#goon").hidden = true; $("#inshint").textContent = "The party’s all yours, Shreety! Explore the tabs up top 💖"; burst(120); track("room", "party finished"); });
})();


/* Party v5 */
(() => {
  const room = document.querySelector(".roomv"), NS = "http://www.w3.org/2000/svg";

  /* 1. Better party poppers, raised */
  const PS = '<svg viewBox="0 0 64 64" aria-hidden="true">'
    + '<path d="M31 30Q40 20 33 12Q27 6 35 2" fill="none" stroke="#3FB7A5" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M36 34Q50 30 52 20Q53 14 60 14" fill="none" stroke="#F5B94A" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M5 59 20 22 42 44Z" fill="#FF9EC4" stroke="#4A2A6B" stroke-width="3" stroke-linejoin="round"/>'
    + '<path d="M10.3 46 18 53.8M14.8 35 29 49.3" stroke="#F5B94A" stroke-width="4" stroke-linecap="round"/>'
    + '<ellipse cx="31" cy="33" rx="15.5" ry="5" transform="rotate(45 31 33)" fill="#fff" stroke="#4A2A6B" stroke-width="3"/>'
    + '<circle cx="44" cy="12" r="2.6" fill="#c9a0ff"/><circle cx="52" cy="30" r="2.4" fill="#FF9EC4"/><circle cx="24" cy="8" r="2.4" fill="#F5B94A"/><circle cx="58" cy="24" r="2" fill="#3FB7A5"/></svg>';
  const PL = [2.5, 8, 93, 87.5];
  room.querySelectorAll(".pp").forEach((b, i) => { b.innerHTML = PS; b.style.setProperty("--l", PL[i] + "%"); if (i % 2) b.classList.add("in"); });

  /* 2. Spread ribbons so they stop touching the banner */
  const XR = [2, 7, 12, 16, 82, 86, 91, 96];
  room.querySelectorAll(".rib").forEach((r, i) => { if (XR[i] != null) r.style.left = XR[i] + "%"; });

  /* 3. Gifts: tap -> middle finger pops out */
  const GL = [1.5, 7.5, 88, 93];
  room.querySelectorAll(".gift").forEach((g, i) => { g.style.setProperty("--l", GL[i] + "%"); g.setAttribute("role", "button"); g.tabIndex = 0; g.setAttribute("aria-label", "Open the gift"); });
  function giftPop(g) {
    const r = g.getBoundingClientRect(), rr = room.getBoundingClientRect();
    const f = document.createElement("span"); f.className = "fng"; f.textContent = "🖕";
    f.style.left = r.left - rr.left + r.width / 2 + "px"; f.style.top = r.top - rr.top + "px"; room.appendChild(f);
    f.animate([{ transform: "translate(-50%,-30%) scale(.2) rotate(-20deg)", opacity: 0 },
    { transform: "translate(-50%,-160%) scale(1.5) rotate(8deg)", opacity: 1, offset: .35 },
    { transform: "translate(-50%,-200%) scale(1.5) rotate(-6deg)", opacity: 1, offset: .75 },
    { transform: "translate(-50%,-260%) scale(1.2)", opacity: 0 }], { duration: 1500, easing: "ease-out" }).onfinish = () => f.remove();
    g.animate([{ transform: "rotate(0)" }, { transform: "rotate(-14deg) scale(1.2)" }, { transform: "rotate(10deg) scale(1.1)" }, { transform: "none" }], { duration: 350 });
    sfx([[330, .07], [220, .12]]); track("gift", "tapped");
  }
  room.addEventListener("click", (e) => { const g = e.target.closest(".gift"); if (g) giftPop(g); });
  room.addEventListener("keydown", (e) => { const g = e.target.closest && e.target.closest(".gift"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); giftPop(g); } });

  /* 4. Cake that really disappears where it is cut */
  const cake = room.querySelector(".cakev");
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const mask = mk("mask", { id: "cakemask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 200, height: 190 });
  mask.appendChild(mk("rect", { x: 0, y: 0, width: 200, height: 190, fill: "#fff" }));
  const defs = mk("defs", {}); defs.appendChild(mask); cake.insertBefore(defs, cake.firstChild);
  const grp = mk("g", { mask: "url(#cakemask)" });
  [...cake.children].filter((n) => /^(rect|path)$/i.test(n.tagName)).forEach((n) => grp.appendChild(n));
  cake.insertBefore(grp, cake.querySelector(".cdl"));
  const cdls = cake.querySelectorAll(".cdl");

  /* swap in a fresh button so the old cutting code no longer runs */
  const oldBtn = $("#cutbtn"), nb = oldBtn.cloneNode(true); oldBtn.replaceWith(nb);
  let cuts = 0, L = 18, R = 182; const MAXC = 6, STEP = 164 / MAXC, SLOT = [18, 29, 40, 51, 62, 73];
  const SL = '<svg class="slc" viewBox="0 0 100 90"><ellipse cx="50" cy="80" rx="46" ry="9" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="54" width="60" height="22" rx="4" fill="#FF9EC4" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="34" width="60" height="22" rx="4" fill="#F5B94A" stroke="#4A2A6B" stroke-width="3"/><path d="M20 38q7 10 14 0t13 0t13 0t14 0v-8H20z" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><circle cx="50" cy="24" r="7" fill="#D7263D" stroke="#4A2A6B" stroke-width="3"/></svg>';
  function cutCake() {
    if (cuts >= MAXC) return;
    const cr = cake.getBoundingClientRect(), rr = room.getBoundingClientRect(), fromRight = cuts % 2 === 0;
    const sx = cr.left + cr.width * ((fromRight ? R - STEP / 2 : L + STEP / 2) / 200);
    const k = document.createElement("span"); k.className = "knife"; k.textContent = "🔪";
    k.style.left = sx - rr.left + "px"; k.style.top = cr.top - rr.top + cr.height * .3 + "px"; room.appendChild(k);
    k.animate([{ transform: "translate(-50%,-90%) rotate(-15deg)", opacity: 0 }, { opacity: 1, offset: .25 }, { transform: "translate(-50%,70%) rotate(-15deg)", opacity: 1 }], { duration: 650, easing: "ease-in" }).onfinish = () => k.remove();
    const myCut = cuts; cuts++;
    setTimeout(() => {
      /* remove that part of the cake */
      if (fromRight) { const x1 = R - STEP; mask.appendChild(mk("rect", { x: x1, y: 0, width: 260, height: 190, fill: "#000" })); R = x1; }
      else { const x2 = L + STEP; mask.appendChild(mk("rect", { x: -60, y: 0, width: x2 + 60, height: 190, fill: "#000" })); L = x2; }
      if (L > 68) cdls[0].style.display = "none";
      if (R < 130) cdls[1].style.display = "none";
      /* the slice flies to the middle, then onto the table */
      room.insertAdjacentHTML("beforeend", SL.replace('class="slc"', `class="slc" style="--l:${SLOT[myCut]}%"`)); const el = room.lastElementChild;
      const er = el.getBoundingClientRect(), ex = er.left + er.width / 2, ey = er.top + er.height / 2, dx = sx - ex, dy = cr.top + cr.height * .6 - ey, mx = rr.left + rr.width / 2 - ex, my = rr.top + rr.height * .45 - ey;
      el.animate([{ transform: `translate(${dx}px,${dy}px) scale(.2) rotate(-20deg)`, opacity: 0 }, { transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .5 }, { transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .65 }, { transform: "none", opacity: 1 }], { duration: 1700, easing: "ease-in-out" });
      sfx([[660, .08], [880, .1]]); setTimeout(() => burst(40), 800);
    }, 450);
    $("#goon").hidden = false;
    $("#inshint").textContent = cuts >= MAXC ? "The whole cake is gone! 😋" : "Yum! Cut as many slices as you like 🍰";
    if (cuts >= MAXC) nb.hidden = true;
  }
  nb.addEventListener("click", cutCake);
})();


/* Letter v6: envelope -> opens -> letter types out word by word */
(() => {
  const SIGN = "";
  const MSG = `Do you know..?

today is just special

so special to you

that's why

Let's make it...

the best celebration ever

and let me share...

a piece of happiness to you

I made all this...

as a birthday present to you

thanks for being there

thanks for the friendship we made

thanks for everything

I wish you all the best

May your life be at ease

May all your wishes come true

Remember

your ambitions

you live as a free bird...

flying in the blue sky

Now things are different

real story of your life

is just about to begin

indeed...

this life is not easy as we thought

but...

Don't worry

don't be afraid

because...

you are not alone in this world

because...

this year will be better

and I hope

you'll find...

happiness along the way

keep your spirits up

enjoy every single moment...

that you experience today

fill it with your most beautiful smile

and make it the best memory...

lastly...

I'd like to wish you one more time

~a very happy birthday 🎂❤️`;

  document.body.insertAdjacentHTML("beforeend",
    '<div id="lt" role="dialog" aria-modal="true" aria-label="A letter for Shreety">'
    + '<div class="lt-photos" id="lt-photos" aria-hidden="true"></div>'
    + '<div class="ltst" id="ltst">'
    + '<div class="eb"></div>'
    + '<div class="ep"><button class="ltx" id="ltx" aria-label="Close letter">×</button><div class="pc" id="ltc"></div><div class="pf"><button class="btn sm alt" id="ltb" style="display:none">Close 💖</button></div></div>'
    + '<svg class="ef" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="2,2 150,105 2,198" fill="#ff9ec4"/><polygon points="298,2 150,105 298,198" fill="#ff9ec4"/><polygon points="2,198 150,100 298,198" fill="#ffc2dc"/></svg>'
    + '<svg class="fp" viewBox="0 0 300 105" preserveAspectRatio="none" aria-hidden="true"><polygon points="2,2 298,2 150,103" fill="#ff86b6"/></svg>'
    + '<span class="seal" aria-hidden="true">💖</span></div></div>');
  const lt = $("#lt"), st = $("#ltst"), ltc = $("#ltc"), ltb = $("#ltb"), photoBox = $("#lt-photos");
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* Floating memory photos engine */
  const photoPool = [];
  for (let i = 1; i <= 114; i++) {
    photoPool.push(`photos/p${i}.jpeg`);
  }
  // Shuffle so every view is fresh and delightful
  for (let i = photoPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photoPool[i], photoPool[j]] = [photoPool[j], photoPool[i]];
  }
  let photoTimer = 0, photoIdx = 0;

  // Preload first 12 photos for instant smooth floating
  photoPool.slice(0, 12).forEach((src) => { const im = new Image(); im.src = src; });

  function spawnPhoto() {
    if (!running || !photoPool.length) return;
    const src = photoPool[photoIdx % photoPool.length];
    photoIdx++;
    const card = document.createElement("div");
    card.className = "polaroid";

    const isRight = photoIdx % 2 === 0;
    const isMobile = innerWidth < 680;
    let tx, ty;
    if (isMobile) {
      tx = isRight ? (innerWidth * 0.54 + Math.random() * 20) : (innerWidth * 0.05 + Math.random() * 20);
      ty = 30 + (photoIdx % 3) * (innerHeight * 0.28) + (Math.random() * 30 - 15);
      card.style.setProperty("--max-op", "0.55");
    } else {
      tx = isRight ? (innerWidth * 0.77 + Math.random() * (innerWidth * 0.12)) : (innerWidth * 0.04 + Math.random() * (innerWidth * 0.11));
      ty = Math.max(30, Math.min(innerHeight - 250, 50 + (photoIdx % 4) * (innerHeight * 0.21) + (Math.random() * 40 - 20)));
      card.style.setProperty("--max-op", "0.85");
    }

    card.style.setProperty("--tx", tx + "px");
    card.style.setProperty("--ty", ty + "px");
    card.style.setProperty("--r", (Math.random() * 20 - 10) + "deg");
    card.style.setProperty("--drift-x", (Math.random() * 26 - 13) + "px");
    card.style.setProperty("--dr", (Math.random() * 6 - 3) + "deg");

    const img = document.createElement("img");
    img.src = src;
    img.alt = "Memory";
    card.appendChild(img);
    photoBox.appendChild(card);

    setTimeout(() => { card.remove(); }, 5200);
  }

  function startPhotos() {
    stopPhotos();
    spawnPhoto();
    photoTimer = setInterval(spawnPhoto, 1700);
  }

  function stopPhotos() {
    clearInterval(photoTimer);
    photoTimer = 0;
    if (photoBox) photoBox.innerHTML = "";
  }

  /* build the letter */
  const words = [];
  ltc.innerHTML = "<h3>For Shreety 💌</h3>";
  MSG.trim().split(/\n\s*\n/).forEach((para) => {
    const p = document.createElement("p"); p.style.display = "none";
    let txt = para.trim(); if (txt[0] === "~") { txt = txt.slice(1); p.className = "em"; }
    txt.split(/\s+/).forEach((w) => {
      const s = document.createElement("span"), m = w.match(/^\*(.+?)\*(.*)$/);
      s.className = "w" + (m ? " i" : ""); s.textContent = m ? m[1] + m[2] : w;
      p.appendChild(s); words.push({ s, p });
    });
    ltc.appendChild(p);
  });
  if (SIGN) { const sg = document.createElement("p"); sg.className = "sg"; sg.textContent = SIGN; ltc.appendChild(sg); }

  let seen = false, running = false, ti = 0, tm = 0, timers = [], mode = "type";
  const reveal = (w) => { w.p.style.display = ""; w.s.classList.add("on"); };
  const showAll = () => { words.forEach(reveal); ti = words.length; };
  function finish() {
    mode = "done";
    ltb.style.display = "";
    ltb.textContent = "Close 💖";
    burst(90);
  }
  function step() {
    if (ti >= words.length) { finish(); return; }
    const w = words[ti++]; reveal(w); ltc.scrollTop = ltc.scrollHeight;
    const t = w.s.textContent.trim(), lastInP = ti >= words.length || words[ti].p !== w.p;
    const isPunct = /[.!?…]$/.test(t) || /\.\.\.$/.test(t);
    const isComma = /[,;:]$/.test(t);
    tm = setTimeout(step, 210 + (isPunct ? 650 : isComma ? 300 : 0) + (lastInP ? 950 : 0));
  }
  function openLetter(instant) {
    if (running) return; running = true; seen = true;
    timers.forEach(clearTimeout); clearTimeout(tm); timers = [];
    st.className = "ltst"; lt.classList.add("on");
    if (instant || reduce) {
      showAll(); finish(); st.classList.add("read", "opened", "rise"); ltc.scrollTop = 0; startPhotos(); return;
    }
    words.forEach((w) => w.s.classList.remove("on")); words.forEach((w) => { w.p.style.display = "none"; });
    ti = 0; mode = "type"; ltb.style.display = "none"; ltc.scrollTop = 0;
    void st.offsetWidth; st.classList.add("pop"); sfx([[660, .08], [880, .1], [1175, .15]]);
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(1000, () => { st.classList.add("opened"); sfx([[500, .08], [700, .1]]); });
    at(1900, () => st.classList.add("rise"));
    at(3100, () => { st.classList.add("read"); startPhotos(); });
    at(4200, step);
  }
  function closeLetter() {
    timers.forEach(clearTimeout); clearTimeout(tm); showAll();
    stopPhotos();
    lt.classList.remove("on"); $("#letterbtn").hidden = false;
    setTimeout(() => { st.className = "ltst"; running = false; }, 450);
  }
  ltb.addEventListener("click", () => { closeLetter(); });
  $("#ltx").addEventListener("click", closeLetter);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && lt.classList.contains("on")) closeLetter(); });

  /* a button to re-read the letter later */
  $("#acts").insertAdjacentHTML("beforeend", '<button class="btn alt sm" id="letterbtn" hidden>Read the letter 💌</button>');
  $("#letterbtn").addEventListener("click", () => openLetter(true));

  /* trigger: the last slice has been cut (or she taps Continue before that) */
  let cc = 0;
  $("#cutbtn").addEventListener("click", () => { cc++; if (cc >= 6) setTimeout(() => { if (!seen) openLetter(false); }, 3300); });
  $("#goon").addEventListener("click", () => { if (!seen) setTimeout(() => openLetter(false), 500); });
})();

/* Door v7: tap the door to enter the party room */
function openDoor() {
  if (!ready || opened) return;
  opened = true;
  const dr = $("#door");
  dr.classList.remove("ready"); dr.classList.add("open"); dr.removeAttribute("role"); dr.removeAttribute("tabindex");
  document.querySelector(".scene").classList.add("opened");
  sfx([[392, .1], [523, .1], [659, .15]]);
  setTimeout(enterRoom, 2600); setTimeout(() => burst(200), 900);
  for (let i = 0; i < 24; i++) setTimeout(spawnDeco, 400 + i * 90);
  track("room", "door tapped");
}
$("#door").addEventListener("click", openDoor);
$("#door").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDoor(); } });

/* Exit v8: leave the party room, back to the door screen */
ins.insertAdjacentHTML("beforeend", '<button class="btn sm" id="exitbtn" aria-label="Exit the room">🚪 Exit</button>');
function exitRoom() {
  if (ins.hidden) return;
  ins.hidden = true; $("#outside").hidden = false; $("#t-door").classList.remove("inroom");
  partyOn = false; bg();                       /* party song stops, soft music returns */
  $("#nav").hidden = false;                    /* she is out, so the tabs are free */
  const dr = $("#door");
  dr.classList.remove("open"); void dr.offsetWidth;
  document.querySelector(".scene").classList.remove("opened");
  opened = false;
  if (ready) { dr.classList.add("ready"); dr.setAttribute("role", "button"); dr.tabIndex = 0; dr.setAttribute("aria-label", "Open the door"); }
  track("room", "exited");
}
$("#exitbtn").addEventListener("click", exitRoom);
