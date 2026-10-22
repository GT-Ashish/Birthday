#!/usr/bin/env python3
"""Adds the birthday room (lamp cord -> lights -> red bow curtain -> party) to the site.
Run from the folder containing index.html, style.css and script.js:
    python3 patch_room.py
Backs up the originals as *.bak first. Refuses to run twice."""
import shutil, sys

h = open('index.html', encoding='utf-8').read()
c = open('style.css', encoding='utf-8').read()
j = open('script.js', encoding='utf-8').read()
if 'id="inside"' in h:
    sys.exit("Already patched, nothing to do.")
for f in ('index.html', 'style.css', 'script.js'):
    shutil.copy(f, f + '.bak')

def rep(t, a, b):
    assert t.count(a) == 1, ("anchor not found exactly once:", t.count(a), a[:70])
    return t.replace(a, b)

# ---------- HTML ----------
h = rep(h, '<circle cx="20" cy="20" r="5"/></symbol></svg>',
 '<circle cx="20" cy="20" r="5"/></symbol><symbol id="lily" viewBox="-20 -20 40 40"><g fill="#fff" stroke="#E8307A" stroke-width="1.5"><ellipse cy="-9" rx="4.5" ry="10"/><ellipse cy="-9" rx="4.5" ry="10" transform="rotate(60)"/><ellipse cy="-9" rx="4.5" ry="10" transform="rotate(120)"/><ellipse cy="-9" rx="4.5" ry="10" transform="rotate(180)"/><ellipse cy="-9" rx="4.5" ry="10" transform="rotate(240)"/><ellipse cy="-9" rx="4.5" ry="10" transform="rotate(300)"/></g><circle r="3" fill="#F5B94A"/></symbol></svg>')
h = rep(h, '<section class="wrap fit" id="t-door">\n', '<section class="wrap fit" id="t-door">\n  <div id="outside">\n')
drip = 'q10 14 20 0 ' * 8
inside = f'''  </div>
  <div id="inside" data-stage="dark" hidden>
    <p class="sub" id="inshint"></p>
    <div class="roomv">
      <div class="wall"></div><div class="floor"></div>
      <div class="bunt" id="bunt"></div><div id="balloons"></div>
      <div class="tbl"></div><span class="snack s1">🍟</span><span class="snack s2">🥨</span>
      <svg class="cakev" viewBox="0 0 200 190" role="img" aria-label="Birthday cake with candles 2 and 3">
        <ellipse cx="100" cy="176" rx="92" ry="9" fill="#4A2A6B" opacity=".2"/>
        <rect x="18" y="112" width="164" height="62" rx="12" fill="#FF9EC4" stroke="#4A2A6B" stroke-width="4"/>
        <rect x="46" y="64" width="108" height="52" rx="10" fill="#F5B94A" stroke="#4A2A6B" stroke-width="4"/>
        <path d="M46 82q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 v-8H46z" fill="#fff" stroke="#4A2A6B" stroke-width="3"/>
        <path d="M18 130 {drip}v-8H18z" fill="#fff"/>
        <g class="cdl"><rect x="70" y="28" width="22" height="38" rx="4" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><text x="81" y="55" text-anchor="middle" font-size="22" font-weight="700" font-family="Fredoka,sans-serif" fill="#E8307A">2</text><path class="fl" d="M81 24c-9-8 0-14 0-22 9 6 9 14 0 22z" fill="#FF9F1C" stroke="#F5B94A" stroke-width="1.5"/></g>
        <g class="cdl"><rect x="108" y="28" width="22" height="38" rx="4" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><text x="119" y="55" text-anchor="middle" font-size="22" font-weight="700" font-family="Fredoka,sans-serif" fill="#E8307A">3</text><path class="fl" d="M119 24c-9-8 0-14 0-22 9 6 9 14 0 22z" fill="#FF9F1C" stroke="#F5B94A" stroke-width="1.5"/></g>
      </svg>
      <svg class="vase" viewBox="0 -10 70 130" role="img" aria-label="Vase of lilies"><path d="M25 60Q20 30 22 18M38 60Q38 26 38 10M50 60Q56 34 52 22" stroke="#3FB7A5" stroke-width="3" fill="none"/><use href="#lily" x="5" y="1" width="34" height="34"/><use href="#lily" x="21" y="-7" width="34" height="34"/><use href="#lily" x="35" y="5" width="34" height="34"/><path d="M18 60h34l-4 52q-1 6-8 6H30q-7 0-8-6z" fill="#BFE3F5" stroke="#4A2A6B" stroke-width="4"/></svg>
      <div class="cur l"></div><div class="cur r"></div>
      <div class="fairy" id="fairy"></div>
      <button class="bowbtn" id="bowbtn" aria-label="Untie the big red bow"><svg viewBox="0 0 140 100"><g fill="#D7263D" stroke="#8c1427" stroke-width="3"><path d="M64 56 44 98l16-8 8-28z"/><path d="M76 56 96 98l-16-8-8-28z"/><path d="M70 50C30 0 0 15 8 50c-8 35 22 50 62 0z"/><path d="M70 50C110 0 140 15 132 50c8 35-22 50-62 0z"/><ellipse cx="70" cy="50" rx="13" ry="14" fill="#B01E32"/></g></svg></button>
      <div class="dim"></div>
      <div class="lamp"><span class="glow"></span><span class="shade"></span><div class="cord" id="cord"><button id="cordb" aria-label="Pull the lamp cord"></button></div></div>
    </div>
    <button class="btn sm" id="relight" hidden>Light the candles again 🕯️</button>
  </div>
</section>

<section class="wrap" id="t-sikkim" hidden>'''
h = rep(h, 'until the door opens at midnight</p>\n</section>\n\n<section class="wrap" id="t-sikkim" hidden>',
        'until the door opens at midnight</p>\n' + inside)

