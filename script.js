let score = 0;
let wickets = 0;
let balls = 0;
let teamA = "";

function startMatch() {
  teamA = document.getElementById("teamA").value;
  const teamB = document.getElementById("teamB").value;

  if (!teamA || !teamB) {
    alert("Please enter both team names.");
    return;
  }

  document.querySelector(".match-setup").style.display = "none";
  document.querySelector(".score-panel").style.display = "block";
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const overs = Math.floor(balls / 6);
  const ballsInOver = balls % 6;
  document.getElementById("scoreDisplay").innerText = `${teamA}: ${score}/${wickets} (${overs}.${ballsInOver})`;
}

function addRun(runs) {
  score += runs;
  balls++;
  updateScoreDisplay();
}

function addWicket() {
  wickets++;
  balls++;
  updateScoreDisplay();
}

function nextBall() {
  balls++;
  updateScoreDisplay();
}
