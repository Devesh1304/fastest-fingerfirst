# 01 — Project Setup

## What we will do in this step
- Create the folder structure
- Create all HTML files (player, host, display screens)
- Create the CSS file
- Set up GitHub repository
- Deploy to GitHub Pages

---

## How the App Works (Simple Overview)

```
HOST starts Round 1
        ↓
All 5 questions appear on every player's phone at same time
        ↓
Players answer all 5 questions (A / B / C / D for each)
        ↓
Player taps [ 🚀 SUBMIT ] after answering all 5
        ↓
Server saves: who submitted + exact time
        ↓
HOST reveals answers
        ↓
🏆 Fastest player with correct answers WINS!
```

---

## Step 1 — Create Folder Structure

Inside `fastest-fingerfirst/` create these files and folders:

```
fastest-fingerfirst/
  ├── index.html          ← Player screen (on phone)
  ├── host.html           ← Host / Master screen (on laptop)
  ├── display.html        ← TV / Projector screen
  ├── js/
  │   ├── config.js       ← Firebase + Sheets API keys (fill later)
  │   ├── game.js         ← Core game logic (fill later)
  │   ├── player.js       ← Player screen logic (fill later)
  │   └── host.js         ← Host screen logic (fill later)
  ├── css/
  │   └── style.css       ← All styling
  └── README.md
```

---

## Step 2 — Create `index.html` (Player Screen)

This is the screen players open on their phones.

```html
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KBC Fastest Finger First</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>

  <!-- ═══════════════════════════ -->
  <!-- SCREEN 1: Enter Name       -->
  <!-- ═══════════════════════════ -->
  <div id="screen-join" class="screen active">
    <h1>🎯 Fastest Finger First</h1>
    <p>તમારું નામ દાખલ કરો</p>
    <input type="text" id="player-name" placeholder="તમારું નામ..." maxlength="20" />
    <button id="btn-join">Game માં Join કરો →</button>
    <p id="join-error" class="error hidden">કૃપા કરીને નામ દાખલ કરો</p>
  </div>

  <!-- ═══════════════════════════ -->
  <!-- SCREEN 2: Waiting Room     -->
  <!-- ═══════════════════════════ -->
  <div id="screen-waiting" class="screen">
    <div class="big-emoji">👋</div>
    <h2 id="display-name"></h2>
    <p>Host ની રાહ જુઓ...</p>
    <div class="spinner"></div>
    <p id="player-count">👥 0 players joined</p>
  </div>

  <!-- ════════════════════════════════════════════ -->
  <!-- SCREEN 3: 5 Questions (all shown at once)   -->
  <!-- Player answers all 5 then taps SUBMIT       -->
  <!-- ════════════════════════════════════════════ -->
  <div id="screen-questions" class="screen">

    <!-- Top bar: round info + timer -->
    <div id="top-bar">
      <span id="round-label">Round 1</span>
      <span id="timer-display">⏱ 30s</span>
    </div>

    <!-- All 5 questions -->
    <div id="questions-list">

      <!-- Question 1 -->
      <div class="q-block" id="q-block-0">
        <p class="q-text">
          <span class="q-num">Q1.</span>
          <span id="q-text-0"></span>
        </p>
        <div class="q-options">
          <button class="opt-btn" data-q="0" data-i="0">A. <span id="q0-opt0"></span></button>
          <button class="opt-btn" data-q="0" data-i="1">B. <span id="q0-opt1"></span></button>
          <button class="opt-btn" data-q="0" data-i="2">C. <span id="q0-opt2"></span></button>
          <button class="opt-btn" data-q="0" data-i="3">D. <span id="q0-opt3"></span></button>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="q-block" id="q-block-1">
        <p class="q-text">
          <span class="q-num">Q2.</span>
          <span id="q-text-1"></span>
        </p>
        <div class="q-options">
          <button class="opt-btn" data-q="1" data-i="0">A. <span id="q1-opt0"></span></button>
          <button class="opt-btn" data-q="1" data-i="1">B. <span id="q1-opt1"></span></button>
          <button class="opt-btn" data-q="1" data-i="2">C. <span id="q1-opt2"></span></button>
          <button class="opt-btn" data-q="1" data-i="3">D. <span id="q1-opt3"></span></button>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="q-block" id="q-block-2">
        <p class="q-text">
          <span class="q-num">Q3.</span>
          <span id="q-text-2"></span>
        </p>
        <div class="q-options">
          <button class="opt-btn" data-q="2" data-i="0">A. <span id="q2-opt0"></span></button>
          <button class="opt-btn" data-q="2" data-i="1">B. <span id="q2-opt1"></span></button>
          <button class="opt-btn" data-q="2" data-i="2">C. <span id="q2-opt2"></span></button>
          <button class="opt-btn" data-q="2" data-i="3">D. <span id="q2-opt3"></span></button>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="q-block" id="q-block-3">
        <p class="q-text">
          <span class="q-num">Q4.</span>
          <span id="q-text-3"></span>
        </p>
        <div class="q-options">
          <button class="opt-btn" data-q="3" data-i="0">A. <span id="q3-opt0"></span></button>
          <button class="opt-btn" data-q="3" data-i="1">B. <span id="q3-opt1"></span></button>
          <button class="opt-btn" data-q="3" data-i="2">C. <span id="q3-opt2"></span></button>
          <button class="opt-btn" data-q="3" data-i="3">D. <span id="q3-opt3"></span></button>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="q-block" id="q-block-4">
        <p class="q-text">
          <span class="q-num">Q5.</span>
          <span id="q-text-4"></span>
        </p>
        <div class="q-options">
          <button class="opt-btn" data-q="4" data-i="0">A. <span id="q4-opt0"></span></button>
          <button class="opt-btn" data-q="4" data-i="1">B. <span id="q4-opt1"></span></button>
          <button class="opt-btn" data-q="4" data-i="2">C. <span id="q4-opt2"></span></button>
          <button class="opt-btn" data-q="4" data-i="3">D. <span id="q4-opt3"></span></button>
        </div>
      </div>

    </div><!-- end questions-list -->

    <!-- Sticky submit bar at bottom -->
    <div id="submit-bar">
      <p id="answered-count">0 / 5 answered</p>
      <button id="btn-submit" disabled>🚀 SUBMIT</button>
    </div>

  </div><!-- end screen-questions -->

  <!-- ══════════════════════════════════ -->
  <!-- SCREEN 4: Submitted — waiting     -->
  <!-- ══════════════════════════════════ -->
  <div id="screen-submitted" class="screen">
    <div class="big-emoji">🚀</div>
    <h2>Submit થઈ ગયું!</h2>
    <p id="submit-time-label" class="time-label"></p>
    <p class="muted">બીજા players ની રાહ જુઓ...</p>
    <div class="spinner"></div>
  </div>

  <!-- ═══════════════════════════ -->
  <!-- SCREEN 5: Leaderboard      -->
  <!-- ═══════════════════════════ -->
  <div id="screen-result" class="screen">
    <h2>🏆 Results</h2>
    <div id="leaderboard-list"></div>
    <p id="result-status" class="muted">Host ની રાહ જુઓ...</p>
  </div>

  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/player.js"></script>
</body>
</html>
```