# ---------- CSS ----------
c = c.rstrip('\n') + '''

/* Inside the birthday room */
#outside{display:contents}
#inside{display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:6px;width:100%;height:100%}
.roomv{position:relative;width:min(94vw,560px);height:min(58vh,500px);overflow:hidden;border:4px solid var(--plum);border-radius:24px;background:#BFE3F5}
.roomv::before{content:"";position:absolute;left:0;right:0;top:0;height:10px;background:var(--plum);z-index:5}
.wall{position:absolute;inset:0;background:radial-gradient(#fff 2px,transparent 3px) 0 0/28px 28px,linear-gradient(#E6F5FC,#BFE3F5)}
.floor{position:absolute;left:0;right:0;bottom:0;height:24%;background:repeating-linear-gradient(90deg,#F5B94A 0 40px,#f0ab2f 40px 80px);border-top:4px solid var(--plum)}
.tbl{position:absolute;left:8%;right:8%;bottom:10%;height:12%;background:var(--olive);border:4px solid var(--plum);border-radius:12px}
.snack{position:absolute;bottom:21%;font-size:clamp(1.6rem,6vh,2.4rem)}.s1{left:10%}.s2{left:21%}
.cakev{position:absolute;left:50%;bottom:21%;width:44%;transform:translateX(-50%)}
.vase{position:absolute;right:10%;bottom:21%;width:14%}
.cdl{cursor:pointer}.fl{transform-box:fill-box;transform-origin:50% 100%;animation:flick .45s infinite alternate ease-in-out}
.bunt{position:absolute;left:0;right:0;top:44px;z-index:2}
.brow{display:flex;justify-content:center;gap:3px;border-top:2px solid var(--plum);margin:0 8% 6px}
.brow span{flex:0 1 26px;height:32px;clip-path:polygon(0 0,100% 0,50% 100%);text-align:center;font:700 .85rem Fredoka,sans-serif;color:var(--plum);opacity:0}
.brow .sp{flex:0 0 14px;background:none!important}
[data-stage=open] .brow span{animation:drop .5s ease-out both;animation-delay:calc(var(--i) * 70ms)}
@keyframes drop{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:none}}
.bl{position:absolute;top:var(--t);left:var(--l);z-index:3;width:34px;height:42px;border-radius:50% 50% 46% 46%;background:var(--c);border:3px solid var(--plum);opacity:0}
.bl::after{content:"";position:absolute;left:50%;top:100%;width:2px;height:34px;background:var(--plum)}
[data-stage=open] .bl{animation:rise 2.4s var(--dl) ease-out both,bob 3s calc(2.4s + var(--dl)) ease-in-out infinite alternate}
@keyframes rise{from{opacity:0;transform:translateY(480px)}to{opacity:1;transform:none}}
.cur{position:absolute;top:0;bottom:0;width:50.5%;z-index:4;transition:transform 1.5s cubic-bezier(.6,0,.3,1);background:repeating-linear-gradient(90deg,#f58fb9 0 16px,#ff9ec4 16px 32px);box-shadow:inset 0 -30px 40px rgba(74,42,107,.25)}
.cur.l{left:0}.cur.r{right:0}
[data-stage=open] .cur.l{transform:translateX(-102%)}[data-stage=open] .cur.r{transform:translateX(102%)}
.fairy{position:absolute;left:0;right:0;top:10px;height:30px;z-index:5;opacity:0;transition:opacity 1s}
[data-stage=lit] .fairy,[data-stage=open] .fairy{opacity:1}
.fairy svg{position:absolute;inset:0;width:100%;height:100%}
.fairy i{position:absolute;width:9px;height:12px;border-radius:50%;background:var(--c);box-shadow:0 0 8px 2px var(--c);animation:twk 1.4s ease-in-out infinite alternate;animation-delay:var(--d)}
@keyframes twk{from{opacity:.4}to{opacity:1}}
.bowbtn{position:absolute;left:50%;top:44%;z-index:5;width:min(46%,190px);aspect-ratio:1.4;padding:0;background:none;border:0;cursor:grab;touch-action:none;transform:translate(-50%,-50%) translate(var(--bx,0px),var(--by,0px)) rotate(var(--br,0deg))}
.bowbtn svg{width:100%;height:100%;filter:drop-shadow(0 4px 0 rgba(74,42,107,.5))}
.bowbtn.undone{transition:all .4s;opacity:0;transform:translate(-50%,10%) rotate(30deg) scale(.7)}
[data-stage=dark] .bowbtn{pointer-events:none}[data-stage=open] .bowbtn{display:none}
.dim{position:absolute;inset:0;z-index:6;background:rgba(18,8,38,.92);transition:opacity 1.2s;pointer-events:none}
[data-stage=lit] .dim,[data-stage=open] .dim{opacity:0}
.lamp{position:absolute;left:50%;top:0;z-index:7}
.lamp::before{content:"";position:absolute;left:-1px;top:0;width:2px;height:14px;background:var(--plum)}
.shade{position:absolute;left:-34px;top:12px;width:68px;height:34px;background:var(--gold);clip-path:polygon(20% 0,80% 0,100% 100%,0 100%);transition:filter 1s}
[data-stage=dark] .shade{filter:brightness(.55)}
.glow{position:absolute;left:-70px;top:10px;width:140px;height:140px;border-radius:50%;background:radial-gradient(rgba(255,214,102,.85),transparent 70%);opacity:.9;transition:opacity 1s}
[data-stage=dark] .glow{opacity:.25}
.cord{position:absolute;left:18px;top:42px;width:2px;height:calc(44px + var(--p,0px));background:#fff}
#cordb{position:absolute;left:-8px;bottom:-14px;width:18px;height:18px;border-radius:50%;background:var(--pink);border:3px solid var(--plum);padding:0;cursor:grab;touch-action:none}
[data-stage=lit] #cordb,[data-stage=open] #cordb{pointer-events:none}
@media (prefers-reduced-motion:reduce){.fairy i,.fl,[data-stage=open] .bl{animation:none}[data-stage=open] .bl{opacity:1}[data-stage=open] .brow span{animation:none;opacity:1}.cur{transition:none}}
'''

