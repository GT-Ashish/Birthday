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
#lt{position:fixed;inset:0;z-index:55;display:flex;align-items:center;justify-content:center;background:rgba(51,34,74,.62);opacity:0;pointer-events:none;transition:opacity .4s}
#lt.on{opacity:1;pointer-events:auto}
.ltst{position:relative;width:min(84vw,440px);aspect-ratio:3/2}
.ltst.pop{animation:lpop .8s ease-out both}
@keyframes lpop{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}
.eb{position:absolute;inset:0;z-index:1;background:#f58fb9;border:4px solid var(--plum);border-radius:10px}
.ef,.fp{position:absolute;left:0;width:100%;overflow:visible;transition:opacity .6s,transform .9s}
.ef{top:0;height:100%;z-index:3}
.ef polygon,.fp polygon{stroke:var(--plum);stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.fp{top:0;height:52.5%;z-index:4;transform-origin:50% 0;transition:transform .7s ease,z-index 0s .35s,opacity .6s}
.ltst.opened .fp{transform:perspective(800px) rotateX(180deg);z-index:1}
.seal{position:absolute;left:50%;top:52%;z-index:5;transform:translate(-50%,-50%);font-size:2rem;transition:opacity .25s}
.ltst.opened .seal{opacity:0}
.ep{position:absolute;left:50%;top:50%;z-index:2;width:88%;height:84%;transform:translate(-50%,-50%);background:#fffdf5;border:3px solid var(--plum);border-radius:8px;display:flex;flex-direction:column;overflow:hidden;transition:width 1s ease,height 1s ease,transform 1s ease}
.ltst.rise .ep{transform:translate(-50%,-50%) translateY(-55%)}
.ltst.read .ep{z-index:8;width:min(92vw,580px);height:min(82vh,740px);transform:translate(-50%,-50%)}
.ltst.read .eb,.ltst.read .ef,.ltst.read .fp,.ltst.read .seal{opacity:0;transform:translateY(40vh);pointer-events:none}
.ep>*{opacity:0;transition:opacity .5s}
.ltst.read .ep>*{opacity:1;transition-delay:.7s}
.pc{flex:1;min-height:0;overflow-y:auto;padding:22px 22px 10px;text-align:left;font-size:clamp(.95rem,2.3vh,1.1rem);line-height:1.7;color:var(--ink)}
.pc h3{font-size:1.5rem;color:var(--plum);margin:0 0 .6em}
.pc p{margin:0 0 .55em}.pc p.em{font-style:italic;color:var(--plum);font-size:1.15em;margin-top:.4em}.pc .w.i{font-style:italic}
.w{display:none}.w.on{display:inline;animation:wi .4s}
@keyframes wi{from{opacity:0}to{opacity:1}}
.pc .sg{font-family:Fredoka,sans-serif;font-size:1.2rem;color:var(--plum);text-align:right}
.pf{flex:none;padding:8px;text-align:center;border-top:3px dotted var(--blue)}
.ltx{position:absolute;right:8px;top:6px;z-index:3;background:none;border:0;font-size:1.8rem;line-height:1;cursor:pointer;color:#C2255C}
@media (prefers-reduced-motion:reduce){.ltst.pop{animation:none}.w.on{animation:none}.ep,.ef,.fp{transition:none}}
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
    '<div id="lt" role="dialog" aria-modal="true" aria-label="A letter for Shreety"><div class="ltst" id="ltst">'
    + '<div class="eb"></div>'
    + '<div class="ep"><button class="ltx" id="ltx" aria-label="Close letter">×</button><div class="pc" id="ltc"></div><div class="pf"><button class="btn sm alt" id="ltb">Skip ⏩</button></div></div>'
    + '<svg class="ef" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="2,2 150,105 2,198" fill="#ff9ec4"/><polygon points="298,2 150,105 298,198" fill="#ff9ec4"/><polygon points="2,198 150,100 298,198" fill="#ffc2dc"/></svg>'
    + '<svg class="fp" viewBox="0 0 300 105" preserveAspectRatio="none" aria-hidden="true"><polygon points="2,2 298,2 150,103" fill="#ff86b6"/></svg>'
    + '<span class="seal" aria-hidden="true">💖</span></div></div>');
  const lt = $("#lt"), st = $("#ltst"), ltc = $("#ltc"), ltb = $("#ltb");
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

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
  function finish(){ mode = "done"; ltb.textContent = "Close 💖"; burst(90); }
  function step(){
    if (ti >= words.length) { finish(); return; }
    const w = words[ti++]; reveal(w); ltc.scrollTop = ltc.scrollHeight;
    const t = w.s.textContent.trim(), lastInP = ti >= words.length || words[ti].p !== w.p;
    tm = setTimeout(step, 65 + (/[.!?]$/.test(t) ? 330 : /,$/.test(t) ? 140 : 0) + (lastInP ? 500 : 0));
  }
  function openLetter(instant){
    if (running) return; running = true; seen = true;
    timers.forEach(clearTimeout); clearTimeout(tm); timers = [];
    st.className = "ltst"; lt.classList.add("on");
    if (instant || reduce) {
      showAll(); finish(); st.classList.add("read", "opened", "rise"); ltc.scrollTop = 0; return;
    }
    words.forEach((w) => w.s.classList.remove("on")); words.forEach((w) => { w.p.style.display = "none"; });
    ti = 0; mode = "type"; ltb.textContent = "Skip ⏩"; ltc.scrollTop = 0;
    void st.offsetWidth; st.classList.add("pop"); sfx([[660, .08], [880, .1], [1175, .15]]);
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(1000, () => { st.classList.add("opened"); sfx([[500, .08], [700, .1]]); });
    at(1900, () => st.classList.add("rise"));
    at(3100, () => st.classList.add("read"));
    at(4200, step);
  }
  function closeLetter(){
    timers.forEach(clearTimeout); clearTimeout(tm); showAll();
    lt.classList.remove("on"); $("#letterbtn").hidden = false;
    setTimeout(() => { st.className = "ltst"; running = false; }, 450);
  }
  ltb.addEventListener("click", () => { if (mode === "type") { clearTimeout(tm); timers.forEach(clearTimeout); st.classList.add("opened", "rise", "read"); showAll(); finish(); } else closeLetter(); });
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
