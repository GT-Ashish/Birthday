#!/usr/bin/env python3
"""Step 5: nicer party poppers (higher up), cake really disappears where it is cut,
gifts pop a middle finger when tapped, overlap fixes (slices/poppers/buttons/gifts/ribbons).
Run in the site folder after patch_room.py/2/3/4:  python3 patch_room5.py"""
import shutil, sys
c = open('style.css', encoding='utf-8').read(); j = open('script.js', encoding='utf-8').read()
if '/* Party v5 */' in c: sys.exit("Already patched.")
if '/* Party v4 */' not in c: sys.exit("Run patch_room4.py first.")
for f in ('style.css', 'script.js'): shutil.copy(f, f + '.bak5')

c += r"""
/* Party v5 */
.roomv{--tb:max(17%,120px)}
@media (max-width:600px){.roomv{--tb:max(17%,165px)}}
.floor{height:calc(var(--tb) + 15%)}
.tbl{bottom:var(--tb);height:10%}
.snack,.cakev,.vase{bottom:calc(var(--tb) + 9.5%)}
#acts{bottom:62px;gap:6px}
#inshint{bottom:12px}
/* poppers: higher, drawn instead of emoji */
.pp{bottom:calc(var(--tb) + 16%);width:clamp(2.8rem,10vh,4.6rem);font-size:0}
.pp svg{width:100%;height:auto;display:block;filter:drop-shadow(0 3px 0 rgba(74,42,107,.3))}
@container (max-width:520px){.pp.in{display:none}}
/* cake slices sit on the table front, clear of snacks/vase/poppers */
.slc{bottom:calc(var(--tb) + 2%);width:min(8cqw,90px)}
/* gifts: tappable, sit under the table level, not on it */
.gift{bottom:calc(var(--tb) + 1%);cursor:pointer;z-index:9;user-select:none}
.gift:active{transform:scale(.88)}
.fng{position:absolute;z-index:30;font-size:clamp(2rem,9vh,3.4rem);pointer-events:none;transform:translate(-50%,-50%)}
"""

