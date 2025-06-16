// CrickScore Full JavaScript Logic with Second Innings, Undo, Wide, Leg Bye, Multiple Bowlers

let score = 0, wickets = 0, balls = 0, oversLimit = 0;
let teamA = '', teamB = '';
let batsmen = [], currentBatsman = null;
let bowlers = [], currentBowlerIndex = 0;
let legByeCount = 0, historyStack = [];
let innings = 1, firstInningsData = null, matchOver = false;

function startMatch() {
  teamA = document.getElementById("teamA").value || "Team A";
  teamB = document.getElementById("teamB").value || "Team B";
  oversLimit = parseInt(document.getElementById("totalOvers").value) || 2;
  score = 0; wickets = 0; balls = 0; legByeCount = 0; historyStack = [];
  batsmen = []; bowlers = []; currentBowlerIndex = 0;
  innings = 1; firstInningsData = null; matchOver = false;

  let batsmanName = prompt("Enter first batsman name:");
  currentBatsman = { name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
  batsmen.push(currentBatsman);

  for (let i = 1; i <= 11; i++) {
    let bname = prompt(`Enter name of bowler ${i} (or leave blank to stop):`);
    if (!bname) break;
    bowlers.push({ name: bname, balls: 0, runs: 0, wickets: 0 });
  }

  document.getElementById("matchTeams").innerText = `${teamA} vs ${teamB}`;
  document.getElementById("matchPanel").classList.remove("hidden");
  document.getElementById("summary").classList.add("hidden");
  document.getElementById("scoreboard").classList.remove("hidden");
  updateDisplay();
}

function addRun(run) {
  if (matchOver) return;
  saveState();
  score += run;
  currentBatsman.runs += run;
  currentBatsman.balls++;
  if (run === 4) currentBatsman.fours++;
  if (run === 6) currentBatsman.sixes++;
  bowlers[currentBowlerIndex].runs += run;
  nextBall();
}

function addWide() {
  if (matchOver) return;
  saveState();
  score++;
  bowlers[currentBowlerIndex].runs++;
  updateDisplay();
}

function addLegBye() {
  if (matchOver) return;
  saveState();
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
  if (matchOver) return;
  saveState();
  wickets++;
  bowlers[currentBowlerIndex].wickets++;
  currentBatsman.balls++;
  nextBall();
  setTimeout(() => {
    if (wickets < 10) {
      let newName = prompt("New Batsman Name:");
      currentBatsman = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      batsmen.push(currentBatsman);
      updateDisplay();
    }
  }, 100);
}

function nextBall() {
  balls++;
  bowlers[currentBowlerIndex].balls++;
  if (bowlers[currentBowlerIndex].balls % 6 === 0) {
    currentBowlerIndex = (currentBowlerIndex + 1) % bowlers.length;
    alert(`New Bowler: ${bowlers[currentBowlerIndex].name}`);
  }

  if (innings === 2 && firstInningsData && score > firstInningsData.score) {
    endMatch();
    return;
  }

  const totalBalls = oversLimit * 6;
  if (balls >= totalBalls || wickets >= 10) {
    endMatch();
  } else {
    updateDisplay();
  }
}

function undoLastBall() {
  if (historyStack.length === 0 || matchOver) return alert("Nothing to undo");
  const last = JSON.parse(historyStack.pop());
  ({ score, wickets, balls, legByeCount, batsmen, bowlers } = last);
  currentBatsman = batsmen[batsmen.length - 1];
  updateDisplay();
}

function endMatch() {
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  matchOver = true;
  if (innings === 1) {
    firstInningsData = {
      score, wickets, overs,
      batsmen: JSON.parse(JSON.stringify(batsmen)),
      bowlers: JSON.parse(JSON.stringify(bowlers))
    };
    innings = 2;
    alert(`End of 1st Innings.\n${teamA} scored ${score}/${wickets} in ${overs} overs.\nTarget for ${teamB}: ${score + 1}`);

    // Reset for second innings
    score = 0; wickets = 0; balls = 0; legByeCount = 0;
    batsmen = []; bowlers = []; currentBowlerIndex = 0; historyStack = [];
    matchOver = false;

    let batsmanName = prompt("Enter first batsman for 2nd innings:");
    currentBatsman = { name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    batsmen.push(currentBatsman);

    for (let i = 1; i <= 11; i++) {
      let bname = prompt(`Enter name of bowler ${i} (2nd innings) or leave blank:`);
      if (!bname) break;
      bowlers.push({ name: bname, balls: 0, runs: 0, wickets: 0 });
    }
    updateDisplay();
  } else {
    let result;
    if (score > firstInningsData.score) {
      result = `${teamB} won by ${10 - wickets} wickets!`;
    } else if (score < firstInningsData.score) {
      result = `${teamA} won by ${firstInningsData.score - score} runs!`;
    } else {
      result = "Match Tied!";
    }
    document.getElementById("summary").classList.remove("hidden");
    document.getElementById("winner").innerText = result;
    saveHistory(result);
  }
}

function saveState() {
  historyStack.push(JSON.stringify({
    score, wickets, balls, legByeCount,
    batsmen: JSON.parse(JSON.stringify(batsmen)),
    bowlers: JSON.parse(JSON.stringify(bowlers))
  }));
}

function updateDisplay() {
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  const runRate = (score / (balls / 6 || 1)).toFixed(2);
  const oversLeft = ((oversLimit * 6 - balls) / 6).toFixed(1);

  document.getElementById("score").innerText = `${score}/${wickets}`;
  document.getElementById("overs").innerText = overs;
  document.getElementById("runRate").innerText = runRate;
  document.getElementById("oversLeft").innerText = oversLeft;
  updateScoreboard();
}

function updateScoreboard() {
  const bTable = document.getElementById("batsmanTable");
  bTable.innerHTML = batsmen.map(p =>
    `<tr><td class="border px-2">${p.name}</td><td class="border px-2">${p.runs}</td><td class="border px-2">${p.balls}</td><td class="border px-2">${p.fours}</td><td class="border px-2">${p.sixes}</td></tr>`).join('');

  const bowlerTable = document.getElementById("bowlerTable");
  bowlerTable.innerHTML = bowlers.map(b => {
    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
    return `<tr><td class="border px-2">${b.name}</td><td class="border px-2">${overs}</td><td class="border px-2">${b.runs}</td><td class="border px-2">${b.wickets}</td></tr>`;
  }).join('');
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
