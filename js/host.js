// ══════════════════════════════════════════════════════
// js/host.js — Host / Master screen logic
// ══════════════════════════════════════════════════════


// ── Host state ────────────────────────────────────────
var _hostRound          = 1;    // current round
var _selectedRounds     = 1;    // how many rounds host chose to play
var _hostTotalRounds    = 0;    // max rounds available from sheet
var _hostRoundQuestions = [];   // 5 questions for current round
var _roundActive        = false; // true after Start Round clicked


// ══════════════════════════════════════════════════════
// On Page Load
// ══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {

  // Setup screen
  document.getElementById('btn-load-questions').addEventListener('click', hostLoadQuestions);
  document.getElementById('btn-go-round1').addEventListener('click', hostStartGame);

  // Round picker buttons (1–6)
  document.querySelectorAll('.round-pick-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var r = parseInt(btn.getAttribute('data-r'));
      if (btn.disabled) return;
      _selectRounds(r);
    });
  });

  // Round adjuster (+ / −) during game
  document.getElementById('btn-rounds-inc').addEventListener('click', function () {
    if (_selectedRounds < _hostTotalRounds) {
      _selectedRounds++;
      _updateAdjuster();
      gameRef.update({ totalRounds: _selectedRounds });
    }
  });

  document.getElementById('btn-rounds-dec').addEventListener('click', function () {
    if (_selectedRounds > _hostRound) {   // can't go below current round
      _selectedRounds--;
      _updateAdjuster();
      gameRef.update({ totalRounds: _selectedRounds });
    }
  });

  // Round control
  document.getElementById('btn-start-round')    .addEventListener('click', hostStartRound);
  document.getElementById('btn-reveal-answers') .addEventListener('click', hostRevealAnswers);
  document.getElementById('btn-next-round')     .addEventListener('click', hostNextRound);

  // Error recovery
  document.getElementById('btn-redo-round')     .addEventListener('click', hostRedoRound);
  document.getElementById('btn-skip-round')     .addEventListener('click', hostSkipRound);

  // Game over
  document.getElementById('btn-new-game')       .addEventListener('click', hostNewGame);
});


// ══════════════════════════════════════════════════════
// STEP 1 — Load Questions from Google Sheets
// ══════════════════════════════════════════════════════
async function hostLoadQuestions() {
  var statusEl = document.getElementById('load-status');
  statusEl.textContent = '⏳ Loading questions...';

  var success = await loadQuestions();

  if (!success) {
    statusEl.textContent = '❌ Failed! Internet check કરો.';
    return;
  }

  _hostTotalRounds = totalRounds;   // set by loadQuestions() in game.js
  statusEl.textContent = '';

  document.getElementById('q-count').textContent = allQuestions.length;
  document.getElementById('load-success').classList.remove('hidden');

  // Enable only buttons up to available rounds, disable rest
  document.querySelectorAll('.round-pick-btn').forEach(function (btn) {
    var r = parseInt(btn.getAttribute('data-r'));
    if (r <= _hostTotalRounds) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
      btn.title    = 'Not enough questions';
    }
  });

  // Auto-select max available rounds
  _selectRounds(_hostTotalRounds);

  document.getElementById('round-pick-note').textContent =
    '(' + allQuestions.length + ' questions available — max ' + _hostTotalRounds + ' rounds)';
}


// ── Update round adjuster display ────────────────────
function _updateAdjuster() {
  var val = document.getElementById('adj-rounds-val');
  if (val) val.textContent = _selectedRounds;

  // Disable − if already at current round, disable + if at max
  var dec = document.getElementById('btn-rounds-dec');
  var inc = document.getElementById('btn-rounds-inc');
  if (dec) dec.disabled = (_selectedRounds <= _hostRound);
  if (inc) inc.disabled = (_selectedRounds >= _hostTotalRounds);

  // Update round label
  var lbl = document.getElementById('host-round-label');
  if (lbl) lbl.textContent = 'Round ' + _hostRound + ' of ' + _selectedRounds;

  // Update Next Round button text
  var nxt = document.getElementById('btn-next-round');
  if (nxt && !nxt.classList.contains('hidden')) {
    nxt.textContent = _hostRound >= _selectedRounds ? '🏁 Game Over' : '→ Next Round';
  }
}

