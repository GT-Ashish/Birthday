#!/usr/bin/env python3
"""Step 7:
 1. Fix the broken Music Corner (queue row used class "cur", which clashed with the curtain's .cur).
 2. Lamp cord -> lights -> bow -> curtains replays on EVERY visit (no saved stage, nav hidden each time).
 3. Door homepage is back: after midnight the door waits, and she TAPS it to walk into the party room.
Run in the site folder (after patch_room.py ... patch_room6.py):  python3 patch_room7.py"""
import shutil, sys

c = open('style.css', encoding='utf-8').read()
j = open('script.js', encoding='utf-8').read()
if '/* Door v7 */' in c:
    sys.exit("Already patched.")
for f in ('style.css', 'script.js'):
    shutil.copy(f, f + '.bak7')

def rep(t, a, b):
    assert t.count(a) == 1, ("anchor not found exactly once:", t.count(a), a[:70])
    return t.replace(a, b)

# ---------- 1. Music queue class clash ----------
j = rep(j, '<li class="${i === cur ? "cur" : ""}">', '<li class="${i === cur ? "now" : ""}">')
j = rep(j, 'const c = $("#q .cur");', 'const c = $("#q .now");')
c = rep(c, '.queue li.cur button', '.queue li.now button')

# ---------- 2. Replay the room sequence every visit ----------
j = rep(j, 'stage = s; ins.dataset.stage = s; if (!PREVIEW) store.set("rstage", s);',
           'stage = s; ins.dataset.stage = s;')
j = rep(j, 'const saved = PREVIEW ? null : store.get("rstage");', 'const saved = null;')
j = rep(j, 'if (PREVIEW || !store.get("navok")) $("#nav").hidden = true;', '$("#nav").hidden = true;')

# ---------- 3. Door: wait for a tap ----------
j = rep(j, 'let opened = false;', 'let opened = false, ready = false;')
j = rep(j, '"The door is open. Happy Birthday, Shreety!"', '"The door is open. Tap it to go in! 🚪"')
j = rep(j,
    'if (!opened) { opened = true; document.querySelector(".scene").classList.add("opened"); $("#door").classList.add("open"); setTimeout(enterRoom, 2600); setTimeout(() => burst(200), 900); for (let i = 0; i < 24; i++) setTimeout(spawnDeco, 400 + i * 90); }',
    'if (!ready) { ready = true; const dr = $("#door"); dr.classList.add("ready"); dr.setAttribute("role", "button"); dr.tabIndex = 0; dr.setAttribute("aria-label", "Open the door"); dr.querySelector(".sign").innerHTML = "Tap to come in!<small>Happy Birthday 🎂</small>"; burst(80); }')

j = j.rstrip('\n') + r'''

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
'''

c = c.rstrip('\n') + '''

/* Door v7 */
.door.ready{cursor:pointer;animation:dwig 1.4s ease-in-out infinite}
.door.ready .sign{animation:tw 1.1s ease-in-out infinite alternate}
@keyframes dwig{0%,100%{transform:none}50%{transform:rotateY(-7deg)}}
@media (prefers-reduced-motion:reduce){.door.ready,.door.ready .sign{animation:none}}
'''

open('style.css', 'w', encoding='utf-8').write(c)
open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak7")
