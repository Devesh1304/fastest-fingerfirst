// ══════════════════════════════════════════════════════
// js/host.js — Host / Master screen logic
// ══════════════════════════════════════════════════════


// ── Host state variables ──────────────────────────────
var _hostRound          = 1;   // current round host is on
var _hostTotalRounds    = 0;   // total rounds available
var _hostRoundQuestions = [];  // 5 questions for current round


// ══════════════════════════════════════════════════════
// On Page Load — attach all button listeners
// ══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {

  document.getElementById('btn-load-questions') .addEventListener('click', hostLoadQuestions);
  document.getElementById('btn-go-round1')      .addEventListener('click', hostStartGame);
  document.getElementById('btn-start-round')    .addEventListener('click', hostStartRound);
  document.getElementById('btn-reveal-answers') .addEventListener('click', hostRevealAnswers);
  document.getElementById('btn-next-round')     .addEventListener('click', hostNextRound);
  document.getElementById('btn-new-game')       .addEventListener('click', hostNewGame);
});


// ══════════════════════════════════════════════════════
// STEP 1 — Load Questions from Google Sheets
// ══════════════════════════════════════════════════════
async function hostLoadQuestions() {
  var statusEl = document.getElementById('load-status');
  statusEl.textContent = '⏳ Loading questions...';

  var success = await loadQuestions();   // from game.js

  if (!success) {
    statusEl.textContent = '❌ Failed! Internet check કરો.';
    return;
  }

  _hostTotalRounds = totalRounds;   // totalRounds set by loadQuestions()

  statusEl.textContent = '';
  document.getElementById('q-count').textContent     = allQuestions.length;
  document.getElementById('round-count').textContent = _hostTotalRounds;
  document.getElementById('load-success').classList.remove('hidden');
}


// ══════════════════════════════════════════════════════
// STEP 2 — Start Game (clears Firebase, goes to Round 1)
// ══════════════════════════════════════════════════════
function hostStartGame() {

  // Clear any old game data in Firebase and set fresh state
  gameRef.set({
    status        : 'waiting',
    currentRound  : 1,
    totalRounds   : _hostTotalRounds,
    roundStartTime: 0,
    players       : null,
    submissions   : null
  });

  _hostRound = 1;
  _showHostRoundScreen();
  showScreen('host-round');
}


// ══════════════════════════════════════════════════════
// STEP 3 — Show Round Preview (questions + correct answers)
// ══════════════════════════════════════════════════════
function _showHostRoundScreen() {
  _hostRoundQuestions = getRoundQuestions(_hostRound);  // 5 questions

  // Update round counter label
  document.getElementById('host-round-label').textContent =
    'Round ' + _hostRound + ' of ' + _hostTotalRounds;

  // Fill question preview — host can see correct answers!
  _hostRoundQuestions.forEach(function (q, i) {
    document.getElementById('hq-' + i).textContent     = q.question;
    document.getElementById('hq-ans-' + i).textContent = '✅ ' + q.items[q.correct];
  });

  // Reset button states
  document.getElementById('btn-start-round')   .classList.remove('hidden');
  document.getElementById('btn-reveal-answers').classList.add('hidden');
  document.getElementById('btn-next-round')    .classList.add('hidden');
  document.getElementById('btn-next-round')    .textContent = '→ Next Round';
  document.getElementById('submissions-list')  .innerHTML   = '';

  // Live player count
  gameRef.child('players').on('value', function (snap) {
    var el = document.getElementById('host-player-count');
    if (el) el.textContent = '👥 ' + snap.numChildren() + ' joined';
  });
}


// ══════════════════════════════════════════════════════
// STEP 4 — Start Round (players see questions)
// ══════════════════════════════════════════════════════
function hostStartRound() {
  var startTime = Date.now();

  // Push to Firebase — all players react to status: "active"
  gameRef.update({
    status        : 'active',
    currentRound  : _hostRound,
    roundStartTime: startTime
  });

  // Swap buttons
  document.getElementById('btn-start-round')   .classList.add('hidden');
  document.getElementById('btn-reveal-answers').classList.remove('hidden');

  // Start watching live submissions
  _watchSubmissions();
}


