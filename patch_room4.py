#!/usr/bin/env python3
"""Step 4: HAPPY BIRTHDAY banner, party poppers, cake cutting, nav hidden until the party ends.
Run in the site folder after patch_room.py/2/3:  python3 patch_room4.py"""
import shutil, sys
c = open('style.css', encoding='utf-8').read(); j = open('script.js', encoding='utf-8').read()
if '/* Party v4 */' in c: sys.exit("Already patched.")
for f in ('style.css', 'script.js'): shutil.copy(f, f + '.bak4')
def rep(t, a, b):
    assert t.count(a) == 1, ("anchor not found once:", t.count(a), a[:60]); return t.replace(a, b)
j = rep(j, 'Now make a wish (see the Make a Wish tab)', 'Close your eyes and make a wish ✨')
j = rep(j, 'Tap the candles to blow them out', 'Tap the candles to blow them out (and pop those poppers 🎉)')
j = rep(j, '$("#outside").hidden = true; ins.hidden = false;', '$("#outside").hidden = true; ins.hidden = false; if (PREVIEW || !store.get("navok")) $("#nav").hidden = true;')
c += r"""
/* Party v4 */
.bn{position:absolute;left:50%;transform:translateX(-50%);top:64px;width:min(88%,860px);height:110px;z-index:2}
.bn svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.bn svg path{fill:none;stroke:var(--plum);stroke-width:3;vector-effect:non-scaling-stroke}
.bnf{position:absolute;inset:0;display:flex;align-items:flex-start}
.fl2{flex:1 1 0;max-width:62px;aspect-ratio:.8;margin-top:var(--y);clip-path:polygon(0 0,100% 0,50% 100%);background:var(--c);display:flex;justify-content:center;padding-top:.15em;font:700 min(3.4cqw,1.7rem) Fredoka,sans-serif;color:#fff;text-shadow:2px 2px 0 var(--plum),-1px -1px 0 var(--plum);transform-origin:50% 0;opacity:0}
.fl2.sp{flex:.5 1 0;background:none}
[data-stage=open] .fl2{animation:fdrop .5s calc(var(--i)*70ms) ease-out both,fswing 2.6s calc(.6s + var(--i)*70ms) ease-in-out infinite alternate}
@keyframes fdrop{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:none}}
@keyframes fswing{from{opacity:1;transform:rotate(-5deg)}to{opacity:1;transform:rotate(5deg)}}
[data-stage=open] .cord{display:none}
.pp{position:absolute;bottom:30%;left:var(--l);z-index:8;font-size:clamp(2.2rem,9vh,3.6rem);background:none;border:0;padding:0;cursor:pointer;transform:scaleX(var(--f,1));opacity:0;transition:opacity .6s 2s}
[data-stage=open] .pp{opacity:1}.pp:active{transform:scaleX(var(--f,1)) scale(.85)}
.pp.fired{animation:shk .25s}@keyframes shk{50%{transform:scaleX(var(--f,1)) rotate(-12deg) scale(1.2)}}
#acts{position:absolute;left:50%;bottom:72px;transform:translateX(-50%);display:flex;gap:10px;justify-content:center;flex-wrap:wrap;width:92%;z-index:20}
#acts .btn{position:static!important;transform:none!important}
.slc{position:absolute;bottom:24%;left:var(--l);width:min(12cqw,110px);z-index:9;pointer-events:none}
.knife{position:absolute;z-index:10;font-size:clamp(2rem,8vh,3.4rem);pointer-events:none}
@media (prefers-reduced-motion:reduce){[data-stage=open] .fl2{animation:none;opacity:1}}
"""
j += r"""

/* Party v4: HAPPY BIRTHDAY banner, poppers, cake cutting, nav returns at the end */
(() => {
  const room = document.querySelector(".roomv"), T = "HAPPY BIRTHDAY", W = [...T].map((ch) => ch === " " ? .5 : 1), tot = W.reduce((a, b) => a + b, 0);
  const cols = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#8A9A3B", "#6EC6F0"]; let cum = 0, li = 0;
  $("#bunt").innerHTML = `<div class="bn"><svg viewBox="0 0 100 110" preserveAspectRatio="none"><path d="M0 2Q50 80 100 2"/></svg><div class="bnf">${[...T].map((ch, i) => {
    const u = 2 * (cum + W[i] / 2) / tot - 1; cum += W[i]; const y = ((1 - u * u) * 38 + 2).toFixed(1);
    return ch === " " ? '<span class="fl2 sp"></span>' : `<span class="fl2" style="--i:${i};--y:${y}px;--c:${cols[li++ % 6]}">${ch}</span>`; }).join("")}</div></div>`;

  const cvs = $("#fx");
  function popSfx(){ if (!AU.ctx || AU.muted) return; const c = AU.ctx, b = c.createBuffer(1, c.sampleRate * .15, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); const s = c.createBufferSource(), g = c.createGain(); g.gain.value = .5; s.buffer = b; s.connect(g); g.connect(AU.out); s.start(); }
  function popper(el, dir){
    popSfx(); el.classList.remove("fired"); void el.offsetWidth; el.classList.add("fired");
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .25, pc = ["#FF9EC4", "#F5B94A", "#3FB7A5", "#c9a0ff", "#D7263D", "#BFE3F5"];
    for (let i = 0; i < 70; i++) { const a = (-90 + dir * Math.random() * 55) * Math.PI / 180, sp = 9 + Math.random() * 10; parts.push({x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: pc[i % 6], l: 120 + Math.random() * 50, r: 3 + Math.random() * 4}); }
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
  function cutCake(){
    if (cuts >= MAXC) return;
    const cake = document.querySelector(".cakev"), cr = cake.getBoundingClientRect(), rr = room.getBoundingClientRect();
    const k = document.createElement("span"); k.className = "knife"; k.textContent = "🔪"; k.style.left = cr.left - rr.left + cr.width / 2 + "px"; k.style.top = cr.top - rr.top + "px"; room.appendChild(k);
    k.animate([{transform: "translate(-50%,-90%) rotate(-15deg)", opacity: 0}, {opacity: 1, offset: .25}, {transform: "translate(-50%,70%) rotate(-15deg)", opacity: 1}], {duration: 650, easing: "ease-in"}).onfinish = () => k.remove();
    setTimeout(() => {
      const x = 172 - cuts * 22, ln = document.createElementNS("http://www.w3.org/2000/svg", "path");
      ln.setAttribute("d", `M${x} 112V174` + (x < 154 && x > 46 ? `M${x} 64V112` : "")); ln.setAttribute("stroke", "#4A2A6B"); ln.setAttribute("stroke-width", "4"); ln.setAttribute("fill", "none"); cake.appendChild(ln);
      room.insertAdjacentHTML("beforeend", SL.replace('class="slc"', `class="slc" style="--l:${SLOT[cuts]}%"`)); const el = room.lastElementChild;
      const er = el.getBoundingClientRect(), ex = er.left + er.width / 2, ey = er.top + er.height / 2, dx = cr.left + cr.width / 2 - ex, dy = cr.top + cr.height * .6 - ey, mx = rr.left + rr.width / 2 - ex, my = rr.top + rr.height * .5 - ey;
      el.animate([{transform: `translate(${dx}px,${dy}px) scale(.2) rotate(-20deg)`, opacity: 0}, {transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .5}, {transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .65}, {transform: "none", opacity: 1}], {duration: 1700, easing: "ease-in-out"});
      sfx([[660, .08], [880, .1]]); setTimeout(() => burst(40), 800);
    }, 450);
    cuts++; $("#goon").hidden = false;
    $("#inshint").textContent = cuts >= MAXC ? "The whole cake is gone! 😋" : "Yum! Cut as many slices as you like 🍰";
    if (cuts >= MAXC) $("#cutbtn").hidden = true;
  }
  $("#cutbtn").addEventListener("click", cutCake);
  $("#goon").addEventListener("click", () => { $("#nav").hidden = false; if (!PREVIEW) store.set("navok", "1"); $("#goon").hidden = true; $("#inshint").textContent = "The party’s all yours, Shreety! Explore the tabs up top 💖"; burst(120); track("room", "party finished"); });
})();
"""
open('style.css', 'w', encoding='utf-8').write(c); open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak4")