j += r"""

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
  function giftPop(g){
    const r = g.getBoundingClientRect(), rr = room.getBoundingClientRect();
    const f = document.createElement("span"); f.className = "fng"; f.textContent = "🖕";
    f.style.left = r.left - rr.left + r.width / 2 + "px"; f.style.top = r.top - rr.top + "px"; room.appendChild(f);
    f.animate([{transform: "translate(-50%,-30%) scale(.2) rotate(-20deg)", opacity: 0},
               {transform: "translate(-50%,-160%) scale(1.5) rotate(8deg)", opacity: 1, offset: .35},
               {transform: "translate(-50%,-200%) scale(1.5) rotate(-6deg)", opacity: 1, offset: .75},
               {transform: "translate(-50%,-260%) scale(1.2)", opacity: 0}], {duration: 1500, easing: "ease-out"}).onfinish = () => f.remove();
    g.animate([{transform: "rotate(0)"}, {transform: "rotate(-14deg) scale(1.2)"}, {transform: "rotate(10deg) scale(1.1)"}, {transform: "none"}], {duration: 350});
    sfx([[330, .07], [220, .12]]); track("gift", "tapped");
  }
  room.addEventListener("click", (e) => { const g = e.target.closest(".gift"); if (g) giftPop(g); });
  room.addEventListener("keydown", (e) => { const g = e.target.closest && e.target.closest(".gift"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); giftPop(g); } });

  /* 4. Cake that really disappears where it is cut */
  const cake = room.querySelector(".cakev");
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const mask = mk("mask", {id: "cakemask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 200, height: 190});
  mask.appendChild(mk("rect", {x: 0, y: 0, width: 200, height: 190, fill: "#fff"}));
  const defs = mk("defs", {}); defs.appendChild(mask); cake.insertBefore(defs, cake.firstChild);
  const grp = mk("g", {mask: "url(#cakemask)"});
  [...cake.children].filter((n) => /^(rect|path)$/i.test(n.tagName)).forEach((n) => grp.appendChild(n));
  cake.insertBefore(grp, cake.querySelector(".cdl"));
  const cdls = cake.querySelectorAll(".cdl");

  /* swap in a fresh button so the old cutting code no longer runs */
  const oldBtn = $("#cutbtn"), nb = oldBtn.cloneNode(true); oldBtn.replaceWith(nb);
  let cuts = 0, L = 18, R = 182; const MAXC = 6, STEP = 164 / MAXC, SLOT = [18, 29, 40, 51, 62, 73];
  const SL = '<svg class="slc" viewBox="0 0 100 90"><ellipse cx="50" cy="80" rx="46" ry="9" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="54" width="60" height="22" rx="4" fill="#FF9EC4" stroke="#4A2A6B" stroke-width="3"/><rect x="20" y="34" width="60" height="22" rx="4" fill="#F5B94A" stroke="#4A2A6B" stroke-width="3"/><path d="M20 38q7 10 14 0t13 0t13 0t14 0v-8H20z" fill="#fff" stroke="#4A2A6B" stroke-width="3"/><circle cx="50" cy="24" r="7" fill="#D7263D" stroke="#4A2A6B" stroke-width="3"/></svg>';
  function cutCake(){
    if (cuts >= MAXC) return;
    const cr = cake.getBoundingClientRect(), rr = room.getBoundingClientRect(), fromRight = cuts % 2 === 0;
    const sx = cr.left + cr.width * ((fromRight ? R - STEP / 2 : L + STEP / 2) / 200);
    const k = document.createElement("span"); k.className = "knife"; k.textContent = "🔪";
    k.style.left = sx - rr.left + "px"; k.style.top = cr.top - rr.top + cr.height * .3 + "px"; room.appendChild(k);
    k.animate([{transform: "translate(-50%,-90%) rotate(-15deg)", opacity: 0}, {opacity: 1, offset: .25}, {transform: "translate(-50%,70%) rotate(-15deg)", opacity: 1}], {duration: 650, easing: "ease-in"}).onfinish = () => k.remove();
    const myCut = cuts; cuts++;
    setTimeout(() => {
      /* remove that part of the cake */
      if (fromRight) { const x1 = R - STEP; mask.appendChild(mk("rect", {x: x1, y: 0, width: 260, height: 190, fill: "#000"})); R = x1; }
      else { const x2 = L + STEP; mask.appendChild(mk("rect", {x: -60, y: 0, width: x2 + 60, height: 190, fill: "#000"})); L = x2; }
      if (L > 68) cdls[0].style.display = "none";
      if (R < 130) cdls[1].style.display = "none";
      /* the slice flies to the middle, then onto the table */
      room.insertAdjacentHTML("beforeend", SL.replace('class="slc"', `class="slc" style="--l:${SLOT[myCut]}%"`)); const el = room.lastElementChild;
      const er = el.getBoundingClientRect(), ex = er.left + er.width / 2, ey = er.top + er.height / 2, dx = sx - ex, dy = cr.top + cr.height * .6 - ey, mx = rr.left + rr.width / 2 - ex, my = rr.top + rr.height * .45 - ey;
      el.animate([{transform: `translate(${dx}px,${dy}px) scale(.2) rotate(-20deg)`, opacity: 0}, {transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .5}, {transform: `translate(${mx}px,${my}px) scale(2.6) rotate(6deg)`, opacity: 1, offset: .65}, {transform: "none", opacity: 1}], {duration: 1700, easing: "ease-in-out"});
      sfx([[660, .08], [880, .1]]); setTimeout(() => burst(40), 800);
    }, 450);
    $("#goon").hidden = false;
    $("#inshint").textContent = cuts >= MAXC ? "The whole cake is gone! 😋" : "Yum! Cut as many slices as you like 🍰";
    if (cuts >= MAXC) nb.hidden = true;
  }
  nb.addEventListener("click", cutCake);
})();
"""
open('style.css', 'w', encoding='utf-8').write(c); open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak5")