---

## Step 3 — Create `host.html` (Host/Master Screen)

```html
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Host Controls — KBC FFF</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="host-body">

  <!-- SCREEN 1: Setup -->
  <div id="host-setup" class="screen active">
    <h1>🎮 Host Controls</h1>
    <p>Google Sheets માંથી પ્રશ્નો લોડ કરો</p>
    <button id="btn-load-questions">📊 Load Questions from Sheet</button>
    <p id="load-status" class="muted"></p>
    <div id="load-success" class="hidden">
      <p>✅ <span id="q-count">0</span> questions loaded
         (<span id="round-count">0</span> rounds of 5)</p>
      <button id="btn-go-round1" class="btn-green">🚀 Round 1 શરૂ કરો</button>
    </div>
  </div>

  <!-- SCREEN 2: Round Control -->
  <div id="host-round" class="screen">

    <div id="host-top-bar">
      <span id="host-round-label">Round 1 of 2</span>
      <span id="host-player-count">👥 0 joined</span>
    </div>

    <!-- Preview of all 5 questions for this round -->
    <div id="host-questions-preview">
      <div class="host-q-row"><span class="hq-num">Q1.</span><span id="hq-0"></span><span class="hq-ans" id="hq-ans-0"></span></div>
      <div class="host-q-row"><span class="hq-num">Q2.</span><span id="hq-1"></span><span class="hq-ans" id="hq-ans-1"></span></div>
      <div class="host-q-row"><span class="hq-num">Q3.</span><span id="hq-2"></span><span class="hq-ans" id="hq-ans-2"></span></div>
      <div class="host-q-row"><span class="hq-num">Q4.</span><span id="hq-3"></span><span class="hq-ans" id="hq-ans-3"></span></div>
      <div class="host-q-row"><span class="hq-num">Q5.</span><span id="hq-4"></span><span class="hq-ans" id="hq-ans-4"></span></div>
    </div>

    <!-- Live submissions coming in -->
    <div id="live-submissions">
      <h3>⚡ Submissions (Live)</h3>
      <div id="submissions-list"></div>
    </div>

    <div id="host-controls">
      <button id="btn-start-round" class="btn-green">▶ Start Round</button>
      <button id="btn-reveal-answers" class="btn-blue hidden">✅ Reveal Answers</button>
      <button id="btn-next-round" class="btn-orange hidden">→ Next Round</button>
    </div>

  </div>

  <!-- SCREEN 3: Game Over -->
  <div id="host-gameover" class="screen">
    <h2>🏁 Game Over!</h2>
    <div id="final-leaderboard"></div>
    <button id="btn-new-game">🔄 New Game</button>
  </div>

  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
  <script src="js/host.js"></script>
</body>
</html>
```

