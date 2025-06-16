// crickscore.js

let teamA = '', teamB = '', totalOvers = 2;
let innings = 1, target = 0, battingTeam = '', bowlingTeam = '';
let score = 0, wickets = 0, balls = 0, legByeCount = 0;
let batsmen = [], currentBatsman = null;
let bowler = { name: '', balls: 0, runs: 0, wickets: 0 };

function startMatch() {
  teamA = document.getElementById("teamA").value || "Team A";
  teamB = document.getElementById("teamB").value || "Team B";
  totalOvers = parseInt(document.getElementById("totalOvers").value) || 2;
  innings = 1;
  startInnings(teamA, teamB);
}

function startInnings(batting, bowling) {
  battingTeam = batting;
  bowlingTeam = bowling;
  score = 0; wickets = 0; balls = 0; legByeCount = 0;
  batsmen = [];

  const batsmanName = prompt("Enter first batsman name:");
  const bowlerName = prompt("Enter bowler name:");
  bowler = { name: bowlerName || 'Bowler', balls: 0, runs: 0, wickets: 0 };
  currentBatsman = { name: batsmanName || 'Batsman', runs: 0, balls: 0, fours: 0, sixes: 0 };
  batsmen.push(currentBatsman);

  document.getElementById("matchTeams").innerText = `${teamA} vs ${teamB}`;
  document.getElementById("matchPanel").classList.remove("hidden");
  document.getElementById("scoreboard").classList.remove("hidden");
  document.getElementById("summary").classList.add("hidden");
  document.getElementById("currentInnings").innerText = innings;
  document.getElementById("battingTeamLabel").innerText = battingTeam;
  updateDisplay();
}

function addRun(run) {
  score += run;
  currentBatsman.runs += run;
  currentBatsman.balls++;
  if (run === 4) currentBatsman.fours++;
  if (run === 6) currentBatsman.sixes++;
  bowler.runs += run;
  nextBall();
}

function addWide() {
  score++;
  bowler.runs++;
  updateDisplay();
}

function addLegBye() {
  legByeCount++;
  if (legByeCount >= 3) {
    alert("Out due to 3 Leg Byes!");
    legByeCount = 0;
    addWicket();
  } else {
    nextBall();
  }
}

function addWicket() {
  wickets++;
  bowler.wickets++;
  currentBatsman.balls++;
  nextBall();
  setTimeout(() => {
    const newName = prompt("New Batsman Name:");
    currentBatsman = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    batsmen.push(currentBatsman);
    updateDisplay();
  }, 100);
}

function nextBall() {
  balls++;
  bowler.balls++;
  updateDisplay();
  const totalBalls = totalOvers * 6;
  if (balls >= totalBalls || wickets >= 10 || (innings === 2 && score > target)) {
    endMatch();
  }
}

function endMatch() {
  if (innings === 1) {
    target = score + 1;
    innings = 2;
    alert(`${battingTeam} scored ${score}/${wickets}. ${bowlingTeam} needs ${target} to win.`);
    startInnings(bowlingTeam, battingTeam);
  } else {
    document.getElementById("summary").classList.remove("hidden");
    let result;
    if (score > target - 1) result = `${battingTeam} won by ${10 - wickets} wickets!`;
    else if (score < target - 1) result = `${bowlingTeam} won by ${target - 1 - score} runs!`;
    else result = "Match Tied!";
    document.getElementById("winner").innerText = result;
    saveHistory(`${teamA} vs ${teamB}: ${result}`);
  }
}

function updateDisplay() {
  const overStr = `${Math.floor(balls / 6)}.${balls % 6}`;
  const runRate = (balls ? (score / (balls / 6)).toFixed(2) : '0.00');
  const oversLeft = `${Math.floor(totalOvers - balls / 6)}.${(6 - balls % 6) % 6}`;

  document.getElementById("score").innerText = `${score}/${wickets}`;
  document.getElementById("overs").innerText = overStr;
  document.getElementById("runRate").innerText = runRate;
  document.getElementById("oversLeft").innerText = oversLeft;
  document.getElementById("battingTeamLabel").innerText = battingTeam;
  updateScoreboard();
}

function updateScoreboard() {
  const bTable = document.getElementById("batsmanTable");
  bTable.innerHTML = batsmen.map(b => `
    <tr>
      <td class="border px-2">${b.name}</td>
      <td class="border px-2">${b.runs}</td>
      <td class="border px-2">${b.balls}</td>
      <td class="border px-2">${b.fours}</td>
      <td class="border px-2">${b.sixes}</td>
    </tr>`).join('');

  const overStr = `${Math.floor(bowler.balls / 6)}.${bowler.balls % 6}`;
  document.getElementById("bowlerTable").innerHTML = `
    <tr>
      <td class="border px-2">${bowler.name}</td>
      <td class="border px-2">${overStr}</td>
      <td class="border px-2">${bowler.runs}</td>
      <td class="border px-2">${bowler.wickets}</td>
    </tr>`;
}

function saveHistory(summary) {
  const history = JSON.parse(localStorage.getItem("matchHistory") || "[]");
  history.unshift(summary);
  localStorage.setItem("matchHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("matchHistory") || "[]");
  document.getElementById("matchHistory").innerHTML = history.map(s => `<li>${s}</li>`).join('');
}

renderHistory();
