// ══════════════════════════════════════════════════════
// js/display.js — TV / Projector screen logic
// ══════════════════════════════════════════════════════


// ── State ─────────────────────────────────────────────
var _dispRound     = 1;
var _dispQuestions = [];
var _timerInterval = null;


// ══════════════════════════════════════════════════════
// On Page Load
// ══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {

  // Load questions from Sheets (needed to show question text)
  loadQuestions().then(function () {
    // Connect to Firebase and listen for game events
    _listenToGame();
  });
});


// ══════════════════════════════════════════════════════
// Listen to Firebase for all game state changes
// ══════════════════════════════════════════════════════
function _listenToGame() {

  // Show live player list in waiting room
  gameRef.child('players').on('value', function (snap) {
    var players = snap.val() || {};
    var list    = document.getElementById('disp-player-list');
    if (!list) return;

    list.innerHTML = '';
    Object.keys(players).forEach(function (uid) {
      var p        = document.createElement('p');
      p.textContent = '👤 ' + players[uid].name;
      p.style.cssText = 'font-size:1.1rem; color:#ddd; margin:4px 0;';
      list.appendChild(p);
    });
  });

  // Track current round
  gameRef.child('currentRound').on('value', function (snap) {
    _dispRound = snap.val() || 1;
  });

  // Main listener — react to status changes
  gameRef.child('status').on('value', function (snap) {
    var status = snap.val();
    if (!status) return;

    if      (status === 'waiting')     _dispShowWaiting();
    else if (status === 'active')      _dispShowQuestions();
    else if (status === 'reveal')      _dispShowReveal();
    else if (status === 'leaderboard') _dispShowLeaderboard();
  });

  // Live submission count during active round
  gameRef.child('submissions').on('value', function (snap) {
    var el = document.getElementById('disp-submitted-count');
    if (!el) return;
    var total = 0;
    var data  = snap.val() || {};
    Object.keys(data).forEach(function (round) {
      total += Object.keys(data[round] || {}).length;
    });
    el.textContent = total + ' submitted';
  });
}


// ══════════════════════════════════════════════════════
// Waiting screen
// ══════════════════════════════════════════════════════
function _dispShowWaiting() {
  _stopTimer();
  showScreen('disp-waiting');
}


// ══════════════════════════════════════════════════════
// Active round — show all 5 questions + countdown timer
// ══════════════════════════════════════════════════════
function _dispShowQuestions() {
  _dispQuestions = getRoundQuestions(_dispRound);

  // Update round label
  document.getElementById('disp-round-label').textContent = 'Round ' + _dispRound;

  // Fill 5 question texts on TV
  _dispQuestions.forEach(function (q, i) {
    document.getElementById('dq-text-' + i).textContent = q.question;
  });

  showScreen('disp-questions');

  // Start countdown timer (reads roundStartTime from Firebase)
  gameRef.child('roundStartTime').once('value', function (snap) {
    var startTime  = snap.val() || Date.now();
    var duration   = 30;  // seconds — match your event timing
    _startTimer(startTime, duration);
  });
}


// ══════════════════════════════════════════════════════
// Timer countdown on TV
// ══════════════════════════════════════════════════════
function _startTimer(startTime, durationSeconds) {
  _stopTimer();

  _timerInterval = setInterval(function () {
    var elapsed   = Math.floor((Date.now() - startTime) / 1000);
    var remaining = durationSeconds - elapsed;

    if (remaining < 0) remaining = 0;

    var el = document.getElementById('disp-timer');
    if (el) {
      el.textContent = '⏱ ' + remaining + 's';
      // Turn red when under 10 seconds
      el.style.color = remaining <= 10 ? '#ff4444' : '#f0c040';
    }

    if (remaining <= 0) _stopTimer();
  }, 500);
}

function _stopTimer() {
  if (_timerInterval) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }
}


// ══════════════════════════════════════════════════════
// Reveal screen — show correct answers + winner
// ══════════════════════════════════════════════════════
function _dispShowReveal() {
  _stopTimer();

  // Show correct answer text for each question
  _dispQuestions.forEach(function (q, i) {
    var el = document.getElementById('da-' + i);
    if (el) el.textContent = q.question + '  →  ✅ ' + q.items[q.correct];
  });

  showScreen('disp-reveal');

  // Find the winner (fastest + most correct)
  gameRef.child('submissions/round_' + _dispRound)
    .once('value', function (snap) {
      var rows = buildLeaderboard(snap.val() || {});

      if (rows.length > 0) {
        var winner = rows[0];
        document.getElementById('disp-winner-name').textContent  = winner.name;
        document.getElementById('disp-winner-score').textContent =
          winner.score + '/5 સાચા  |  ' + formatTime(winner.timeTaken);
      } else {
        document.getElementById('disp-winner-name').textContent  = 'કોઈ નહીં 😅';
        document.getElementById('disp-winner-score').textContent = '';
      }
    });
}


// ══════════════════════════════════════════════════════
// Leaderboard screen on TV
// ══════════════════════════════════════════════════════
function _dispShowLeaderboard() {

  // Combine all rounds for final leaderboard
  var combined = {};
  var fetches  = [];
  var total    = 0;

  gameRef.child('totalRounds').once('value', function (snap) {
    total = snap.val() || 1;

    for (var r = 1; r <= total; r++) {
      fetches.push(gameRef.child('submissions/round_' + r).once('value'));
    }

    Promise.all(fetches).then(function (snaps) {
      snaps.forEach(function (s) {
        var data = s.val() || {};
        Object.keys(data).forEach(function (uid) {
          var sub = data[uid];
          if (!combined[uid]) {
            combined[uid] = { name: sub.name, score: 0, timeTaken: 0 };
          }
          combined[uid].score     += (sub.score     || 0);
          combined[uid].timeTaken += (sub.timeTaken || 0);
        });
      });

      var rows = buildLeaderboard(combined);
      renderLeaderboard('disp-scores', rows);
      showScreen('disp-leaderboard');
    });
  });
}