// ── Select how many rounds to play ───────────────────
function _selectRounds(r) {
  _selectedRounds = r;

  // Highlight selected button
  document.querySelectorAll('.round-pick-btn').forEach(function (btn) {
    btn.classList.remove('round-pick-selected');
    if (parseInt(btn.getAttribute('data-r')) === r) {
      btn.classList.add('round-pick-selected');
    }
  });
}


// ══════════════════════════════════════════════════════
// STEP 2 — Start Game
// ══════════════════════════════════════════════════════
function hostStartGame() {
  if (!_selectedRounds) {
    alert('Rounds select કરો!');
    return;
  }

  // Reset Firebase with clean state
  gameRef.set({
    status        : 'waiting',
    currentRound  : 1,
    totalRounds   : _selectedRounds,
    roundStartTime: 0,
    players       : null,
    submissions   : null
  });

  _hostRound    = 1;
  _roundActive  = false;
  _showHostRoundScreen();
  showScreen('host-round');
}


// ══════════════════════════════════════════════════════
// STEP 3 — Show Round Preview
// ══════════════════════════════════════════════════════
function _showHostRoundScreen() {
  _hostRoundQuestions = getRoundQuestions(_hostRound);
  _roundActive        = false;

  document.getElementById('host-round-label').textContent =
    'Round ' + _hostRound + ' of ' + _selectedRounds;

  // Fill questions with correct answers visible to host
  _hostRoundQuestions.forEach(function (q, i) {
    document.getElementById('hq-' + i).textContent     = q.question;
    document.getElementById('hq-ans-' + i).textContent = '✅ ' + q.items[q.correct];
  });

  // Reset main controls
  document.getElementById('btn-start-round')   .classList.remove('hidden');
  document.getElementById('btn-reveal-answers').classList.add('hidden');
  document.getElementById('btn-next-round')    .classList.add('hidden');
  document.getElementById('btn-next-round')    .textContent = '→ Next Round';
  document.getElementById('submissions-list')  .innerHTML   = '';

  // Sync adjuster
  _updateAdjuster();

  // Recovery buttons — both visible but redo disabled until round starts
  document.getElementById('btn-redo-round').disabled = true;
  document.getElementById('btn-skip-round').disabled = false;

  // Live player count
  gameRef.child('players').on('value', function (snap) {
    var el = document.getElementById('host-player-count');
    if (el) el.textContent = '👥 ' + snap.numChildren() + ' joined';
  });
}


// ══════════════════════════════════════════════════════
// STEP 4 — Start Round
// ══════════════════════════════════════════════════════
function hostStartRound() {
  _roundActive = true;
  var startTime = Date.now();

  gameRef.update({
    status        : 'active',
    currentRound  : _hostRound,
    roundStartTime: startTime
  });

  document.getElementById('btn-start-round')   .classList.add('hidden');
  document.getElementById('btn-reveal-answers').classList.remove('hidden');

  // Enable redo now that round is live
  document.getElementById('btn-redo-round').disabled = false;

  _watchSubmissions();
}


// ══════════════════════════════════════════════════════
// STEP 5 — Watch Live Submissions
// ══════════════════════════════════════════════════════
function _watchSubmissions() {
  var path = 'submissions/round_' + _hostRound;

  gameRef.child(path).on('value', function (snap) {
    var submissions = snap.val() || {};
    var rows        = buildLeaderboard(submissions);
    var list        = document.getElementById('submissions-list');

    list.innerHTML = '';

    if (rows.length === 0) {
      list.innerHTML = '<p class="muted">Submissions ની રાહ...</p>';
      return;
    }

    rows.forEach(function (row, index) {
      var div       = document.createElement('div');
      div.className = 'submission-row';
      div.innerHTML =
        '<span class="sub-rank">'  + (index + 1)              + '</span>' +
        '<span class="sub-name">'  + row.name                 + '</span>' +
        '<span class="sub-time">'  + formatTime(row.timeTaken) + '</span>' +
        '<span class="sub-score">' + row.score + '/5'         + '</span>';
      list.appendChild(div);
    });
  });
}


