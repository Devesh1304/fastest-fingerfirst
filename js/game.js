// ══════════════════════════════════════════════════════
// js/game.js  — Core shared logic
// Used by: player.js  and  host.js
// ══════════════════════════════════════════════════════


// ── 1. Initialize Firebase ───────────────────────────
firebase.initializeApp(firebaseConfig);

const db      = firebase.database();
const gameRef = db.ref('game');          // /game  (all game state lives here)


// ── 2. Shared State ──────────────────────────────────
let allQuestions = [];   // all questions loaded from Google Sheets
let totalRounds  = 0;    // total rounds = allQuestions.length / 5

// Each player gets a unique ID stored in localStorage
// so they are recognised across page refreshes
let myUID  = localStorage.getItem('fff_uid')  || _generateUID();
let myName = localStorage.getItem('fff_name') || '';
localStorage.setItem('fff_uid', myUID);

function _generateUID() {
  return 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}


// ── 3. Load Questions from Google Sheets ─────────────
async function loadQuestions() {
  try {
    const res    = await fetch(SHEETS_API_URL);
    allQuestions = await res.json();
    totalRounds  = Math.floor(allQuestions.length / 5);
    console.log('✅ Questions loaded:', allQuestions.length, '→', totalRounds, 'rounds');
    return true;
  } catch (err) {
    console.error('❌ Failed to load questions:', err);
    return false;
  }
}


// ── 4. Get 5 Questions for a Round ───────────────────
// roundNum is 1-based  (round 1, 2, 3 ...)
function getRoundQuestions(roundNum) {
  const start = (roundNum - 1) * 5;
  return allQuestions.slice(start, start + 5);
}


// ── 5. Show a Screen, Hide All Others ────────────────
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var el = document.getElementById(screenId);
  if (el) {
    el.classList.add('active');
    window.scrollTo(0, 0);
  }
}


// ── 6. Format Milliseconds → "8.43s" ─────────────────
function formatTime(ms) {
  return (ms / 1000).toFixed(2) + 's';
}


// ── 7. Count Correct Answers ─────────────────────────
// answers = [1, 0, 2, 1, 3]  (player's chosen index per question)
// questions = array of 5 question objects from allQuestions
function calcScore(answers, questions) {
  var score = 0;
  questions.forEach(function(q, i) {
    if (answers[i] === q.correct) score++;
  });
  return score;
}


// ── 8. Build Sorted Leaderboard from Firebase Data ───
// submissions = { uid: { name, score, timeTaken }, ... }
// Returns array sorted by score DESC, timeTaken ASC
function buildLeaderboard(submissions) {
  var rows = [];

  Object.keys(submissions).forEach(function(uid) {
    var s = submissions[uid];
    rows.push({
      uid      : uid,
      name     : s.name      || 'Unknown',
      score    : s.score     || 0,
      timeTaken: s.timeTaken || 999999
    });
  });

  // Sort: more correct = higher rank, same score = faster wins
  rows.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeTaken - b.timeTaken;
  });

  return rows;
}


// ── 9. Render Leaderboard into a container element ───
function renderLeaderboard(containerId, rows) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (rows.length === 0) {
    container.innerHTML = '<p class="muted">કોઈ submission નથી</p>';
    return;
  }

  rows.forEach(function(row, index) {
    var div = document.createElement('div');
    div.className = 'lb-row';
    div.innerHTML =
      '<span class="lb-rank">' + (index + 1) + '</span>' +
      '<span class="lb-name">' + row.name + '</span>' +
      '<span class="lb-score">' + row.score + '/5</span>' +
      '<span class="lb-time">'  + formatTime(row.timeTaken) + '</span>';
    container.appendChild(div);
  });
}
