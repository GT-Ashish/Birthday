#!/usr/bin/env python3
"""Step 6: envelope pops up after the cake is fully cut, opens, and the letter types out word by word.
Also removes the "Light the candles again" button (refresh replays everything).
Run in the site folder after patch_room.py ... patch_room5.py:  python3 patch_room6.py"""
import shutil, sys
c = open('style.css', encoding='utf-8').read(); j = open('script.js', encoding='utf-8').read()
if '/* Letter v6 */' in c: sys.exit("Already patched.")
if '/* Party v4 */' not in c: sys.exit("Run the earlier patches first.")
for f in ('style.css', 'script.js'): shutil.copy(f, f + '.bak6')

c += r"""
/* Letter v6 */
#relight{display:none!important}
#lt{position:fixed;inset:0;z-index:55;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%, rgba(55,25,75,.84) 0%, rgba(18,8,28,.95) 100%);backdrop-filter:blur(14px) saturate(130%);-webkit-backdrop-filter:blur(14px);opacity:0;pointer-events:none;transition:opacity .5s ease}
#lt.on{opacity:1;pointer-events:auto}
.lt-photos{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}
.polaroid{position:absolute;will-change:transform,opacity;padding:7px 7px 22px 7px;background:#ffffff;border-radius:6px;box-shadow:0 14px 35px rgba(0,0,0,.45),0 0 20px rgba(255,182,193,.35);filter:drop-shadow(0 4px 8px rgba(0,0,0,.3));transform-origin:center center;opacity:0;animation:polFloat 5s cubic-bezier(.25,1,.5,1) forwards;pointer-events:none}
.polaroid img{display:block;width:clamp(115px,17vw,175px);height:clamp(135px,21vw,210px);object-fit:cover;border-radius:3px;background:#f3e8ee}
.polaroid::after{content:"♥";position:absolute;bottom:4px;right:8px;font-size:12px;color:#e8307a;opacity:.7}
@keyframes polFloat{
  0%{opacity:0;transform:translate(var(--tx,0),calc(var(--ty,0) + 40px)) scale(.75) rotate(var(--r,0deg))}
  15%{opacity:var(--max-op,.85);transform:translate(var(--tx,0),var(--ty,0)) scale(1.03) rotate(var(--r,0deg))}
  80%{opacity:var(--max-op,.85);transform:translate(calc(var(--tx,0) + var(--drift-x,0px)),calc(var(--ty,0) - 25px)) scale(1) rotate(calc(var(--r,0deg) + var(--dr,2deg)))}
  100%{opacity:0;transform:translate(calc(var(--tx,0) + var(--drift-x,0px)),calc(var(--ty,0) - 50px)) scale(.9) rotate(calc(var(--r,0deg) + var(--dr,4deg)))}
}
.ltst{position:relative;width:min(86vw,440px);aspect-ratio:3/2;z-index:4;filter:drop-shadow(0 25px 50px rgba(15,5,25,.65))}
.ltst.pop{animation:lpop .85s cubic-bezier(.34,1.56,.64,1) both}
@keyframes lpop{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.1) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}
.eb{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg, #ff94ba 0%, #f06292 60%, #e91e63 100%);border:3px solid #8e2a59;border-radius:14px;box-shadow:inset 0 1px 3px rgba(255,255,255,.5), 0 15px 35px rgba(0,0,0,.3)}
.ef,.fp{position:absolute;left:0;width:100%;overflow:visible;transition:opacity .6s,transform .9s}
.ef{top:0;height:100%;z-index:3}
.ef polygon,.fp polygon{stroke:#8e2a59;stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.fp{top:0;height:52.5%;z-index:4;transform-origin:50% 0;transition:transform .7s ease,z-index 0s .35s,opacity .6s}
.ltst.opened .fp{transform:perspective(800px) rotateX(180deg);z-index:1}
.seal{position:absolute;left:50%;top:52%;z-index:5;transform:translate(-50%,-50%);font-size:2.4rem;filter:drop-shadow(0 4px 12px rgba(232,48,122,.65));transition:opacity .3s, transform .3s;animation:sealPulse 2.4s ease-in-out infinite}
@keyframes sealPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.12)}}
.ltst.opened .seal{opacity:0}
.ep{position:absolute;left:50%;top:50%;z-index:2;width:88%;height:84%;transform:translate(-50%,-50%);background:linear-gradient(180deg, #fffdf8 0%, #fff8f0 100%);border:2px solid #e8307a;border-radius:12px;box-shadow:0 12px 35px rgba(0,0,0,.25), 0 0 0 4px rgba(255,182,193,.3);display:flex;flex-direction:column;overflow:hidden;transition:width 1s cubic-bezier(.25,1,.5,1),height 1s cubic-bezier(.25,1,.5,1),transform 1s cubic-bezier(.25,1,.5,1),border-radius .6s ease}
.ltst.rise .ep{transform:translate(-50%,-50%) translateY(-55%)}
.ltst.read .ep{z-index:8;width:min(92vw,560px);height:min(82vh,720px);transform:translate(-50%,-50%);border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,.45), 0 0 0 5px rgba(255,182,193,.4), 0 0 40px rgba(232,48,122,.25)}
.ltst.read .eb,.ltst.read .ef,.ltst.read .fp,.ltst.read .seal{opacity:0;transform:translateY(40vh);pointer-events:none}
.ep>*{opacity:0;transition:opacity .5s}
.ltst.read .ep>*{opacity:1;transition-delay:.7s}
.pc{flex:1;min-height:0;overflow-y:auto;padding:28px 24px 14px;text-align:center;font-size:clamp(1.02rem,2.3vh,1.18rem);line-height:1.75;color:#3b1e42;scrollbar-width:thin;scrollbar-color:#ff9ec4 transparent}
.pc::-webkit-scrollbar{width:6px}
.pc::-webkit-scrollbar-thumb{background:#ff9ec4;border-radius:10px}
.pc h3{font-family:Fredoka,sans-serif;font-size:1.65rem;color:#8e2a59;margin:0 0 .8em;letter-spacing:.5px;text-shadow:0 1px 2px rgba(232,48,122,.15);position:relative;display:inline-block}
.pc h3::after{content:"";display:block;width:55px;height:3px;background:linear-gradient(90deg,transparent,#e8307a,transparent);margin:6px auto 0;border-radius:2px}
.pc p{margin:0 0 .55em;font-family:'Quicksand',sans-serif;font-weight:600}
.pc p.em{font-family:'Fredoka',sans-serif;font-size:clamp(1.25rem,2.8vh,1.45rem);color:#d81b60;font-style:normal;font-weight:700;margin-top:.8em;margin-bottom:.5em;text-shadow:0 0 20px rgba(255,158,196,.5)}
.w{display:none}
.w.on{display:inline-block;animation:wi .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes wi{from{opacity:0;transform:translateY(5px) scale(.92);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
.pc .sg{font-family:Fredoka,sans-serif;font-size:1.2rem;color:var(--plum);text-align:right}
.pf{flex:none;padding:12px;text-align:center;border-top:2px dashed rgba(232,48,122,.25);background:rgba(255,255,255,.6)}
.ltx{position:absolute;right:12px;top:10px;z-index:10;width:32px;height:32px;border-radius:50%;background:rgba(232,48,122,.12);border:0;font-size:1.4rem;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#C2255C;transition:transform .2s,background .2s}
.ltx:hover{transform:scale(1.15);background:rgba(232,48,122,.25)}
@media (prefers-reduced-motion:reduce){.ltst.pop,.polaroid{animation:none}.w.on{animation:none}.ep,.ef,.fp{transition:none}}
"""

