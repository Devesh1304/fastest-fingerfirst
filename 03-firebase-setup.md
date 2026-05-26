# 03 — Firebase Setup

## What we will do in this step
- Create a Firebase project
- Enable Realtime Database
- Set database rules
- Copy Firebase config into `js/config.js`
- Add Firebase SDK to all 3 HTML files

---

## Step 1 — Create Firebase Project

1. Go to 👉 [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Project name: `kbc-fastest-fingerfirst`
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**
6. Wait for it to finish → Click **"Continue"**

---

## Step 2 — Add a Web App

1. On the project homepage, click the **`</>`** (Web) icon
2. App nickname: `KBC FFF`
3. ❌ Do NOT check "Firebase Hosting" (we use GitHub Pages)
4. Click **"Register app"**
5. You will see a config object like this — **copy it!**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "kbc-fastest-fingerfirst.firebaseapp.com",
  databaseURL: "https://kbc-fastest-fingerfirst-default-rtdb.firebaseio.com",
  projectId: "kbc-fastest-fingerfirst",
  storageBucket: "kbc-fastest-fingerfirst.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:XXXXXXXXXXXXXXXXXX"
};
```

6. Click **"Continue to console"**

---

## Step 3 — Enable Realtime Database

1. In left sidebar → click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location: **United States** (default is fine)
4. Select **"Start in test mode"** → Click **"Enable"**

> ✅ Test mode allows read/write for 30 days — we will set proper rules in Step 4

---

## Step 4 — Set Database Rules

1. In Realtime Database → click **"Rules"** tab
2. Replace all existing rules with this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Click **"Publish"**

> ⚠️ These open rules are fine for a local event. After the event you can
> change `.write` to `false` to lock the database.

---

## Step 5 — Update `js/config.js`

Open `js/config.js` and replace `FIREBASE_CONFIG` with your copied values:

```javascript
// ═══════════════════════════════════════════════
// Google Sheets API URL
// ═══════════════════════════════════════════════
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwTZSSzxWSpiyMNo5bHGDitq0_miFPwUAZff596ClLNW904N5f-YLp0fj8FF-cA86rD/exec";

// ═══════════════════════════════════════════════
// Firebase Config  ← paste YOUR values here
// ═══════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey            : "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain        : "kbc-fastest-fingerfirst.firebaseapp.com",
  databaseURL       : "https://kbc-fastest-fingerfirst-default-rtdb.firebaseio.com",
  projectId         : "kbc-fastest-fingerfirst",
  storageBucket     : "kbc-fastest-fingerfirst.appspot.com",
  messagingSenderId : "123456789",
  appId             : "1:123456789:web:XXXXXXXXXXXXXXXXXX"
};
```

> ⚠️ Replace ALL values with YOUR project's values from Step 2

---

## Step 6 — Add Firebase SDK to HTML files

You need to add Firebase scripts to all 3 HTML files.

### `index.html` — add BEFORE `</body>`:

Replace this at the bottom of `index.html`:
```html
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/player.js"></script>
</body>
```

With this:
```html
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>

  <!-- App files -->
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/player.js"></script>
</body>
```

---

### `host.html` — same change:

Replace:
```html
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/host.js"></script>
</body>
```

With:
```html
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>

  <!-- App files -->
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/host.js"></script>
</body>
```

---

### `display.html` — same change:

Replace:
```html
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
</body>
```

With:
```html
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>

  <!-- App files -->
  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
</body>
```

---

## Step 7 — What Firebase Will Store

This is the structure our app will use in the database:

```
/game/
  ├── status        →  "waiting" | "active" | "reveal" | "leaderboard"
  ├── currentRound  →  1
  ├── totalRounds   →  2
  ├── roundStartTime → 1716634521432   (timestamp in ms)
  │
  ├── players/
  │   ├── uid_abc123 → { name: "Devesh", score: 0 }
  │   └── uid_xyz456 → { name: "Rohan",  score: 0 }
  │
  └── submissions/
      ├── uid_abc123 → {
      │     answers:    [1, 1, 0, 2, 2],
      │     submitTime: 1716634529864,
      │     timeTaken:  8432,            ← milliseconds after round started
      │     score:      5               ← correct answers count
      │   }
      └── uid_xyz456 → { ... }
```

---

## Step 8 — Push Updated Files to GitHub

After updating `config.js` and all 3 HTML files:

```bash
git add .
git commit -m "add firebase config and SDK"
git push
```

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Web app registered → config copied
- [ ] Realtime Database enabled
- [ ] Rules set to open (read/write: true)
- [ ] `js/config.js` updated with your Firebase values
- [ ] Firebase SDK added to `index.html`
- [ ] Firebase SDK added to `host.html`
- [ ] Firebase SDK added to `display.html`
- [ ] Changes pushed to GitHub ✅

---

## What's Next?

➡️ **`04-game-logic.md`** — Write `js/game.js` — initialize Firebase,
load questions from Sheets, and manage game state in real time.