---

## Step 4 — Create `display.html` (TV/Projector Screen)

```html
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Display — KBC FFF</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="display-body">

  <!-- SCREEN 1: Waiting -->
  <div id="disp-waiting" class="screen active">
    <h1>🎯 KBC Fastest Finger First</h1>
    <p class="disp-sub">Host ની રાહ જુઓ...</p>
    <div id="disp-player-list"></div>
  </div>

  <!-- SCREEN 2: Live Questions (all 5 on TV) -->
  <div id="disp-questions" class="screen">
    <div id="disp-top-bar">
      <span id="disp-round-label">Round 1</span>
      <span id="disp-timer" class="disp-timer">⏱ 30s</span>
      <span id="disp-submitted-count">0 submitted</span>
    </div>

    <div id="disp-q-grid">
      <div class="disp-q-block">
        <span class="disp-q-num">Q1</span>
        <span id="dq-text-0" class="disp-q-text"></span>
      </div>
      <div class="disp-q-block">
        <span class="disp-q-num">Q2</span>
        <span id="dq-text-1" class="disp-q-text"></span>
      </div>
      <div class="disp-q-block">
        <span class="disp-q-num">Q3</span>
        <span id="dq-text-2" class="disp-q-text"></span>
      </div>
      <div class="disp-q-block">
        <span class="disp-q-num">Q4</span>
        <span id="dq-text-3" class="disp-q-text"></span>
      </div>
      <div class="disp-q-block">
        <span class="disp-q-num">Q5</span>
        <span id="dq-text-4" class="disp-q-text"></span>
      </div>
    </div>
  </div>

  <!-- SCREEN 3: Reveal Answers + Winner -->
  <div id="disp-reveal" class="screen">
    <h2>✅ સાચા જવાબ</h2>
    <div id="disp-answers-list">
      <div class="disp-answer-row"><span class="disp-q-num">Q1</span><span id="da-0"></span></div>
      <div class="disp-answer-row"><span class="disp-q-num">Q2</span><span id="da-1"></span></div>
      <div class="disp-answer-row"><span class="disp-q-num">Q3</span><span id="da-2"></span></div>
      <div class="disp-answer-row"><span class="disp-q-num">Q4</span><span id="da-3"></span></div>
      <div class="disp-answer-row"><span class="disp-q-num">Q5</span><span id="da-4"></span></div>
    </div>
    <div id="disp-winner-box">
      <p class="winner-label">🏆 Fastest Correct!</p>
      <p id="disp-winner-name" class="winner-name"></p>
      <p id="disp-winner-score" class="winner-score"></p>
    </div>
  </div>

  <!-- SCREEN 4: Leaderboard -->
  <div id="disp-leaderboard" class="screen">
    <h2>🏆 Leaderboard</h2>
    <div id="disp-scores"></div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/game.js"></script>
</body>
</html>
```

---

## Step 5 — Create `css/style.css`

