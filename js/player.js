// ══════════════════════════════════════════════════════
// js/player.js — Player screen logic
// ══════════════════════════════════════════════════════


// ── Per-round state variables ─────────────────────────
var selectedAnswers       = [-1, -1, -1, -1, -1]; // player's chosen option per question (-1 = not answered)
var answeredCount         = 0;                     // how many questions answered so far
var hasSubmitted          = false;                 // true after SUBMIT tapped
var currentRoundQuestions = [];                    // 5 questions for this round
var _currentRound         = 1;                     // current round number


// ══════════════════════════════════════════════════════
// On Page Load
// ══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {

  // Pre-fill name if player visited before
  if (myName) {
    document.getElementById('player-name').value = myName;
  }

  // Join button click
  document.getElementById('btn-join').addEventListener('click', handleJoin);

  // Allow pressing Enter on name input
  document.getElementById('player-name').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleJoin();
  });

  // All option buttons (A B C D) for all 5 questions
  document.querySelectorAll('.opt-btn').forEach(function (btn) {
    btn.addEventListener('click', handleOptionClick);
  });

  // Submit button
  document.getElementById('btn-submit').addEventListener('click', handleSubmit);
});


// ══════════════════════════════════════════════════════
// STEP 1 — Handle Name Entry
// ══════════════════════════════════════════════════════
function handleJoin() {
  var input = document.getElementById('player-name');
  var name  = input.value.trim();

  // Validate — name must not be empty
  if (!name) {
    document.getElementById('join-error').classList.remove('hidden');
    return;
  }

  // Save name in memory + localStorage (survives refresh)
  myName = name;
  localStorage.setItem('fff_name', myName);

  document.getElementById('join-error').classList.add('hidden');
  document.getElementById('display-name').textContent = myName;

  showScreen('screen-waiting');

  // Load questions from Google Sheets, then connect to Firebase
  loadQuestions().then(function (success) {
    if (!success) {
      alert('⚠️ Questions load failed! Internet check કરો.');
      return;
    }
    joinGame();   // connect to Firebase
  });
}


// ══════════════════════════════════════════════════════
// STEP 2 — Register Player + Listen for Game Events
// ══════════════════════════════════════════════════════
function joinGame() {

  // Add this player to Firebase: /game/players/myUID
  gameRef.child('players/' + myUID).set({
    name : myName,
    score: 0
  });

  // Show live player count in waiting room
  gameRef.child('players').on('value', function (snap) {
    var el = document.getElementById('player-count');
    if (el) el.textContent = '👥 ' + snap.numChildren() + ' players joined';
  });

  // Always know the current round number
  gameRef.child('currentRound').on('value', function (snap) {
    _currentRound = snap.val() || 1;
  });

  // ── Main listener: react when host changes game status ──
  // "waiting"     → back to waiting room
  // "active"      → show 5 questions
  // "reveal"      → show correct / wrong answers
  // "leaderboard" → show scores
  gameRef.child('status').on('value', function (snap) {
    var status = snap.val();
    if (!status) return;

    if      (status === 'active')      startRound();
    else if (status === 'reveal')      revealAnswers();
    else if (status === 'leaderboard') showLeaderboard();
    else if (status === 'waiting')     resetForNextRound();
  });
}


// ══════════════════════════════════════════════════════
// STEP 3 — Start Round: fill 5 question cards
// ══════════════════════════════════════════════════════
function startRound() {

  // Get this round's 5 questions from allQuestions array
  currentRoundQuestions = getRoundQuestions(_currentRound);

  // Reset all per-round state
  selectedAnswers = [-1, -1, -1, -1, -1];
  answeredCount   = 0;
  hasSubmitted    = false;

  // Update UI labels
  document.getElementById('round-label').textContent   = 'Round ' + _currentRound;
  document.getElementById('answered-count').textContent = '0 / 5 answered';
  document.getElementById('btn-submit').disabled        = true;
  document.getElementById('btn-submit').textContent     = '🚀 SUBMIT';

  // Fill each of the 5 question cards
  currentRoundQuestions.forEach(function (q, i) {

    // Set question text
    document.getElementById('q-text-' + i).textContent = q.question;

    // Set 4 option texts (A, B, C, D)
    q.items.forEach(function (item, j) {
      document.getElementById('q' + i + '-opt' + j).textContent = item;
    });

    // Clear any old styles from previous round
    var block = document.getElementById('q-block-' + i);
    block.classList.remove('answered');
    block.querySelectorAll('.opt-btn').forEach(function (btn) {
      btn.classList.remove('selected', 'reveal-correct', 'reveal-wrong');
      btn.disabled = false;
    });
  });

  showScreen('screen-questions');
}