// ══════════════════════════════════════════════════════
// STEP 5 — Watch Live Submissions (real-time)
// ══════════════════════════════════════════════════════
function _watchSubmissions() {
  var path = 'submissions/round_' + _hostRound;

  gameRef.child(path).on('value', function (snap) {
    var submissions = snap.val() || {};
    var rows        = buildLeaderboard(submissions);  // from game.js
    var list        = document.getElementById('submissions-list');

    list.innerHTML = '';

    if (rows.length === 0) {
      list.innerHTML = '<p class="muted">Submissions ની રાહ જોઈ રહ્યા છીએ...</p>';
      return;
    }

    rows.forEach(function (row, index) {
      var div       = document.createElement('div');
      div.className = 'submission-row';
      div.innerHTML =
        '<span class="sub-rank">'  + (index + 1)           + '</span>' +
        '<span class="sub-name">'  + row.name              + '</span>' +
        '<span class="sub-time">'  + formatTime(row.timeTaken) + '</span>' +
        '<span class="sub-score">' + row.score + '/5'      + '</span>';
      list.appendChild(div);
    });
  });
}


// ══════════════════════════════════════════════════════
// STEP 6 — Reveal Answers
// ══════════════════════════════════════════════════════
function hostRevealAnswers() {

  // Tell all players to show correct/wrong
  gameRef.update({ status: 'reveal' });

  document.getElementById('btn-reveal-answers').classList.add('hidden');
  document.getElementById('btn-next-round')    .classList.remove('hidden');

  // If this is the last round → change button to "Game Over"
  if (_hostRound >= _hostTotalRounds) {
    document.getElementById('btn-next-round').textContent = '🏁 Game Over';
  }
}


// ══════════════════════════════════════════════════════
// STEP 7 — Next Round OR Game Over
// ══════════════════════════════════════════════════════
function hostNextRound() {

  // Stop watching submissions for this round
  gameRef.child('submissions/round_' + _hostRound).off();

  if (_hostRound >= _hostTotalRounds) {
    // ── All rounds done → Game Over ──
    _hostGameOver();
    return;
  }

  // ── More rounds left → show leaderboard briefly, then next round ──
  _hostRound++;

  // Show leaderboard to players for 4 seconds, then go to waiting
  gameRef.update({ status: 'leaderboard', currentRound: _hostRound });

  setTimeout(function () {
    gameRef.update({ status: 'waiting' });
    _showHostRoundScreen();
  }, 4000);
}


// ══════════════════════════════════════════════════════
// STEP 8 — Game Over: combine all rounds into final score
// ══════════════════════════════════════════════════════
function _hostGameOver() {

  // Show leaderboard status to players
  gameRef.update({ status: 'leaderboard' });

  showScreen('host-gameover');

  // Fetch all rounds' submissions and combine scores
  var combined  = {};
  var fetches   = [];

  for (var r = 1; r <= _hostTotalRounds; r++) {
    fetches.push(gameRef.child('submissions/round_' + r).once('value'));
  }

  Promise.all(fetches).then(function (snaps) {
    snaps.forEach(function (snap) {
      var roundData = snap.val() || {};

      Object.keys(roundData).forEach(function (uid) {
        var s = roundData[uid];
        if (!combined[uid]) {
          combined[uid] = { name: s.name, score: 0, timeTaken: 0 };
        }
        combined[uid].score     += (s.score     || 0);
        combined[uid].timeTaken += (s.timeTaken || 0);
      });
    });

    var rows = buildLeaderboard(combined);
    renderLeaderboard('final-leaderboard', rows);
  });
}


// ══════════════════════════════════════════════════════
// STEP 9 — New Game (restart everything)
// ══════════════════════════════════════════════════════
function hostNewGame() {
  gameRef.set({
    status        : 'waiting',
    currentRound  : 1,
    totalRounds   : _hostTotalRounds,
    roundStartTime: 0,
    players       : null,
    submissions   : null
  });

  _hostRound = 1;
  _showHostRoundScreen();
  showScreen('host-round');
}
