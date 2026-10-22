/* ===== EDIT THESE ===== */
const PASSWORD = "fish";
const BIRTHDAY = new Date(2026, 9, 23, 0, 0, 0);   // 23 Oct 2026, 12:00 am (visitor’s local time)
const YT_PLAYLIST = "PLRFTrQY8fGBU";   // paste your YouTube playlist ID here (the part after list=)
const PHOTO_LINK = "https://drive.google.com/drive/folders/1es07QWsyDwTA37LYfl8iNq5EPzdbfXXs?usp=sharing";   // Google Drive folder for photo uploads
const PLAYLIST_LINK = "https://www.youtube.com/playlist?list=PLRFTrQY8fGBU&jct=2PlIBhoDxqfxvzpZUXcqTQ";   // paste the collaborative playlist invite link here (leave empty to hide the button)
const COUPON_HOURS = 4;   // hours between coupons
const MEGA_AFTER = 3;     // coupons needed to unlock the MEGA coupon
const WISH_MAX = 6, WISH_GAP_H = 2.5;   // wishes allowed, hours between wishes
const SHEET_URL = "https://script.google.com/macros/s/AKfycbx6Wv9dJIceg-I9ZJfbQnLYs5yD5hgrEfUAN9oO0zih2PG9B1x3cWMDm56P7FIpIvyn/exec";   // paste your Google Apps Script web app URL here (see setup steps)
/* ====================== */
const $ = s => document.querySelector(s);
const store = {get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

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
function fit(){ cv.width = innerWidth; cv.height = innerHeight; } fit(); addEventListener("resize", fit);
function burst(n){
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const cols = ["#FF9EC4","#F5B94A","#3FB7A5","#8A9A3B","#4A2A6B"];
  for (let i = 0; i < n; i++) parts.push({x: innerWidth/2, y: innerHeight/3, vx: (Math.random()-.5)*14, vy: Math.random()*-12, c: cols[i%5], l: 140, r: 3+Math.random()*4});
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick(){
  cx.clearRect(0,0,cv.width,cv.height); parts = parts.filter(p => p.l > 0);
  parts.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=.35; p.l--; cx.fillStyle=p.c; cx.fillRect(p.x,p.y,p.r*2,p.r); });
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

/* Countdown (add #open to the link to preview the reveal) */
const target = location.hash === "#open" ? new Date(Date.now() - 1) : BIRTHDAY;
let opened = false;
const UNITS = ["days","hrs","min","sec"];
$("#cd").innerHTML = UNITS.map(u => `<div data-u="${u}"><b>00</b><span>${u}</span></div>`).join("");
function setUnit(u, n){ const b = $(`#cd [data-u="${u}"] b`), v = String(n).padStart(2, "0"); if (b.textContent !== v) { b.textContent = v; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); } }
const DECO = ["🎈","🎀","🎉","✨","💖","🎊","🌸","🍰","🎁"];
function spawnDeco(){
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
function updateCd(){
  const d = target - Date.now();
  if (d <= 0) {
    $("#cd").hidden = true; $("#cdmsg").textContent = "The door is open. Happy Birthday, Shreety!";
    if (!opened) { opened = true; document.querySelector(".scene").classList.add("opened"); $("#door").classList.add("open"); setTimeout(() => burst(200), 900); for (let i = 0; i < 24; i++) setTimeout(spawnDeco, 400 + i * 90); }
    return;
  }
  const t = Math.floor(d / 1000);
  setUnit("days", Math.floor(t / 86400)); setUnit("hrs", Math.floor(t % 86400 / 3600)); setUnit("min", Math.floor(t % 3600 / 60)); setUnit("sec", t % 60);
  $("#cd").classList.toggle("final", d <= 10000);
}
updateCd(); setInterval(updateCd, 1000);

/* Planner */
function planner(root, key, ph){
  let days = []; try { days = JSON.parse(store.get(key) || "[]"); } catch(e){}
  const save = () => store.set(key, JSON.stringify(days));
  const planText = () => days.map(d => d.t + "\n" + d.items.map(x => " - " + x).join("\n")).join("\n\n") || "(empty)";
  root.innerHTML = `<div class="add"><input class="dn" placeholder="${ph}" aria-label="New day"><button class="btn sm" data-a="day">Add day</button></div><div class="days"></div><button class="btn alt" data-a="copy">Copy itinerary</button>`;
  const box = root.querySelector(".days");
  const draw = () => { box.innerHTML = days.map((d,i) => `<div class="day"><h3>${esc(d.t)}<button class="x" data-a="rmd" data-i="${i}" aria-label="Remove day">×</button></h3><ul>${d.items.map((it,j) => `<li>${esc(it)}<button class="x" data-a="rmi" data-i="${i}" data-j="${j}" aria-label="Remove item">×</button></li>`).join("")}</ul><div class="add"><input data-in="${i}" placeholder="Add a plan or place" aria-label="Add plan"><button class="btn sm" data-a="item" data-i="${i}">Add</button></div></div>`).join("") || `<p class="hint">Nothing yet. Add your first day!</p>`; };
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, i = +b.dataset.i;
    if (a === "day") { const inp = root.querySelector(".dn"), v = inp.value.trim(); if (!v) return; days.push({t: v, items: []}); inp.value = ""; }
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
const GOOD = ["🍟","🍰","🍉","🍦","🎀","🧡"], BAD = ["🐛"];
function startGame(){ G = {x:160, s:0, t:30, it:[], sp:0, last:performance.now()}; $("#play").textContent = "Playing…"; requestAnimationFrame(loop); }
function stopGame(){ G = null; $("#play").textContent = "Play (30 seconds)"; }
function move(cx_){ if (!G) return; const r = gc.getBoundingClientRect(); G.x = Math.max(30, Math.min(290, (cx_ - r.left) * 320 / r.width)); }
gc.addEventListener("pointermove", e => move(e.clientX)); gc.addEventListener("pointerdown", e => move(e.clientX));
addEventListener("keydown", e => { if (G && e.key === "ArrowLeft") G.x = Math.max(30, G.x - 25); if (G && e.key === "ArrowRight") G.x = Math.min(290, G.x + 25); });
function loop(now){
  if (!G) return; const dt = Math.min(.05, (now - G.last) / 1000); G.last = now; G.t -= dt; G.sp -= dt;
  if (G.sp <= 0) { G.sp = .55; const bad = Math.random() < .2; G.it.push({x: 25 + Math.random()*270, y: -20, v: 110 + Math.random()*110, e: bad ? BAD[0] : GOOD[Math.floor(Math.random()*GOOD.length)], bad}); }
  g.clearRect(0,0,320,420); g.textAlign = "center"; g.font = "30px serif";
  G.it = G.it.filter(o => { o.y += o.v * dt; g.fillText(o.e, o.x, o.y);
    if (o.y > 355 && o.y < 400 && Math.abs(o.x - G.x) < 38) { G.s = Math.max(0, G.s + (o.bad ? -3 : 1)); return false; }
    return o.y < 440; });
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
function renderQueue(){
  if (!ids.length) return;
  const cur = yp.getPlaylistIndex ? yp.getPlaylistIndex() : -1;
  $("#queue").hidden = false;
  $("#q").innerHTML = ids.map((id, i) => {
    const tag = i === cur ? '<span class="tag">Now playing</span>' : (i === cur + 1 ? '<span class="tag">Next</span>' : "");
    return `<li class="${i === cur ? "cur" : ""}"><button data-i="${i}"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy"><span class="t">${tag}${esc(titles[id] || "Song " + (i + 1))}</span></button></li>`;
  }).join("");
  const c = $("#q .cur"); if (c) $("#queue").scrollTop = Math.max(0, c.offsetTop - 70);
}
function loadQueue(){
  if (!yp || !yp.getPlaylist) return;
  const l = yp.getPlaylist();
  if (l && l.length && l.join() !== ids.join()) {
    ids = l; try { yp.setLoop(true); } catch (e) {}
    ids.forEach(id => { if (!titles[id] && !tried[id]) { tried[id] = 1;
      fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id)).then(r => r.json()).then(j => { titles[id] = j.title; renderQueue(); }).catch(() => {}); } });
  }
  renderQueue();
}
window.onYouTubeIframeAPIReady = () => {
  yp = new YT.Player("ytp", {height:"200", width:"200", playerVars:{listType:"playlist", list:YT_PLAYLIST, playsinline:1, controls:0}, events:{
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
  }});
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
let tab = "door", ytOn = false; const _ = null;
const AU = {ctx:null, out:null, tune:null, step:0, next:0, muted:false};
const MIDI = n => 440 * Math.pow(2, (n - 69) / 12);
const TUNES = {
  sweet:{bpm:100, lines:[
    {t:"sine", v:.09, d:2.2, n:[60,64,67,72,67,64,67,64, 57,60,64,69,64,60,64,60, 53,57,60,65,60,57,60,57, 55,59,62,67,62,59,62,59]},
    {t:"triangle", v:.08, d:1.6, n:[79,_,76,_,79,_,84,_, 81,_,79,_,76,_,_,_, 76,_,79,_,81,_,79,_, 79,_,74,_,76,_,_,_]}
  ]},
  game:{bpm:150, lines:[
    {t:"square", v:.035, d:.9, n:[72,76,79,76,72,76,79,84, 71,74,79,74,71,74,79,83, 69,72,76,72,69,72,76,81, 65,69,72,69,65,69,72,77]},
    {t:"triangle", v:.10, d:1.6, n:[48,_,48,_,48,_,48,_, 43,_,43,_,43,_,43,_, 45,_,45,_,45,_,45,_, 41,_,41,_,41,_,41,_]}
  ]}
};
function tone(f, t, dur, type, vol){
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + dur + .05);
}
function sched(){
  if (!AU.tune) return;
  const T = TUNES[AU.tune], sd = 60 / T.bpm / 2;
  if (AU.next < AU.ctx.currentTime) AU.next = AU.ctx.currentTime + .05;
  while (AU.next < AU.ctx.currentTime + .3) {
    const s = AU.step % 32;
    T.lines.forEach(l => { if (l.n[s]) tone(MIDI(l.n[s]), AU.next, l.d * sd, l.t, l.v); });
    AU.next += sd; AU.step++;
  }
}
function bg(){
  if (!AU.ctx) return;
  if (AU.ctx.resume) AU.ctx.resume();
  const want = (AU.muted || ytOn) ? null : (tab === "game" ? "game" : "sweet");
  if (want !== AU.tune) { AU.tune = want; AU.step = 0; AU.next = AU.ctx.currentTime + .15; }
}
function startAudio(){
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    AU.ctx = new C(); AU.out = AU.ctx.createGain(); AU.out.gain.value = .9; AU.out.connect(AU.ctx.destination);
    setInterval(sched, 80); bg();
  } catch (e) {}
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
const POOL = ["🍉","🐱","🍦","🍟","🎀","🌸","💄","💅","🪞","👛","🧸","🍓","🦋","🧁","🎧","🌷"];
let mm = null, mn = +(store.get("mn") || 6);
const showBest = () => { const b = +(store.get("mbest" + mn) || 0); $("#mbest").textContent = b ? "Best: " + b + " moves" : ""; };
function newMatch(){
  const f = [...POOL].sort(() => Math.random() - .5).slice(0, mn), a = [...f, ...f].sort(() => Math.random() - .5);
  const cols = mn <= 8 ? 4 : mn === 10 ? 5 : 6, g = $("#mgrid");
  g.style.setProperty("--c", cols); g.style.setProperty("--r", Math.ceil(a.length / cols));
  mm = {a, open: [], done: 0, moves: 0, lock: false};
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
  {e:"🍟", t:"Peri peri fries", s:"One serving of your favourite fries, on me."},
  {e:"💬", t:"Vent session", s:"A full session. I’ll just listen, no judging."},
  {e:"🎬", t:"Movie night", s:"You pick the movie, I bring the snacks."}];
const MEGA = {e:"👑", t:"MEGA WISH", s:"Any wish you want. I’ll grant it (if it’s feasible)!", mega:true};
let cp = {list: [], last: 0, mega: false}; try { cp = Object.assign(cp, JSON.parse(store.get("cpn") || "{}")); } catch (e) {}
$("#chint").textContent = `A new coupon every ${COUPON_HOURS} hours. Collect ${MEGA_AFTER} to unlock the MEGA coupon!`;
const fmt = ms => { const t = Math.ceil(ms / 1000); return [Math.floor(t / 3600), Math.floor(t % 3600 / 60), t % 60].map(v => String(v).padStart(2, "0")).join(":"); };
const when = ts => new Date(ts).toLocaleString([], {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"});
function drawList(){
  $("#clist").innerHTML = cp.list.slice().reverse().map(c => `<div class="cc${c.mega ? " mega" : ""}"><span>${c.e} ${esc(c.t)}<small>${when(c.ts)}</small></span><button class="btn sm" data-d="${c.id}">Download</button></div>`).join("");
}
function tickCp(){
  const n = cp.list.filter(c => !c.mega).length, left = cp.last + COUPON_HOURS * 36e5 - Date.now(), ready = left <= 0;
  $("#cstat").textContent = ready ? "A coupon is ready to open!" : "Next coupon in " + fmt(left);
  $("#copen").disabled = !ready || !!cp.pending; $("#cmega").hidden = !(n >= MEGA_AFTER && !cp.mega); $("#cmega").disabled = !!cp.pending; if (cp.pending) $("#cstat").textContent = "Scratch your coupon to reveal it!";
  $("#cprog").textContent = "🎟️".repeat(Math.min(n, MEGA_AFTER)) + "⚪".repeat(Math.max(0, MEGA_AFTER - n)) + " → 👑" + (cp.mega ? " ✅" : "");
}
function addCoupon(pz){
  const ts = Date.now(), c = {id: "SHR-" + ts.toString(36).toUpperCase().slice(-5), e: pz.e, t: pz.t, s: pz.s, ts, mega: !!pz.mega};
  cp.list.push(c); if (pz.mega) cp.mega = true;
  store.set("cpn", JSON.stringify(cp)); drawList(); tickCp(); burst(140); track("coupon", c.e + " " + c.t);
  $("#creveal").textContent = "You got: " + c.e + " " + c.t + "!";
}
function showScratch(pz){
  const box = $("#scratch"); box.hidden = false; $("#creveal").textContent = "";
  box.innerHTML = `<div class="sc-card${pz.mega ? " mega" : ""}"><span class="sce">${pz.e}</span><b>${esc(pz.t)}</b><small>${esc(pz.s)}</small></div><canvas id="scv" width="300" height="150" aria-label="Scratch to reveal your coupon"></canvas>`;
  const cv = $("#scv"), x = cv.getContext("2d"), gr = x.createLinearGradient(0, 0, 300, 150);
  gr.addColorStop(0, "#FF9EC4"); gr.addColorStop(.5, "#F5B94A"); gr.addColorStop(1, "#BFE3F5");
  x.fillStyle = gr; x.fillRect(0, 0, 300, 150); x.fillStyle = "#4A2A6B"; x.textAlign = "center"; x.font = "700 24px Fredoka, sans-serif"; x.fillText("Scratch here ✨", 150, 84);
  let down = false, done = false;
  const sc = e => { if (!down || done) return; const r = cv.getBoundingClientRect(); x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc((e.clientX - r.left) * 300 / r.width, (e.clientY - r.top) * 150 / r.height, 17, 0, 7); x.fill(); };
  const check = () => { if (done) return; const d = x.getImageData(0, 0, 300, 150).data; let c = 0; for (let i = 3; i < d.length; i += 16) if (d[i] === 0) c++;
    if (c / (d.length / 16) > .5) { done = true; cv.style.transition = "opacity .5s"; cv.style.opacity = 0; setTimeout(() => cv.remove(), 500); const q = cp.pending; cp.pending = null; if (q) addCoupon(q); } };
  cv.addEventListener("pointerdown", e => { down = true; cv.setPointerCapture(e.pointerId); sc(e); });
  cv.addEventListener("pointermove", sc);
  cv.addEventListener("pointerup", () => { down = false; check(); });
  cv.addEventListener("pointercancel", () => { down = false; });
}
function getCoupon(pz, normal){
  cp.pending = pz; if (normal) cp.last = Date.now(); store.set("cpn", JSON.stringify(cp)); showScratch(pz); tickCp();
}
$("#copen").addEventListener("click", () => {
  const prev = cp.list.filter(c => !c.mega).slice(-1)[0], pool = PRIZES.filter(z => !prev || z.t !== prev.t);
  getCoupon(pool[Math.floor(Math.random() * pool.length)], true);
});
$("#cmega").addEventListener("click", () => getCoupon(MEGA, false));
function rr(x, a, b, w, h, r){ x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function download(c){
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
function post(o){   if (!SHEET_URL || store.get("noTrack") || location.hostname !== "gt-ashish.github.io") return; try { fetch(SHEET_URL, {method: "POST", mode: "no-cors", keepalive: true, body: JSON.stringify(o)}).catch(() => {}); } catch (e) {} }
function track(type, detail){ post({type, detail: typeof detail === "string" ? detail : JSON.stringify(detail || "")}); }
const sendSess = () => post({type: "session", sid: SID, visit: visitNo, sec: secs});
function startTracking(){
  visitNo = (+store.get("visits") || 0) + 1; store.set("visits", visitNo); track("visit", "Visit #" + visitNo);
  setInterval(() => { if (!document.hidden) secs++; }, 1000);   // counts only while the page is visible
  setInterval(sendSess, 30000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) sendSess(); });
  addEventListener("pagehide", sendSess); sendSess();
}

/* Make a wish */
let ws = {list: [], last: 0}; try { ws = Object.assign(ws, JSON.parse(store.get("wishes") || "{}")); } catch (e) {}
let lit = false, curWish = "";
function wtick(){
  const n = ws.list.length, left = ws.last + WISH_GAP_H * 36e5 - Date.now(), btn = $("#wbtn"), inp = $("#wtext"), st = $("#wstat");
  $("#wdots").textContent = "🕯️".repeat(n) + "⚪".repeat(Math.max(0, WISH_MAX - n));
  $("#candle").classList.toggle("lit", lit);
  if (lit) { st.textContent = "The candle is lit. Tap the flame or the button to blow it out!"; btn.textContent = "Blow it out 🌬️"; btn.disabled = false; inp.disabled = true; }
  else if (n >= WISH_MAX) { st.textContent = "All " + WISH_MAX + " wishes made. Fingers crossed! 💖"; btn.disabled = true; inp.disabled = true; }
  else if (n > 0 && left > 0) { st.textContent = "Next wish in " + fmt(left); btn.textContent = "Light the candle"; btn.disabled = true; inp.disabled = true; }
  else { st.textContent = "Wish " + (n + 1) + " of " + WISH_MAX; btn.textContent = "Light the candle"; btn.disabled = false; inp.disabled = false; }
}
function wishAction(){
  if (!lit) {
    curWish = $("#wtext").value.trim(); if (!curWish) { $("#wstat").textContent = "Type your wish first 💭"; return; }
    lit = true; $("#wf").classList.remove("off");
  } else {
    lit = false; $("#wf").classList.add("off"); const ts = Date.now();
    ws.list.push({w: curWish, ts}); ws.last = ts; store.set("wishes", JSON.stringify(ws));
    track("wish", "Wish " + ws.list.length + ": " + curWish); $("#wtext").value = ""; burst(150);
  }
  wtick();
}
$("#wbtn").addEventListener("click", wishAction);
$("#candle").addEventListener("click", () => { if (lit) wishAction(); });
wtick(); setInterval(wtick, 1000);