// ══════════════════════════════════════════════════════
// STEP 6 — Reveal Answers
// ══════════════════════════════════════════════════════
function hostRevealAnswers() {
  gameRef.update({ status: 'reveal' });

  document.getElementById('btn-reveal-answers').classList.add('hidden');
  document.getElementById('btn-next-round')    .classList.remove('hidden');

  // Disable recovery after reveal
  document.getElementById('btn-redo-round').disabled = true;
  document.getElementById('btn-skip-round').disabled = true;

  if (_hostRound >= _selectedRounds) {
    document.getElementById('btn-next-round').textContent = '🏁 Game Over';
  }
}


// ══════════════════════════════════════════════════════
// STEP 7 — Next Round or Game Over
// ══════════════════════════════════════════════════════
function hostNextRound() {
  gameRef.child('submissions/round_' + _hostRound).off();

  if (_hostRound >= _selectedRounds) {
    _hostGameOver();
    return;
  }

  _hostRound++;
  gameRef.update({ status: 'leaderboard', currentRound: _hostRound });

  setTimeout(function () {
    gameRef.update({ status: 'waiting' });
    _showHostRoundScreen();
  }, 4000);
}


// ══════════════════════════════════════════════════════
// ERROR RECOVERY — Redo This Round
// Clears submissions, resets to waiting, restarts same round
// ══════════════════════════════════════════════════════
function hostRedoRound() {
  var ok = confirm(
    'Round ' + _hostRound + ' redo કરવો છે?\n' +
    'બધા submissions clear થઈ જશે.'
  );
  if (!ok) return;

  // Stop watching old submissions
  gameRef.child('submissions/round_' + _hostRound).off();

  // Clear this round's submissions from Firebase
  gameRef.child('submissions/round_' + _hostRound).remove();

  // Send players back to waiting room
  gameRef.update({ status: 'waiting' });

  // Re-show same round after short delay
  setTimeout(function () {
    _showHostRoundScreen();
  }, 800);
}


// ══════════════════════════════════════════════════════
// ERROR RECOVERY — Skip This Round
// Moves to next round without counting this one
// ══════════════════════════════════════════════════════
function hostSkipRound() {
  var ok = confirm(
    'Round ' + _hostRound + ' skip કરવો છે?\n' +
    'આ round ની scores count નહીં થાય.'
  );
  if (!ok) return;

  // Stop watching submissions
  gameRef.child('submissions/round_' + _hostRound).off();

  // Clear this round's data
  gameRef.child('submissions/round_' + _hostRound).remove();

  if (_hostRound >= _selectedRounds) {
    _hostGameOver();
    return;
  }

  _hostRound++;
  gameRef.update({ status: 'waiting', currentRound: _hostRound });
  _showHostRoundScreen();
}


// ══════════════════════════════════════════════════════
// STEP 8 — Game Over
// ══════════════════════════════════════════════════════
function _hostGameOver() {
  gameRef.update({ status: 'leaderboard' });
  showScreen('host-gameover');

  // Combine scores from all rounds
  var combined = {};
  var fetches  = [];

  for (var r = 1; r <= _selectedRounds; r++) {
    fetches.push(gameRef.child('submissions/round_' + r).once('value'));
  }

  Promise.all(fetches).then(function (snaps) {
    snaps.forEach(function (snap) {
      var data = snap.val() || {};
      Object.keys(data).forEach(function (uid) {
        var s = data[uid];
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
// STEP 9 — New Game
// ══════════════════════════════════════════════════════
function hostNewGame() {
  gameRef.set({
    status        : 'waiting',
    currentRound  : 1,
    totalRounds   : _selectedRounds,
    roundStartTime: 0,
    players       : null,
    submissions   : null
  });

  _hostRound   = 1;
  _roundActive = false;
  _showHostRoundScreen();
  showScreen('host-round');
}
