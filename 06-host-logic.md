# 06 — Host Logic (`js/host.js` + `js/display.js`)

## What these files do

| File | Who uses it | Purpose |
|---|---|---|
| `host.js` | Host on laptop | Controls the entire game flow |
| `display.js` | TV/projector | Mirrors game state on big screen |

---

## host.js — 9 Steps

### Step 1 — Load Questions
```
Host opens host.html
Clicks 📊 Load Questions
  ↓
Fetches from Google Sheets API
Shows: "10 questions loaded (2 rounds of 5)"
  ↓
🚀 Round 1 શરૂ કરો button appears
```

### Step 2 — Start Game
```
Host clicks 🚀 Round 1 શરૂ કરો
  ↓
Firebase reset:
  status: "waiting"
  currentRound: 1
  players: cleared
  submissions: cleared
  ↓
Host sees Round 1 preview
```

### Step 3 — Round Preview (Host Only)
```
Host sees all 5 questions WITH correct answers:
  Q1. ભારતના પ્રથમ વડાપ્રધાન?   ✅ જવાહરલાલ નેહરુ
  Q2. ગુજરાતની રાજધાની?         ✅ ગાંધીનગર
  Q3. ...
```

### Step 4 — Start Round
```
Host clicks ▶ Start Round
  ↓
Firebase: status → "active", roundStartTime → now
  ↓
All players' phones show the 5 questions!
```

### Step 5 — Watch Live Submissions
```
As players submit, host sees in real-time:
  1. Devesh    8.43s   5/5 ✅
  2. Rohan    11.20s   4/5
  3. Priya    13.55s   3/5
```

### Step 6 — Reveal Answers
```
Host clicks ✅ Reveal Answers
  ↓
Firebase: status → "reveal"
  ↓
Players see green ✅ / red ❌ on their phones
TV shows correct answers + winner name
```

### Step 7 — Next Round
```
Host clicks → Next Round
  ↓
Leaderboard shown to players for 4 seconds
  ↓
Firebase: status → "waiting"
  ↓
Host sees Round 2 preview
Repeat Steps 4-6
```

### Step 8 — Game Over (after last round)
```
Host clicks 🏁 Game Over
  ↓
All rounds' scores combined
Final leaderboard shown:
  🥇 Devesh   9/10   19.43s total
  🥈 Rohan    8/10   24.61s total
  🥉 Priya    7/10   31.22s total
```

### Step 9 — New Game
```
Host clicks 🔄 New Game
  ↓
Firebase wiped clean
Back to Round 1
```

---

## display.js — TV Screen

The TV screen automatically mirrors what's happening:

| Game status | TV shows |
|---|---|
| `waiting` | Waiting screen + joined players list |
| `active` | All 5 questions + live countdown timer |
| `reveal` | Correct answers + 🏆 Winner name |
| `leaderboard` | Full ranked scores |

Timer turns **red** when under 10 seconds! ⏱

---

## Full Game Flow (All 3 Screens Together)

```
HOST (laptop)           PLAYERS (phones)        TV (display.html)
────────────────        ────────────────        ─────────────────
Load questions          Enter name → Join       "Waiting..."
                        Waiting room            Shows joined players
▶ Start Round     →     5 questions appear  →   5 questions + timer
                        Tap A/B/C/D
                        🚀 SUBMIT
Watch submissions ←     "Submitted! 8.43s"      Submission count
✅ Reveal         →     Green/Red answers   →   Correct answers
                                                🏆 Winner!
→ Next Round      →     Leaderboard 4s      →   Leaderboard
                        Waiting room            "Waiting..."
```

---

## ✅ Checklist

- [x] `js/host.js` written and saved
- [x] `js/display.js` written and saved
- [x] `display.html` updated to include `display.js`
- [ ] Push all files to GitHub

```bash
git add .
git commit -m "add host.js and display.js - app complete!"
git push
```

---

## What's Next?

➡️ **Test the app!**

Open 3 tabs:
1. `host.html` — your laptop (Host)
2. `index.html` — your phone (Player)
3. `display.html` — full screen on TV

Or use the live GitHub Pages link:
```
https://devesh1304.github.io/fastest-fingerfirst/
https://devesh1304.github.io/fastest-fingerfirst/host.html
https://devesh1304.github.io/fastest-fingerfirst/display.html
```