```css
/* ══════════════════════════════
   Global Reset
══════════════════════════════ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #fff;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px 16px 100px; /* bottom pad for sticky submit bar */
}

/* ══════════════════════════════
   Screens
══════════════════════════════ */
.screen {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.screen.active {
  display: flex;
}

/* ══════════════════════════════
   Typography
══════════════════════════════ */
h1    { font-size: 2rem;   color: #f0c040; }
h2    { font-size: 1.6rem; color: #f0c040; }
h3    { font-size: 1.1rem; color: #ccc; margin-bottom: 8px; }
p     { font-size: 1rem;   color: #ddd; }
.muted { color: #888 !important; font-size: 0.9rem !important; }
.big-emoji { font-size: 3.5rem; }

/* ══════════════════════════════
   Input
══════════════════════════════ */
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  font-size: 1.2rem;
  border: 2px solid #f0c040;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  text-align: center;
  outline: none;
}

input[type="text"]::placeholder { color: #888; }

/* ══════════════════════════════
   Buttons
══════════════════════════════ */
button {
  width: 100%;
  padding: 14px;
  font-size: 1.05rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.1s, opacity 0.2s;
}

button:active  { transform: scale(0.97); }
button:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-green  { background: #28a745; color: #fff; }
.btn-blue   { background: #007bff; color: #fff; }
.btn-orange { background: #fd7e14; color: #fff; }

/* ══════════════════════════════
   Spinner
══════════════════════════════ */
.spinner {
  width: 44px; height: 44px;
  border: 5px solid rgba(255,255,255,0.15);
  border-top-color: #f0c040;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════
   Utility
══════════════════════════════ */
.hidden { display: none !important; }
.error  { color: #ff6b6b; font-size: 0.9rem; }

/* ══════════════════════════════
   Top Bar (Round + Timer)
══════════════════════════════ */
#top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 0.95rem;
}

#round-label   { color: #f0c040; font-weight: bold; }
#timer-display { color: #fff; }

/* ══════════════════════════════
   5 Questions List
══════════════════════════════ */
#questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Each question card */
.q-block {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px;
  text-align: left;
  transition: border-color 0.2s;
}

/* Question card turns gold border when answered */
.q-block.answered {
  border-color: #f0c040;
  background: rgba(240,192,64,0.05);
}

.q-text {
  font-size: 0.95rem !important;
  color: #fff !important;
  line-height: 1.5;
  margin-bottom: 10px;
}

.q-num {
  color: #f0c040;
  font-weight: bold;
  margin-right: 4px;
}

/* 2×2 grid of A B C D options */
.q-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.opt-btn {
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.15);
  color: #ddd;
  font-size: 0.85rem;
  padding: 10px 8px;
  border-radius: 10px;
  text-align: left;
  font-weight: normal;
  transition: all 0.15s;
}

.opt-btn:hover {
  background: rgba(240,192,64,0.15);
  border-color: #f0c040;
  color: #fff;
}

/* Selected option — gold highlight */
.opt-btn.selected {
  background: rgba(240,192,64,0.25);
  border-color: #f0c040;
  color: #fff;
  font-weight: bold;
}

/* After reveal */
.opt-btn.reveal-correct { background: #28a745; border-color: #28a745; color: #fff; font-weight: bold; }
.opt-btn.reveal-wrong   { background: #dc3545; border-color: #dc3545; color: #fff; }

/* ══════════════════════════════
   Sticky Submit Bar
══════════════════════════════ */
#submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #1a1a2e 75%, transparent);
  padding: 10px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 100;
}

#submit-bar #btn-submit {
  max-width: 480px;
  background: #f0c040;
  color: #1a1a2e;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 16px;
  border-radius: 14px;
}

#submit-bar #btn-submit:not(:disabled):hover {
  background: #e0b030;
}

#answered-count {
  font-size: 0.8rem !important;
  color: #888 !important;
}

/* ══════════════════════════════
   Submitted Screen
══════════════════════════════ */
.time-label {
  font-size: 1.4rem !important;
  color: #f0c040 !important;
  font-weight: bold;
}

/* ══════════════════════════════
   Leaderboard
══════════════════════════════ */
#leaderboard-list,
#final-leaderboard,
#disp-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.lb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
}

.lb-row:first-child {
  background: rgba(240,192,64,0.15);
  border: 1px solid #f0c040;
}

.lb-rank  { color: #f0c040; font-weight: bold; min-width: 30px; }
.lb-name  { flex: 1; text-align: left; padding-left: 10px; }
.lb-score { color: #28a745; font-weight: bold; }
.lb-time  { color: #888; font-size: 0.8rem; margin-left: 10px; }

/* ══════════════════════════════
   Host Screen
══════════════════════════════ */
.host-body {
  padding: 20px;
  align-items: flex-start;
}

.host-body .screen {
  max-width: 700px;
  text-align: left;
  align-items: flex-start;
}

#host-top-bar {
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: #aaa;
  font-size: 0.95rem;
}

#host-questions-preview {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 14px;
  width: 100%;
}

.host-q-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.9rem;
}

.host-q-row:last-child { border-bottom: none; }
.hq-num  { color: #f0c040; font-weight: bold; min-width: 28px; }
.hq-ans  { color: #28a745; font-size: 0.8rem; margin-left: auto; white-space: nowrap; }

#live-submissions {
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 14px;
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
}

.submission-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.submission-row:last-child { border-bottom: none; }
.sub-rank  { color: #f0c040; font-weight: bold; min-width: 28px; }
.sub-name  { flex: 1; }
.sub-time  { color: #aaa; font-size: 0.8rem; }
.sub-score { color: #28a745; font-weight: bold; margin-left: 8px; }

#host-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

#host-controls button { flex: 1; min-width: 140px; }

/* ══════════════════════════════
   Display Screen (TV)
══════════════════════════════ */
.display-body {
  background: linear-gradient(135deg, #0a0a1a, #12122e);
  padding: 30px;
  align-items: flex-start;
}

.display-body .screen {
  max-width: 1100px;
}

#disp-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.3rem;
  margin-bottom: 16px;
}

.disp-timer { color: #f0c040; font-weight: bold; font-size: 2rem; }

#disp-q-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
}

.disp-q-block {
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.disp-q-num {
  color: #f0c040;
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 30px;
}

.disp-q-text {
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.5;
}

.disp-sub {
  font-size: 1.3rem !important;
  color: #aaa !important;
}

/* Reveal answers */
#disp-answers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.disp-answer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(40,167,69,0.15);
  border: 1px solid #28a745;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 1.1rem;
}

/* Winner box */
#disp-winner-box {
  background: rgba(240,192,64,0.1);
  border: 2px solid #f0c040;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  width: 100%;
}

.winner-label { color: #aaa; font-size: 1rem; margin-bottom: 8px; }
.winner-name  { font-size: 2.5rem !important; color: #f0c040 !important; font-weight: bold; }
.winner-score { font-size: 1.2rem !important; color: #28a745 !important; margin-top: 6px; }
```

