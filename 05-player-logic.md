# 05 — Player Logic (`js/player.js`)

## What this file does

`player.js` controls everything on the **player's phone screen**.

---

## 8 Steps inside player.js

### Step 1 — Name Entry
```
Player types name → taps Join
  ↓
Name saved in localStorage (survives refresh)
  ↓
Questions loaded from Google Sheets
  ↓
Connect to Firebase
```

### Step 2 — Register + Listen
```
Player added to Firebase: /game/players/myUID
  ↓
App listens for status changes in Firebase:
  "waiting"     → waiting room
  "active"      → show 5 questions ← HOST triggers this
  "reveal"      → show correct/wrong
  "leaderboard" → show scores
```

### Step 3 — Round Starts
```
Host presses ▶ Start Round
  ↓
Firebase status → "active"
  ↓
5 questions filled into cards
  ↓
Player sees question screen
```

### Step 4 — Player Taps Options
```
Tap A / B / C / D for each question
  ↓
Tapped button → gold highlight
Question card → gold border (answered)
Counter → "3 / 5 answered"
  ↓
After all 5 answered → SUBMIT button enables
```

### Step 5 — Player Taps SUBMIT
```
Records exact timestamp
  ↓
timeTaken = submitTime - roundStartTime
score     = count of correct answers (0-5)
  ↓
Saved to Firebase:
  /game/submissions/round_1/myUID → { answers, timeTaken, score }
  ↓
Shows "🚀 Submit થઈ ગયું!" screen
```

### Step 6 — Reveal Answers
```
Host presses ✅ Reveal
  ↓
Firebase status → "reveal"
  ↓
Each option button:
  Correct answer → green 🟢
  Player's wrong pick → red 🔴
  Other options → unchanged
```

### Step 7 — Leaderboard
```
Firebase status → "leaderboard"
  ↓
Reads all submissions from Firebase
  ↓
Sorted by: most correct → fastest time
  ↓
Shows ranked list with score + time
```

### Step 8 — Reset for Next Round
```
Firebase status → "waiting"
  ↓
All answers cleared
  ↓
Back to waiting room
  ↓
Ready for next round
```

---

## What Gets Saved in Firebase per Player

```javascript
/game/submissions/round_1/p_abc123 = {
  name      : "Devesh",
  answers   : [1, 0, 2, 1, 2],  // player's choices
  submitTime: 1716634529864,     // exact ms timestamp
  timeTaken : 8432,              // ms after round started
  score     : 4                  // correct answers
}
```

---

## ✅ Checklist

- [x] `js/player.js` already written and saved
- [ ] Push to GitHub

```bash
git add .
git commit -m "add player.js"
git push
```

---

## What's Next?

➡️ **`06-host-logic.md`** — Write `js/host.js`:
- Load questions from Sheets
- Start rounds
- Watch live submissions
- Reveal answers + show leaderboard