// ══════════════════════════════════════════════════════
// STEP 4 — Handle Option Button Tap (A / B / C / D)
// ══════════════════════════════════════════════════════
function handleOptionClick(e) {
  if (hasSubmitted) return;   // ignore taps after submit

  var btn    = e.currentTarget;
  var qIdx   = parseInt(btn.getAttribute('data-q')); // which question (0-4)
  var optIdx = parseInt(btn.getAttribute('data-i')); // which option (0-3)

  // Remove highlight from all buttons in this question
  document.getElementById('q-block-' + qIdx)
    .querySelectorAll('.opt-btn')
    .forEach(function (b) { b.classList.remove('selected'); });

  // Highlight tapped button
  btn.classList.add('selected');

  // First time answering this question → increase count
  if (selectedAnswers[qIdx] === -1) {
    answeredCount++;
    document.getElementById('q-block-' + qIdx).classList.add('answered'); // gold border
  }

  // Save chosen option
  selectedAnswers[qIdx] = optIdx;

  // Update "X / 5 answered" label
  document.getElementById('answered-count').textContent = answeredCount + ' / 5 answered';

  // Enable SUBMIT only when all 5 questions answered
  document.getElementById('btn-submit').disabled = (answeredCount < 5);
}


// ══════════════════════════════════════════════════════
// STEP 5 — Handle SUBMIT button tap
// ══════════════════════════════════════════════════════
function handleSubmit() {
  if (hasSubmitted)    return;
  if (answeredCount < 5) return;

  hasSubmitted = true;

  var submitTime = Date.now(); // exact timestamp this player tapped SUBMIT

  // Get round start time from Firebase to calculate how long player took
  gameRef.child('roundStartTime').once('value', function (snap) {
    var startTime = snap.val() || submitTime;
    var timeTaken = submitTime - startTime;             // milliseconds
    var score     = calcScore(selectedAnswers, currentRoundQuestions); // 0-5

    // Save submission to Firebase
    // Path: /game/submissions/round_1/playerUID
    gameRef.child('submissions/round_' + _currentRound + '/' + myUID).set({
      name      : myName,
      answers   : selectedAnswers,  // e.g. [1, 0, 2, 1, 2]
      submitTime: submitTime,
      timeTaken : timeTaken,        // e.g. 8432 ms
      score     : score             // e.g. 4
    });

    // Show "Submitted!" screen with time + score
    document.getElementById('submit-time-label').textContent =
      '⏱ ' + formatTime(timeTaken) + '   |   ' + score + ' / 5 સાચા';

    showScreen('screen-submitted');
  });
}


// ══════════════════════════════════════════════════════
// STEP 6 — Reveal Answers (host pressed "Reveal")
// ══════════════════════════════════════════════════════
function revealAnswers() {

  // Go back to question screen to show colors
  showScreen('screen-questions');

  document.getElementById('btn-submit').disabled    = true;
  document.getElementById('btn-submit').textContent = '✅ Revealed';

  currentRoundQuestions.forEach(function (q, i) {
    var block = document.getElementById('q-block-' + i);
    block.classList.remove('answered');

    block.querySelectorAll('.opt-btn').forEach(function (btn) {
      var optIdx = parseInt(btn.getAttribute('data-i'));
      btn.disabled = true;
      btn.classList.remove('selected');

      if (optIdx === q.correct) {
        // Always highlight correct answer in green
        btn.classList.add('reveal-correct');

      } else if (optIdx === selectedAnswers[i]) {
        // Player picked this wrong answer — highlight in red
        btn.classList.add('reveal-wrong');
      }
    });
  });
}


// ══════════════════════════════════════════════════════
// STEP 7 — Show Leaderboard
// ══════════════════════════════════════════════════════
function showLeaderboard() {

  // Read all submissions for this round from Firebase
  gameRef.child('submissions/round_' + _currentRound)
    .once('value', function (snap) {
      var rows = buildLeaderboard(snap.val() || {});
      renderLeaderboard('leaderboard-list', rows);

      document.getElementById('result-status').textContent =
        'Host આગળ ની round શરૂ કરશે...';

      showScreen('screen-result');
    });
}


// ══════════════════════════════════════════════════════
// STEP 8 — Reset for Next Round
// ══════════════════════════════════════════════════════
function resetForNextRound() {
  selectedAnswers = [-1, -1, -1, -1, -1];
  answeredCount   = 0;
  hasSubmitted    = false;
  document.getElementById('btn-submit').textContent = '🚀 SUBMIT';

  // Only go back to waiting if not on join screen
  var active = document.querySelector('.screen.active');
  if (active && active.id !== 'screen-join') {
    showScreen('screen-waiting');
  }
}