---

## Step 6 — Create empty JS files

Create these 4 files inside `js/` — leave them **empty for now**:

- `js/config.js`
- `js/game.js`
- `js/player.js`
- `js/host.js`

---

## Step 7 — Create `README.md`

```markdown
# KBC Fastest Finger First 🎯

Real-time quiz game — 5 questions at once, fastest correct submission wins!

## Screens
| File | Who uses it |
|---|---|
| `index.html` | Players (phone) |
| `host.html` | Host / Master (laptop) |
| `display.html` | TV / Projector |

## Tech Stack
- HTML + CSS + Vanilla JavaScript
- Firebase Realtime Database
- Google Sheets → Apps Script (question bank)
- GitHub Pages (free hosting)
```

---

## Step 8 — Create GitHub Repository

### 8a. Create repo on GitHub
1. Go to [github.com](https://github.com) → Click **"New repository"**
2. Name: `fastest-fingerfirst`
3. Keep it **Public**
4. Click **"Create repository"**

### 8b. Push your code

Open terminal inside `fastest-fingerfirst/` folder:

```bash
git init
git add .
git commit -m "first commit: project structure"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fastest-fingerfirst.git
git push -u origin main
```

> ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username

---

## Step 9 — Enable GitHub Pages

1. GitHub repo → **Settings** tab
2. Left sidebar → **Pages**
3. Branch → select `main` → `/ (root)`
4. Click **Save**

Live at:
```
https://YOUR_USERNAME.github.io/fastest-fingerfirst/
```

---

## ✅ Checklist

- [ ] Folder structure created
- [ ] `index.html` created (5-question player screen)
- [ ] `host.html` created
- [ ] `display.html` created
- [ ] `css/style.css` created
- [ ] 4 empty JS files created
- [ ] `README.md` created
- [ ] GitHub repo created and code pushed
- [ ] GitHub Pages enabled
- [ ] App opens at `github.io` link ✅

---

## What's Next?

➡️ **`02-google-sheets-setup.md`** — Set up your question bank in Google Sheets and create the free JSON API.