# ---------- JS ----------
j = rep(j, 'const target = location.hash === "#open" ? new Date(Date.now() - 1) : BIRTHDAY;',
        'const PREVIEW = location.hash === "#open";\nconst target = PREVIEW ? new Date(Date.now() - 1) : BIRTHDAY;')
j = rep(j, '$("#door").classList.add("open");', '$("#door").classList.add("open"); setTimeout(enterRoom, 2600);')
j = rep(j, 'let tab = "door", ytOn = false;', 'let tab = "door", ytOn = false, partyOn = false;')
j = rep(j, '(tab === "game" ? "game" : "sweet")', '(tab === "game" ? "game" : partyOn ? "party" : "sweet")')
j = rep(j, 'const TUNES = {', '''const TUNES = {
  party: {bpm: 118, lines: [
    {t:"triangle", v:.09, d:1.6, n:[72,_,76,79,_,84,79,_, 77,_,81,84,_,81,77,_, 74,_,79,83,_,79,74,_, 72,_,76,79,84,_,_,_]},
    {t:"triangle", v:.10, d:1.4, n:[48,_,_,_,52,_,_,_, 53,_,_,_,57,_,_,_, 55,_,_,_,59,_,_,_, 48,_,_,_,52,_,55,_]},
    {t:"sine", v:.05, d:.7, n:[84,_,_,_,_,_,88,_, 89,_,_,_,_,_,93,_, 86,_,_,_,_,_,91,_, 84,_,_,_,88,_,_,_]}
  ]},''')