j += r"""

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

  function spawnPhoto(){
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

  function startPhotos(){
    stopPhotos();
    spawnPhoto();
    photoTimer = setInterval(spawnPhoto, 1700);
  }

  function stopPhotos(){
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
      s.className = "w" + (m ? " i" : ""); s.textContent = (m ? m[1] + m[2] : w) + " ";
      p.appendChild(s); words.push({s, p});
    });
    ltc.appendChild(p);
  });
  if (SIGN) { const sg = document.createElement("p"); sg.className = "sg"; sg.textContent = SIGN; ltc.appendChild(sg); }

  let seen = false, running = false, ti = 0, tm = 0, timers = [], mode = "type";
  const reveal = (w) => { w.p.style.display = ""; w.s.classList.add("on"); };
  const showAll = () => { words.forEach(reveal); ti = words.length; };
  function finish(){
    mode = "done";
    ltb.style.display = "";
    ltb.textContent = "Close 💖";
    burst(90);
  }
  function step(){
    if (ti >= words.length) { finish(); return; }
    const w = words[ti++]; reveal(w); ltc.scrollTop = ltc.scrollHeight;
    const t = w.s.textContent.trim(), lastInP = ti >= words.length || words[ti].p !== w.p;
    const isPunct = /[.!?…]$/.test(t) || /\.\.\.$/.test(t);
    const isComma = /[,;:]$/.test(t);
    tm = setTimeout(step, 210 + (isPunct ? 650 : isComma ? 300 : 0) + (lastInP ? 950 : 0));
  }
  function openLetter(instant){
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
  function closeLetter(){
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
"""
open('style.css', 'w', encoding='utf-8').write(c); open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak6")
