let score = 0, wickets = 0, balls = 0, oversLimit = 0;
let teamA = '', teamB = '';
let batsmen = [], currentBatsman = null;

let bowlers = []; // multiple bowlers
let currentBowlerIndex = 0;
let legByeCount = 0;

function startMatch() {
  teamA = document.getElementById("teamA").value || "Team A";
  teamB = document.getElementById("teamB").value || "Team B";
  oversLimit = parseInt(document.getElementById("totalOvers").value) || 2;
  score = 0; wickets = 0; balls = 0; legByeCount = 0;
  batsmen = [];
  bowlers = [];
  currentBowlerIndex = 0;

  let batsmanName = prompt("Enter first batsman name:");
  currentBatsman = { name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
  batsmen.push(currentBatsman);

  // Get multiple bowler names
  let bowlerNames = prompt("Enter bowler names (comma separated):");
  let bowlerList = (bowlerNames || "Bowler 1").split(",").map(name => name.trim());
  bowlers = bowlerList.map(name => ({ name, balls: 0, runs: 0, wickets: 0 }));

  document.getElementById("matchTeams").innerText = `${teamA} vs ${teamB}`;
  document.getElementById("matchPanel").classList.remove("hidden");
  document.getElementById("summary").classList.add("hidden");
  document.getElementById("scoreboard").classList.remove("hidden");
  updateDisplay();
}

function getCurrentBowler() {
  return bowlers[currentBowlerIndex];
}

function switchBowlerIfNeeded() {
  if (balls % 6 === 0 && balls !== 0) {
    currentBowlerIndex = (currentBowlerIndex + 1) % bowlers.length;
  }
}

function addRun(run) {
  score += run;
  currentBatsman.runs += run;
  currentBatsman.balls += 1;

  const bowler = getCurrentBowler();
  bowler.runs += run;

  if (run === 4) currentBatsman.fours += 1;
  if (run === 6) currentBatsman.sixes += 1;

  nextBall();
}

function addWide() {
  score += 1;
  getCurrentBowler().runs += 1;
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
  const bowler = getCurrentBowler();
  bowler.wickets++;
  currentBatsman.balls += 1;

  nextBall();

  setTimeout(() => {
    let newName = prompt("New Batsman Name:");
    currentBatsman = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    batsmen.push(currentBatsman);
  }, 100);
}

function nextBall() {
  balls++;
  getCurrentBowler().balls++;
  switchBowlerIfNeeded();
  updateDisplay();

  const totalBalls = oversLimit * 6;
  if (balls >= totalBalls || wickets >= 10) {
    endMatch();
  }
}

function endMatch() {
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  const winner = `${teamA} scored ${score}/${wickets} in ${overs} overs.`;
  document.getElementById("summary").classList.remove("hidden");
  document.getElementById("winner").innerText = winner;
  saveHistory(winner);
}

function updateDisplay() {
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  const runRate = (score / (balls / 6 || 1)).toFixed(2);
  const oversLeft = (oversLimit - Math.floor(balls / 6)) + "." + (6 - (balls % 6)) % 6;

  document.getElementById("score").innerText = `${score}/${wickets}`;
  document.getElementById("overs").innerText = overs;
  document.getElementById("runRate").innerText = runRate;
  document.getElementById("oversLeft").innerText = oversLeft;

  updateScoreboard();
}

function updateScoreboard() {
  const bTable = document.getElementById("batsmanTable");
  bTable.innerHTML = batsmen.map(p =>
    `<tr>
      <td class="border px-2">${p.name}</td>
      <td class="border px-2">${p.runs}</td>
      <td class="border px-2">${p.balls}</td>
      <td class="border px-2">${p.fours}</td>
      <td class="border px-2">${p.sixes}</td>
    </tr>`).join('');

  const bowlerTable = bowlers.map(b => {
    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
    return `
      <tr>
        <td class="border px-2">${b.name}</td>
        <td class="border px-2">${overs}</td>
        <td class="border px-2">${b.runs}</td>
        <td class="border px-2">${b.wickets}</td>
      </tr>
    `;
  }).join('');

  document.getElementById("bowlerTable").innerHTML = bowlerTable;
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
