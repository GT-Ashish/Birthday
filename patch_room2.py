#!/usr/bin/env python3
"""Step 2: full-screen room + hbd.mp3 as the party song.
Run in the site folder (after patch_room.py):  python3 patch_room2.py
Put hbd.mp3 in the same folder as index.html."""
import shutil, sys
c = open('style.css', encoding='utf-8').read()
j = open('script.js', encoding='utf-8').read()
if '/* Full-screen room */' in c:
    sys.exit("Already patched.")
for f in ('style.css', 'script.js'):
    shutil.copy(f, f + '.bak2')
def rep(t, a, b):
    assert t.count(a) == 1, ("anchor not found once:", t.count(a), a[:70])
    return t.replace(a, b)

c = c.rstrip('\n') + r"""

/* Full-screen room */
#t-door.inroom{max-width:none;padding:0;position:relative}
#inside{display:block;position:relative;flex:1;align-self:stretch;width:100%;min-height:0}
.roomv{position:absolute;inset:0;width:auto;height:auto;border:0;border-radius:0;container-type:size}
#inshint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:20;margin:0;max-width:88%;background:#fff;border:3px solid var(--plum);border-radius:999px;padding:.35em 1.1em;font-weight:700;color:var(--plum)}
#relight{position:absolute;left:50%;bottom:72px;transform:translateX(-50%);z-index:20}
.floor{height:26%}
.tbl{left:14%;right:14%;bottom:10%;height:13%}
.snack{bottom:22%;font-size:clamp(2rem,9cqh,4.5rem)}.s1{left:15%}.s2{left:23%}
.cakev{bottom:22%;width:min(36cqw,50cqh)}
.vase{right:14%;bottom:22%;width:min(10cqw,15cqh)}
.bunt{top:50px}
.brow{margin:0 20% 6px}
.brow span{flex:0 1 min(4.2cqw,46px);height:min(6cqw,56px);font-size:min(2.2cqw,1.3rem)}
.bl{width:min(6cqw,64px);height:min(7.4cqw,78px)}
.bowbtn{width:min(30cqw,330px)}
.shade{left:-46px;width:92px;height:46px}
.glow{left:-100px;width:200px;height:200px}
.cord{left:24px;top:56px;height:calc(60px + var(--p,0px))}
#cordb{left:-12px;bottom:-20px;width:26px;height:26px}
"""

# --- JS: bigger room class, mp3 party song ---
j = rep(j, '$("#outside").hidden = true; ins.hidden = false;',
        '$("#outside").hidden = true; ins.hidden = false; $("#t-door").classList.add("inroom");')
j = rep(j, '(AU.muted || ytOn) ? null : (tab === "game" ? "game" : partyOn ? "party" : "sweet");',
        '(AU.muted || ytOn) ? null : (tab === "game" ? "game" : partyOn ? null : "sweet"); hb();')
j = j.rstrip('\n') + r"""

/* Party song: hbd.mp3 (plays after the bow is untied; pauses for mute, YouTube, game tab, hidden page) */
const hbd = new Audio("hbd.mp3"); hbd.loop = true; hbd.preload = "auto";
function hb(){
  const on = partyOn && !AU.muted && !ytOn && tab !== "game" && !document.hidden;
  if (on) { if (hbd.paused) hbd.play().catch(() => {}); } else if (!hbd.paused) hbd.pause();
}
document.addEventListener("visibilitychange", hb);
document.addEventListener("pointerdown", hb, {passive: true});   // retries if the browser blocked autoplay after a refresh
"""
open('style.css', 'w', encoding='utf-8').write(c)
open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: style.css.bak2, script.js.bak2. Don't forget hbd.mp3 next to index.html")
