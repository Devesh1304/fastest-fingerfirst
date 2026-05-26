# 04 — Game Logic (`js/game.js`)

## What this file does
`game.js` is the **shared brain** of the app.
Both `player.js` and `host.js` use the functions defined here.

---

## What's Already Written

`js/game.js` is already complete! Here is what each function does:

---

### 1. Firebase Initialization
```javascript
firebase.initializeApp(firebaseConfig);
const db      = firebase.database();
const gameRef = db.ref('game');
```
- Connects to your Firebase project
- `gameRef` points to `/game` in the database — all game state lives here

---

### 2. Player Identity
```javascript
let myUID  = localStorage.getItem('fff_uid')  || _generateUID();
let myName = localStorage.getItem('fff_name') || '';
```
- Each player gets a unique ID saved in their browser (`localStorage`)
- If they refresh the page, they keep the same ID — no duplicate entries

---

### 3. `loadQuestions()`
```javascript
await loadQuestions()
```
- Fetches all questions from your Google Sheets API URL
- Sets `allQuestions` array and calculates `totalRounds`
- Returns `true` if successful, `false` if failed

---

### 4. `getRoundQuestions(roundNum)`
```javascript
getRoundQuestions(1)  // returns questions 1-5
getRoundQuestions(2)  // returns questions 6-10
```
- Takes a round number (1, 2, 3...)
- Returns exactly 5 questions for that round

---

### 5. `showScreen(screenId)`
```javascript
showScreen('screen-waiting')
showScreen('screen-questions')
showScreen('screen-result')
```
- Hides all screens, shows only the one you want
- Used by both player.js and host.js to switch between screens

---

### 6. `formatTime(ms)`
```javascript
formatTime(8432)  // returns "8.43s"
```
- Converts milliseconds to a readable time string
- Used on leaderboard to show how fast each player submitted

---

### 7. `calcScore(answers, questions)`
```javascript
calcScore([1, 0, 2, 1, 3], roundQuestions)  // returns 0-5
```
- Compares player's answers array with correct answers
- Returns number of correct answers (0 to 5)

---

### 8. `buildLeaderboard(submissions)`
```javascript
buildLeaderboard(submissionsFromFirebase)
```
- Takes all submissions from Firebase
- Sorts by: **most correct first**, then **fastest time**
- Returns sorted array ready to display

---

### 9. `renderLeaderboard(containerId, rows)`
```javascript
renderLeaderboard('leaderboard-list', sortedRows)
```
- Builds HTML leaderboard rows inside a container div
- Shows: rank, name, score (x/5), time taken

---

## Firebase Database Structure

This is what gets saved in Firebase during a game:

```
/game/
  ├── status         "waiting" → "active" → "reveal" → "leaderboard"
  ├── currentRound   1
  ├── totalRounds    2
  ├── roundStartTime 1716634521432   ← timestamp when host pressed Start
  │
  ├── players/
  │   ├── p_abc123 → { name: "Devesh", score: 0 }
  │   └── p_xyz456 → { name: "Rohan",  score: 0 }
  │
  └── submissions/
      └── round_1/
          ├── p_abc123 → {
          │     name:      "Devesh",
          │     answers:   [1, 1, 0, 2, 2],
          │     submitTime: 1716634529864,
          │     timeTaken:  8432,          ← ms after round started
          │     score:      5
          │   }
          └── p_xyz456 → { ... }
```

---

## Game Status Flow

```
"waiting"     → players join, host loads questions
     ↓
"active"      → questions shown to all players, timer running
     ↓
"reveal"      → correct answers shown, winner announced
     ↓
"leaderboard" → full scores shown
     ↓
"waiting"     → next round begins (back to top)
```

All screens listen to `gameRef` for status changes and switch automatically.

---

## ✅ Checklist

- [x] `js/game.js` already written and saved
- [ ] Verify `databaseURL` in `js/config.js` matches Firebase Console
- [ ] Push to GitHub

```bash
git add .
git commit -m "add game.js core logic"
git push
```

---

## What's Next?

➡️ **`05-player-logic.md`** — Write `js/player.js`:
- Name entry and joining the game
- Listening to Firebase for round start
- Showing 5 questions and handling option taps
- Submit button logic
