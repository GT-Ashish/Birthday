#!/usr/bin/env python3
"""Step 8: an "Exit" button inside the party room. It walks her back out to the door screen
(door closes, "Tap to come in!"), and she can tap the door to go back in.
Re-entering resumes the room where she left it (same stage, cake, balloons, nav).
Run in the site folder after patch_room7.py:  python3 patch_room8.py"""
import shutil, sys

c = open('style.css', encoding='utf-8').read()
j = open('script.js', encoding='utf-8').read()
if '/* Exit v8 */' in c:
    sys.exit("Already patched.")
if '/* Door v7 */' not in c:
    sys.exit("Run patch_room7.py first.")
for f in ('style.css', 'script.js'):
    shutil.copy(f, f + '.bak8')

def rep(t, a, b):
    assert t.count(a) == 1, ("anchor not found exactly once:", t.count(a), a[:70])
    return t.replace(a, b)

# Re-entering: keep the nav as it was and resume at the current stage (first entry still starts dark)
j = rep(j, 'ins.hidden = false; $("#nav").hidden = true;', 'ins.hidden = false; if (!stage) $("#nav").hidden = true;')
j = rep(j, 'const saved = null;', 'const saved = stage;')

j = j.rstrip('\n') + r'''

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
'''

c = c.rstrip('\n') + '''

/* Exit v8 */
#exitbtn{position:absolute;left:12px;top:22px;z-index:20}
'''

open('style.css', 'w', encoding='utf-8').write(c)
open('script.js', 'w', encoding='utf-8').write(j)
print("Done. Backups: *.bak8")
