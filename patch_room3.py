#!/usr/bin/env python3
"""Step 3: more balloons (your photos), long curly ribbons, gifts, sparkles.
Run in the site folder AFTER patch_room.py (+ patch_room2.py). Needs the balloons/ folder next to index.html."""
import shutil, sys
c = open('style.css', encoding='utf-8').read(); j = open('script.js', encoding='utf-8').read()
if '/* Party decor */' in c: sys.exit("Already patched.")
if '.roomv' not in c: sys.exit("Run patch_room.py first.")
for f in ('style.css', 'script.js'): shutil.copy(f, f + '.bak3')
c += r"""
/* Party decor */
.bl{display:none!important}
.wall{background:radial-gradient(#fff 3px,transparent 4px) 0 0/30px 30px,linear-gradient(#FFE3F0,#BFE3F5 55%,#d6f5ee)}
.bi{position:absolute;left:var(--l);top:var(--t);z-index:3;height:calc(var(--s)*.6vh);height:min(calc(var(--s)*1cqh),calc(var(--s)*1.1cqw));width:auto;opacity:0;cursor:pointer;-webkit-user-drag:none;user-select:none;filter:drop-shadow(0 4px 3px rgba(74,42,107,.25))}
[data-stage=open] .bi{animation:rise 2.4s var(--dl) ease-out both,bob 3s calc(2.4s + var(--dl)) ease-in-out infinite alternate}
.bi.pop{animation:popb .3s forwards!important}
@keyframes popb{to{transform:scale(1.5);opacity:0}}
.rib{position:absolute;top:8px;z-index:5;opacity:0;height:calc(var(--s)*.6vh);height:min(calc(var(--s)*1cqh),calc(var(--s)*1.3cqw));width:auto;transform-origin:50% 0;pointer-events:none;overflow:visible}
.rib path{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}
[data-stage=open] .rib{animation:ribin 1.1s var(--d) ease-out both,sway 3.2s calc(1.1s + var(--d)) ease-in-out infinite alternate}
@keyframes ribin{from{opacity:0;transform:scaleY(.05)}to{opacity:1;transform:none}}
@keyframes sway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
.gift{position:absolute;bottom:var(--b);left:var(--l);z-index:2;font-size:min(9cqh,3rem);font-size:clamp(1.6rem,8vh,3rem);opacity:0;transition:opacity 1s 1.5s}
[data-stage=open] .gift{opacity:1}
.spk{position:absolute;z-index:3;left:var(--l);top:var(--t);opacity:0;font-size:1.1rem}
[data-stage=open] .spk{animation:twk 1.2s var(--d) ease-in-out infinite alternate}
@media (prefers-reduced-motion:reduce){[data-stage=open] .bi,[data-stage=open] .rib,[data-stage=open] .spk{animation:none;opacity:1}}
"""
j += r"""

/* Party decor: photo balloons, long curly ribbons, gifts, sparkles */
(() => {
  const room = document.querySelector(".roomv");
  const B = [["bnA",14,16,30],["hk2",2,8,28],["b3",1,38,26],["b7",24,40,24],["hk3",9,48,22],["b1",25,8,20],
             ["kf",75,12,38],["k1",89,40,26],["b5",67,42,22],["hk4",60,6,20],["hk5",90,8,22],["b2",82,50,20]];
  $("#balloons").innerHTML = B.map((b, i) => `<img class="bi" src="balloons/${b[0]}.png" alt="" style="--l:${b[1]}%;--t:${b[2]}%;--s:${b[3]};--dl:${(i * .18).toFixed(2)}s">`).join("");
  $("#balloons").addEventListener("click", (e) => { const b = e.target.closest(".bi"); if (!b || b.classList.contains("pop")) return; b.classList.add("pop"); sfx([[1500, .04], [900, .06]]); burst(25); setTimeout(() => b.remove(), 320); });
  const RC = ["#FF9EC4","#F5B94A","#3FB7A5","#c9a0ff","#D7263D","#BFE3F5","#FF9EC4","#F5B94A"];
  const curl = (amp, w) => { let d = ""; for (let i = 0; i <= 90; i++) { const t = i / 90, p = t * w; d += (i ? "L" : "M") + (20 + amp * Math.sqrt(t) * Math.sin(p)).toFixed(1) + " " + (190 * t + amp * .7 * Math.cos(p) - amp * .7).toFixed(1); } return d; };
  const X = [2,8,14,20,78,84,90,97], S = [55,42,60,38,40,58,44,52];
  room.insertAdjacentHTML("beforeend", X.map((x, i) => `<svg class="rib" viewBox="0 0 40 200" style="left:${x}%;--s:${S[i]};--d:${(i * .13).toFixed(2)}s"><path d="${curl(11 + i % 3 * 2, 34 + i % 4 * 4)}" stroke="${RC[i]}"/></svg>`).join(""));
  const G = [["🎁",3,"13%"],["🎀",9,"12%"],["🎁",84,"13%"],["🎁",91,"12%"]];
  room.insertAdjacentHTML("beforeend", G.map((g) => `<span class="gift" style="--l:${g[1]}%;--b:${g[2]}">${g[0]}</span>`).join(""));
  let sp = ""; for (let i = 0; i < 12; i++) sp += `<span class="spk" style="--l:${6 + i * 8 + (i % 3) * 2}%;--t:${8 + (i * 37) % 55}%;--d:${(i * .23).toFixed(2)}s">✨</span>`;
  room.insertAdjacentHTML("beforeend", sp);
})();
"""
open('style.css', 'w', encoding='utf-8').write(c); open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak3. Keep the balloons/ folder next to index.html.")