j = j.rstrip('\n') + '''

/* ==========================================================
   Inside the birthday room: lamp cord -> lights -> curtain bow -> party
   (open the site with #open on the end to preview it)
   ========================================================== */
const ins = $("#inside");
let stage = null;
const HINTS = {
  dark: "The door swung open. It’s dark in there… pull the lamp cord! 💡",
  lit: "Lights on! Now untie the big red bow 🎀 (drag it or tap it)",
  open: "Surprise! Tap the candles to blow them out 🎂"
};
function sfx(a){ if (!AU.ctx || AU.muted) return; a.forEach((x, i) => tone(x[0], AU.ctx.currentTime + i * 0.09, x[1], "triangle", 0.12)); }
function setStage(s, quiet){
  stage = s; ins.dataset.stage = s; if (!PREVIEW) store.set("rstage", s);
  $("#inshint").textContent = HINTS[s];
  if (s === "open") { partyOn = true; bg(); if (!quiet) { burst(200); track("room", "curtain untied"); } }
}
function enterRoom(){
  if (!ins.hidden) return;
  $("#outside").hidden = true; ins.hidden = false;
  const saved = PREVIEW ? null : store.get("rstage");
  setStage(saved || "dark", true);
}
function lightsOn(){ if (stage !== "dark") return; setStage("lit"); sfx([[880, .08], [1320, .12]]); track("room", "lights on"); }
function untie(){ if (stage !== "lit") return; $("#bowbtn").classList.add("undone"); sfx([[523, .1], [659, .1], [784, .1], [1047, .2]]); setTimeout(() => setStage("open"), 400); }

function pull(el, move, done){
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
  (tap) => { if (tap || bd > 40) untie(); else { bd = 0; ["--bx", "--by", "--br"].forEach((p) => bow.style.removeProperty(p)); } });

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
  if (blown === 2) { burst(160); $("#inshint").textContent = "Happy Birthday, Shreety! 🎂 Now make a wish (see the Make a Wish tab)"; $("#relight").hidden = false; track("cake", "candles blown out"); }
}));
$("#relight").addEventListener("click", () => { document.querySelectorAll(".fl").forEach((f) => f.classList.remove("off")); blown = 0; $("#relight").hidden = true; $("#inshint").textContent = HINTS.open; });
'''

open('index.html', 'w', encoding='utf-8').write(h)
open('style.css', 'w', encoding='utf-8').write(c)
open('script.js', 'w', encoding='utf-8').write(j)
print("Patched index.html, style.css, script.js (backups saved as *.bak)")
